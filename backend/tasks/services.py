def update_task_status(task):
    deps = TaskDependency.objects.filter(task=task).select_related("depends_on")

    if deps.filter(depends_on__status="blocked").exists():
        task.status = "blocked"
    elif deps.exists() and deps.filter(depends_on__status="completed").count() == deps.count():
        task.status = "in_progress"
    elif deps.exists():
        task.status = "pending"

    task.save()
