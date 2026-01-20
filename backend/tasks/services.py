from .models import Task, TaskDependency

def recompute_task_status(task: Task):
    """
    Update task.status based on dependency statuses
    """

    dependencies = TaskDependency.objects.filter(task=task).select_related("depends_on")

    # No dependencies → do nothing
    if not dependencies.exists():
        return

    dep_statuses = [dep.depends_on.status for dep in dependencies]

    # Rule 1: ANY blocked → blocked
    if "blocked" in dep_statuses:
        if task.status != "blocked":
            task.status = "blocked"
            task.save()
        return

    # Rule 2: ALL completed → in_progress (ready)
    if all(status == "completed" for status in dep_statuses):
        if task.status != "in_progress":
            task.status = "in_progress"
            task.save()
        return

    # Rule 3: Otherwise → pending
    if task.status != "pending":
        task.status = "pending"
        task.save()
