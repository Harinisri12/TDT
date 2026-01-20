from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Task
from .serializers import TaskSerializer
from .utils import has_cycle

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer

    def update(self, request, *args, **kwargs):
        task = self.get_object()
        deps = request.data.get('dependencies', [])

        for dep_id in deps:
            dep_task = Task.objects.get(id=dep_id)
            if has_cycle(task, dep_task):
                return Response(
                    {"error": "Circular dependency detected"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        return super().update(request, *args, **kwargs)
