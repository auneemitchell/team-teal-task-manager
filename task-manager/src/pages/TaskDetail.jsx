import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { formatDate, isDateOverdue } from "../utils/dateHelpers.js";
import "./taskdetail.css";

/**
 * TaskDetail
 *
 * Route-level page that shows a read-only view of a single task.
 *
 * - Reads the task id from the URL via useParams.
 * - Loads task data from GET /api/tasks/:id.
 *
 * TODO: Project/sprint/user ids are rendered as raw ids for now; once lookup
 *   tables and joins are in place, these can be replaced with human-readable
 *   names.
 *
 * TODO: Once comments are implemented, we should also display comments
 *   on this page.
 *
 * TODO: Make sure database connection is working, once tasks backend api is implemetned
 */
export default function TaskDetail() {
  const { id } = useParams();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadTask() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/tasks/${id}`);
        const data = await res.json().catch(() => null);
        if (!res.ok || !data || data.error) {
          console.error("API error loading task", data);
          setError("Unable to load task from server.");
        } else {
          setTask(data);
        }
      } catch (err) {
        console.error("Fetch error loading task", err);
        setError("Network error loading task.");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadTask();
    }
  }, [id]);

  const {
    title,
    description,
    project_id,
    sprint_id,
    reporter_id,
    assignee_id,
    created_by,
    modified_by,
    start_date,
    due_date,
    created_at,
    updated_at,
  } = task || { id };

  const isOverdue = isDateOverdue(due_date);

  return (
    <div className="task-detail-page">

      {loading && <p>Loading task details…</p>}
      {error && <p>{error}</p>}

      <h1>{title || `Task ${id}`}</h1>

      {description && <p>{description}</p>}

      <section className="task-detail-section">
        <h2>Summary</h2>
        <dl>
          {/* TODO: These will be filled in with the actual project name and sprint name, when those tables are available*/}
          {project_id != null && (
            <div>
              <dt>Project</dt>
              <dd>{project_id}</dd>
            </div>
          )}
          {sprint_id != null && (
            <div>
              <dt>Sprint</dt>
              <dd>{sprint_id}</dd>
            </div>
          )}

          {/* TODO: Fill these in with the usernames, when those tables are available*/}
          {assignee_id != null && (
            <div>
              <dt>Assignee</dt>
              <dd>{assignee_id}</dd>
            </div>
          )}
          {reporter_id != null && (
            <div>
              <dt>Reporter</dt>
              <dd>{reporter_id}</dd>
            </div>
          )}
        </dl>
      </section>

      <section className="task-detail-section">
        <h2>Dates</h2>
        <dl>
          <div>
            <dt>Start</dt>
            <dd>{formatDate(start_date)}</dd>
          </div>
          <div>
            <dt>Due</dt>
            <dd className={isOverdue ? "task-detail__due task-detail__overdue" : "task-detail__due"}>
              {formatDate(due_date)}
            </dd>
          </div>
          {created_at && (
            <div>
              <dt>Created</dt>
              <dd>{formatDate(created_at)}</dd>
            </div>
          )}
          {updated_at && (
            <div>
              <dt>Updated</dt>
              <dd>{formatDate(updated_at)}</dd>
            </div>
          )}
        </dl>
      </section>

      <section className="task-detail-section">
        <dl>
          {created_by != null && (
            <div>
              <dt>Created by</dt>
              <dd>{created_by}</dd>
            </div>
          )}
          {modified_by != null && (
            <div>
              <dt>Last modified by</dt>
              <dd>{modified_by}</dd>
            </div>
          )}
        </dl>
      </section>
    </div>
  );
}
