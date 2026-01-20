
# Design Decisions

This document explains the key technical and architectural decisions made while building the Task Dependency Management System.

---

## 1. Circular Dependency Detection

### Approach
Circular dependency detection is implemented using **Depth-First Search (DFS)** on the task dependency graph.

When adding a new dependency:
- The algorithm starts from the target dependency (`depends_on_id`)
- It recursively traverses all upstream dependencies
- A `visited` set is maintained to avoid infinite loops
- A `path` list is used to track the traversal route

If the starting task is encountered again during traversal, a cycle is detected and the exact cycle path is returned.

### Why DFS?
- Simple and effective for directed graphs
- Allows easy reconstruction of the cycle path
- Time complexity is optimal for this problem

### Time Complexity
- **O(V + E)**
  - V = number of tasks
  - E = number of dependencies

---

## 2. Data Modeling

### Task
Each task stores only essential fields:
- `title`
- `description`
- `status`
- timestamps

### TaskDependency
Dependencies are modeled as a separate table instead of a self-referential many-to-many field to:
- Keep the schema explicit
- Simplify traversal and querying
- Allow future extension (e.g., dependency types)

---

## 3. Status Propagation Logic

Two helper functions are used:
- `recompute_task_status(task)` – recalculates a task’s status based on its dependencies
- `propagate_status(task)` – updates all tasks that depend on the given task

This ensures:
- Status updates are centralized
- Changes propagate automatically
- Business rules are enforced consistently

---

## 4. Backend-Driven Validation

Critical validations (like circular dependency prevention) are handled on the backend to:
- Prevent invalid data regardless of frontend behavior
- Ensure correctness in concurrent or API-based usage

The frontend only displays messages returned by the backend.

---

## 5. Graph Visualization Choice

The dependency graph is implemented using **SVG** instead of libraries like D3 or Cytoscape because:
- The assignment explicitly disallows external graph libraries
- SVG is lightweight and sufficient for small-to-medium graphs
- It allows full control over rendering and layout

A simple horizontal layout was chosen for clarity and reliability.

---

## 6. Frontend State Management

- React local state (`useState`, `useEffect`, `useCallback`) is sufficient
- Redux/Zustand was avoided to keep the app simple
- Backend is treated as the source of truth

---

## 7. Trade-offs & Future Improvements

If given more time:
- Add arrowheads and interaction to the graph
- Add zoom and pan support
- Improve layout for large graphs
- Add optimistic UI updates
- Add database-level transactions and locking

---

## Conclusion

The system prioritizes correctness, clarity, and robustness over complexity. The design ensures that task dependencies remain valid, statuses remain consistent, and users receive immediate feedback for all actions.
