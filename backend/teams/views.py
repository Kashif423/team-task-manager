from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from .models import Team


class TeamListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        teams = Team.objects.filter(members=request.user) | Team.objects.filter(owner=request.user)
        teams = teams.distinct()
        data = [{
            'id': t.id,
            'name': t.name,
            'description': t.description,
            'owner': t.owner.username,
            'members': [{'id': m.id, 'username': m.username} for m in t.members.all()],
            'created_at': t.created_at,
        } for t in teams]
        return Response(data)

    def post(self, request):
        name = request.data.get('name', '').strip()
        description = request.data.get('description', '').strip()

        if not name:
            return Response({'error': 'Team name is required.'}, status=400)
        if Team.objects.filter(name=name, owner=request.user).exists():
            return Response({'error': 'You already have a team with this name.'}, status=400)

        team = Team.objects.create(name=name, description=description, owner=request.user)
        team.members.add(request.user)
        return Response({
            'id': team.id,
            'name': team.name,
            'description': team.description,
            'owner': team.owner.username,
            'members': [{'id': m.id, 'username': m.username} for m in team.members.all()],
        }, status=201)


class TeamDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_team(self, pk, user):
        try:
            team = Team.objects.get(pk=pk)
            if not (team.owner == user or team.members.filter(id=user.id).exists()):
                return None, Response({'error': 'Access denied.'}, status=403)
            return team, None
        except Team.DoesNotExist:
            return None, Response({'error': 'Team not found.'}, status=404)

    def get(self, request, pk):
        team, err = self.get_team(pk, request.user)
        if err: return err
        return Response({
            'id': team.id,
            'name': team.name,
            'description': team.description,
            'owner': team.owner.username,
            'members': [{'id': m.id, 'username': m.username} for m in team.members.all()],
        })

    def put(self, request, pk):
        team, err = self.get_team(pk, request.user)
        if err: return err
        if team.owner != request.user:
            return Response({'error': 'Only the owner can edit this team.'}, status=403)

        team.name = request.data.get('name', team.name).strip()
        team.description = request.data.get('description', team.description).strip()
        team.save()
        return Response({'message': 'Team updated.', 'name': team.name})

    def delete(self, request, pk):
        team, err = self.get_team(pk, request.user)
        if err: return err
        if team.owner != request.user:
            return Response({'error': 'Only the owner can delete this team.'}, status=403)
        team.delete()
        return Response({'message': 'Team deleted.'})


class AddMemberView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            team = Team.objects.get(pk=pk)
        except Team.DoesNotExist:
            return Response({'error': 'Team not found.'}, status=404)

        if team.owner != request.user:
            return Response({'error': 'Only the owner can add members.'}, status=403)

        username = request.data.get('username', '').strip()
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=404)

        team.members.add(user)
        return Response({'message': f'{username} added to team.'})
