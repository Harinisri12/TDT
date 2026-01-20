from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Task, TaskDependency
from .serializers import TaskSerializer
from .utils import detect_cycle, recompute_task_status


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer

    @action(detail=True, methods=["post"])
    def dependencies(self, request, pk=None):
        task = self.get_object()
        depends_on_id = request.data.get("depends_on_id")

        if not depends_on_id:
            return Response(
                {"error": "depends_on_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if task.id == depends_on_id:
            return Response(
                {"error": "Task cannot depend on itself"},
                status=status.HTTP_400_BAD_REQUEST
            )

        cycle = detect_cycle(
            start_id=task.id,
            current_id=depends_on_id,
            path=[task.id],
            visited=set()
        )

        if cycle:
            return Response(
                {
                    "error": "Circular dependency detected",
                    "path": cycle
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        TaskDependency.objects.create(
            task_id=task.id,
            depends_on_id=depends_on_id
        )

        recompute_task_status(task)

        return Response(
            {"message": "Dependency added successfully"},
            status=status.HTTP_201_CREATED
        )

    def perform_update(self, serializer):
        task = serializer.save()

        if task.status == "completed":
            dependent_links = TaskDependency.objects.filter(depends_on=task)

            for link in dependent_links:
                recompute_task_status(link.task)
