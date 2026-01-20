import { useState } from "react";
import "./App.css";

function App() {
  const [tasks, setTasks] = useState([
    { id: 1, title: "Design UI", status: "completed" },
    { id: 2, title: "Build frontend", status: "in_progress" },
    { id: 3, title: "Connect backend", status: "pending" },
  ]);

  return (
    <div className="container">
      <h1 className="heading">Task Dependency Manager</h1>

      {tasks.map((task) => (
        <div key={task.id} className="task-card">
          <h3>{task.title}</h3>
          <p className={`status ${task.status}`}>
            Status: {task.status}
          </p>
        </div>
      ))}
    </div>
  );
}

export default App;
