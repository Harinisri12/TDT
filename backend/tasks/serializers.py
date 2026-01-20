from rest_framework import serializers
from .models import Task


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
            "created_at",
            "updated_at",
        ]

    def get_dependencies(self, obj):
        """
        Returns a list of task IDs that this task depends on
        """
        return list(
            obj.dependencies.values_list("depends_on_id", flat=True)
        )
