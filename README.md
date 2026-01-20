# Task Dependency Management System

A full-stack **Task Dependency Management System** where tasks can depend on other tasks, circular dependencies are detected automatically, task statuses update based on dependencies, and dependencies are visualized as a graph.

---

## 🚀 Running the Project

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate     # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Backend runs at:

```
http://127.0.0.1:8000
```

---

### Frontend Setup

```bash
cd task-dependency-frontend
npm install
npm start
```

Frontend runs at:

```
http://localhost:3000
```

---

## 🔗 API Endpoints

### Tasks

| Method | Endpoint                       | Description                                   |
| ------ | ------------------------------ | --------------------------------------------- |
| GET    | `/api/tasks/`                  | Fetch all tasks                               |
| POST   | `/api/tasks/`                  | Create a new task                             |
| PATCH  | `/api/tasks/{id}/`             | Update task status                            |
| DELETE | `/api/tasks/{id}/`             | Delete a task                                 |
| POST   | `/api/tasks/{id}/auto-update/` | Auto-update task status based on dependencies |

---

### Dependencies

Add a dependency to a task:

```
POST /api/tasks/{task_id}/dependencies/
```

**Request Body**

```json
{
  "depends_on_id": 5
}
```

**Error Response (Circular Dependency Detected)**

```json
{
  "error": "Circular dependency detected",
  "path": [1, 3, 5, 1]
}
```

---

## 📊 Features

* Create, update, and delete tasks
* Add multiple dependencies to tasks
* Detect and prevent circular dependencies using Depth-First Search (DFS)
* Auto-update task status based on dependency completion (backend + UI)
* Dependency graph visualization using SVG
* Confirmation modal before deleting dependent tasks
* User-friendly success and error messages

---

## 🧪 Example Workflow

1. Create two tasks **A** and **B**
2. Add dependency: **B depends on A**
3. Mark task **A** as `completed`
4. Task **B** automatically moves to `in_progress`

This demonstrates automatic dependency-based status updates.

---

## 🧠 Tech Stack

### Frontend

* React 18 (Hooks)
* SVG for dependency graph visualization
* Custom state management
* No external graph libraries

### Backend

* Django
* Django REST Framework
* RESTful API design
* SQLite database

---

## 📌 Notes

* Circular dependency detection is implemented using **Depth-First Search (DFS)**
* The exact cycle path is returned when a cycle is detected
* Graph visualization is non-interactive and rendered using SVG
* UI focuses on clarity, usability, and real-time updates
