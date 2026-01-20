def has_cycle(task, dependency):
    if task == dependency:
        return True

    for dep in dependency.dependencies.all():
        if has_cycle(task, dep):
            return True

    return False
