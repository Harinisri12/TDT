from rest_framework import serializers
from .models import Task, TaskDependency


class TaskSerializer(serializers.ModelSerializer):
    dependencies = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = [
            "id",
            "title",
            "description",
            "status",
            "dependencies",
        ]

    def get_dependencies(self, obj):
        # Return list of task IDs this task depends on
        return list(
            obj.dependencies.values_list("depends_on_id", flat=True)
        )
