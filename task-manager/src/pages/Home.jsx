import TaskCard from "../components/TaskCard.jsx";

const DEMO_TASKS = [
  { id: 1, title: "Set up routing", status: "In Progress" },
  { id: 2, title: "Design task schema", status: "Backlog" },
  { id: 3, title: "Implement task detail view", status: "Blocked" },
];

export default function Home() {
  return (
    <div>
      <h1>Demo tasks:</h1>
      <p>
        Click a task to navigate to its detail page. Clicking changes the URL to <code>/task/:id</code>.
      </p>

      <ul>
        {DEMO_TASKS.map((task) => (
          <li key={task.id}>
            <TaskCard task={task} />
          </li>
        ))}
      </ul>
    </div>
  );
}
