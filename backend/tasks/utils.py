from .models import Task, TaskDependency


def detect_cycle(start_id, current_id, path, visited):
    """
    DFS to detect circular dependencies.
    Returns cycle path if found, else None.
    """

    if current_id in path:
        cycle_start = path.index(current_id)
        return path[cycle_start:] + [current_id]

    if current_id in visited:
        return None

    visited.add(current_id)
    path.append(current_id)

    dependencies = TaskDependency.objects.filter(task_id=current_id)
    for dep in dependencies:
        cycle = detect_cycle(
            start_id=start_id,
            current_id=dep.depends_on_id,
            path=path.copy(),
            visited=visited
        )
        if cycle:
            return cycle

    return None

def recompute_task_status(task: Task):
    """
    Recompute a task's status based on its dependencies.
    """
    dependencies = TaskDependency.objects.filter(task=task)

    if not dependencies.exists():
        return  

    dep_tasks = [d.depends_on for d in dependencies]

    if any(d.status == "blocked" for d in dep_tasks):
        task.status = "blocked"
    elif all(d.status == "completed" for d in dep_tasks):
        task.status = "in_progress"
    else:
        task.status = "pending"

    task.save(update_fields=["status"])


def propagate_status(task: Task):
    """
    Propagate status updates to all dependent tasks (DFS-like).
    """
    dependents = TaskDependency.objects.filter(depends_on=task)

    for dep in dependents:
        recompute_task_status(dep.task)
        propagate_status(dep.task)
