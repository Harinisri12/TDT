from django.db import models

class Task(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("in_progress", "In Progress"),
        ("completed", "Completed"),
        ("blocked", "Blocked"),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending"
    )

    def update_status_based_on_dependencies(self):
        dependencies = self.dependencies.all()

        if not dependencies.exists():
            return

        dep_statuses = [d.depends_on.status for d in dependencies]

        if "blocked" in dep_statuses:
            self.status = "blocked"
        elif all(s == "completed" for s in dep_statuses):
            self.status = "in_progress"
        else:
            self.status = "pending"

    def __str__(self):
        return self.title


class TaskDependency(models.Model):
    task = models.ForeignKey(
        Task, related_name="dependencies", on_delete=models.CASCADE
    )
    depends_on = models.ForeignKey(
        Task, related_name="dependents", on_delete=models.CASCADE
    )

    class Meta:
        unique_together = ("task", "depends_on")

    def __str__(self):
        return f"{self.task} depends on {self.depends_on}"
