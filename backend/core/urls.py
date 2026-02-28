from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('auth/', include('authentication.urls')),
    path('teams/', include('teams.urls')),
    path('tasks/', include('tasks.urls')),
]


