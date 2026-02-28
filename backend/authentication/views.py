from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
import re

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username', '').strip()
        email = request.data.get('email', '').strip()
        password = request.data.get('password', '')

        # Validation
        if not username or not email or not password:
            return Response({'error': 'All fields are required.'}, status=400)
        if len(password) < 8:
            return Response({'error': 'Password must be at least 8 characters.'}, status=400)
        if not re.match(r'^[^@]+@[^@]+\.[^@]+$', email):
            return Response({'error': 'Invalid email format.'}, status=400)
        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already taken.'}, status=400)
        if User.objects.filter(email=email).exists():
            return Response({'error': 'Email already registered.'}, status=400)

        user = User.objects.create_user(username=username, email=email, password=password)
        login(request, user)
        return Response({
            'message': 'Registered successfully.',
            'user': {'id': user.id, 'username': user.username, 'email': user.email}
        }, status=201)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username', '').strip()
        password = request.data.get('password', '')

        if not username or not password:
            return Response({'error': 'Username and password are required.'}, status=400)

        user = authenticate(request, username=username, password=password)
        if user is None:
            return Response({'error': 'Invalid credentials.'}, status=401)

        login(request, user)
        return Response({
            'message': 'Logged in successfully.',
            'user': {'id': user.id, 'username': user.username, 'email': user.email}
        })


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({'message': 'Logged out successfully.'})


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({'id': user.id, 'username': user.username, 'email': user.email})