from django.http import JsonResponse
from django.contrib import admin
from django.urls import path, include

def home(request):
    return JsonResponse({
        "message": "Task Dependency Tracker API is running"
    })

urlpatterns = [
    path('', home),
    path('admin/', admin.site.urls),
    path('api/', include('tasks.urls')),
]
