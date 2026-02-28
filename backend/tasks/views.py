from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from teams.models import Team
from .models import Task


def task_data(task):
    return {
        'id': task.id,
        'title': task.title,
        'description': task.description,
        'status': task.status,
        'due_date': task.due_date,
        'team': {'id': task.team.id, 'name': task.team.name},
        'assigned_to': {'id': task.assigned_to.id, 'username': task.assigned_to.username} if task.assigned_to else None,
        'created_by': task.created_by.username,
        'created_at': task.created_at,
    }


class TaskListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_teams = Team.objects.filter(members=request.user) | Team.objects.filter(owner=request.user)
        tasks = Task.objects.filter(team__in=user_teams.distinct())

        # Filters
        team_id = request.query_params.get('team')
        assignee_id = request.query_params.get('assignee')
        status_filter = request.query_params.get('status')
        search = request.query_params.get('search')

        if team_id:
            tasks = tasks.filter(team_id=team_id)
        if assignee_id:
            tasks = tasks.filter(assigned_to_id=assignee_id)
        if status_filter:
            tasks = tasks.filter(status=status_filter)
        if search:
            tasks = tasks.filter(title__icontains=search)

        return Response([task_data(t) for t in tasks])

    def post(self, request):
        title = request.data.get('title', '').strip()
        description = request.data.get('description', '').strip()
        team_id = request.data.get('team')
        assigned_to_id = request.data.get('assigned_to')
        status = request.data.get('status', 'todo')
        due_date = request.data.get('due_date')

        if not title:
            return Response({'error': 'Title is required.'}, status=400)
        if not team_id:
            return Response({'error': 'Team is required.'}, status=400)

        try:
            team = Team.objects.get(pk=team_id)
        except Team.DoesNotExist:
            return Response({'error': 'Team not found.'}, status=404)

        if not (team.owner == request.user or team.members.filter(id=request.user.id).exists()):
            return Response({'error': 'You are not a member of this team.'}, status=403)

        assigned_to = None
        if assigned_to_id:
            try:
                assigned_to = User.objects.get(pk=assigned_to_id)
            except User.DoesNotExist:
                return Response({'error': 'Assigned user not found.'}, status=404)

        task = Task.objects.create(
            title=title,
            description=description,
            team=team,
            assigned_to=assigned_to,
            created_by=request.user,
            status=status,
            due_date=due_date if due_date else None,
        )
        return Response(task_data(task), status=201)


class TaskDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_task(self, pk, user):
        try:
            task = Task.objects.get(pk=pk)
            team = task.team
            if not (team.owner == user or team.members.filter(id=user.id).exists()):
                return None, Response({'error': 'Access denied.'}, status=403)
            return task, None
        except Task.DoesNotExist:
            return None, Response({'error': 'Task not found.'}, status=404)

    def get(self, request, pk):
        task, err = self.get_task(pk, request.user)
        if err: return err
        return Response(task_data(task))

    def put(self, request, pk):
        task, err = self.get_task(pk, request.user)
        if err: return err

        task.title = request.data.get('title', task.title).strip()
        task.description = request.data.get('description', task.description)
        task.status = request.data.get('status', task.status)
        task.due_date = request.data.get('due_date', task.due_date)

        assigned_to_id = request.data.get('assigned_to')
        if assigned_to_id:
            try:
                task.assigned_to = User.objects.get(pk=assigned_to_id)
            except User.DoesNotExist:
                return Response({'error': 'Assigned user not found.'}, status=404)

        task.save()
        return Response(task_data(task))

    def delete(self, request, pk):
        task, err = self.get_task(pk, request.user)
        if err: return err
        task.delete()
        return Response({'message': 'Task deleted.'})
