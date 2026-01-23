import { useNavigate } from "react-router-dom";

/**
 * TaskCard is a reusable UI component like we are used to
 */
export default function TaskCard({ task }) {
  // useNavigate() gives you a function to change the URL.
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/task/${task.id}`)}
      style={{ cursor: "pointer" }}
    >
      <strong>{task.title}</strong>
      <div>ID: {task.id}</div>
      <div>Status: {task.status}</div>
    </div>
  );
}
