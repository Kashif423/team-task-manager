from django.urls import path
from .views import TeamListCreateView, TeamDetailView, AddMemberView

urlpatterns = [
    path('', TeamListCreateView.as_view()),
    path('<int:pk>/', TeamDetailView.as_view()),
    path('<int:pk>/add-member/', AddMemberView.as_view()),
]