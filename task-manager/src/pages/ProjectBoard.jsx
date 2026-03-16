import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TaskForm from "../components/TaskForm.jsx";
import Board from "../components/Board.jsx";
import NewTaskButton from "../components/NewTaskButton.jsx";
import Backlog from "../components/Backlog.jsx";
import Sprints from "../components/Sprints.jsx";
import ProjectSelector from "../components/ProjectSelector.jsx";
import { findActiveSprint } from "../utils/sprintHelpers.js";

/**
 * ProjectBoard Page
 *
 * Displays a single project's board with Board/Backlog tabs.
 * Uses URL parameter :projectId to determine which project to show.
 */
export default function ProjectBoard() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [columns, setColumns] = useState([]);
  const [backlogColumns, setBacklogColumns] = useState([]);
  const [project, setProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [projectTab, setProjectTab] = useState("Board");
  const [sprints, setSprints] = useState([]);
  const [sprintStatus, setSprintStatus] = useState("not_started");
  const [sprintColumns, setSprintColumns] = useState([]);
  const [sprintId, setSprintId] = useState(null);

  /* States for task filtering */
  const [selectedAssignee, setSelectedAssignee] = useState("all");
  const [selectedReporter, setSelectedReporter] = useState("all");
  const [users, setUsers] = useState([]);

  // Load project details
  async function loadProject() {
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      const data = await res.json().catch(() => null);
      if (data && !data.error) {
        setProject(data);
      } else {
        console.error("API error loading project", data);
        setProject(null);
      }
    } catch (err) {
      console.error("Fetch error", err);
      setProject(null);
    }
  }

  // Load the columns, tasks, and sprints for the project
  async function loadColumns() {
    try {
      const [colRes, taskRes, sprintRes] = await Promise.all([
        fetch(`/api/columns?project_id=${projectId}`),
        fetch(`/api/tasks?project_id=${projectId}`),
        fetch(`/api/sprints?project_id=${projectId}`),
      ]);

      const cols = await colRes.json().catch(() => null);
      if (!Array.isArray(cols) || cols.error) {
        console.error("API error loading columns", cols);
        setColumns([]);
        return;
      }

      const taskList = await taskRes.json().catch(() => null);
      if (!Array.isArray(taskList) || taskList.error) {
        console.error("API error loading tasks", taskList);
        setColumns([]);
        return;
      }

      const sprintList = await sprintRes.json().catch(() => null);
      if (!Array.isArray(sprintList) || sprintList.error) {
        console.error("API error loading sprints", sprintList);
        setSprints([]);
        setSprintColumns([]);
        return;
      }
      setSprints(sprintList);

      // Auto-select active sprint (in_progress), fallback to first sprint
      const activeSprint = findActiveSprint(sprintList);
      if (activeSprint && sprintId !== activeSprint.id) {
        setSprintId(activeSprint.id);
      } else if (sprintList.length > 0 && !sprintList.some((s) => s.id == sprintId)) {
        setSprintId(sprintList[0].id);
      }

      const columnsWithTasks = cols.map((col) => {
        const colTasks = taskList
          .filter((t) => Number(t.column_id) === Number(col.id))
          .sort(
            (a, b) => (Number(a.position) || 0) - (Number(b.position) || 0),
          );
        return {
          ...col,
          title: col.name,
          tasks: colTasks,
        };
      });
      setColumns(columnsWithTasks);

      const backlogTasks = taskList.filter((t) => t.column_id == null);
      const backlogTaskCollection = [{
        id: null,
        title: "Backlog",
        tasks: backlogTasks,
      }];
      setBacklogColumns(backlogTaskCollection);

      // Get sprint matching current sprint id
      const currentSprint = sprintList.find((s) => s.id == sprintId);
      if (currentSprint) {
        setSprintStatus(currentSprint.status);
        const sprintTasks = taskList.filter((t) => t.sprint_id == sprintId);
        const sprintTaskCollection = [{
          id: sprintId,
          title: currentSprint.name,
          tasks: sprintTasks
        }];
        setSprintColumns(sprintTaskCollection);
      }
    } catch (err) {
      console.error("Fetch error", err);
      setColumns([]);
      setBacklogColumns([]);
    }
  }

  /* Load users for task filtering */
  async function loadUsers() {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (Array.isArray(data)) setUsers(data);
    } catch (e) {
      console.error("Error loading users", e);
    }
  }

  /* Load all projects for the selector */
  async function loadProjects() {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json().catch(() => null);
      if (Array.isArray(data)) {
        setProjects(data);
        // If no projectId in URL, redirect to first project
        if (!projectId && data.length > 0) {
          navigate(`/projects/${data[0].id}`, { replace: true });
        }
      }
    } catch (err) {
      console.error("Error loading projects", err);
    }
  }

  function handleProjectChange(newProjectId) {
    navigate(`/projects/${newProjectId}`);
  }

  useEffect(() => {
    loadProjects();
    loadUsers();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!projectId) return;
    loadProject();
  }, [projectId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!projectId) return;
    setColumns([]);
    loadColumns();
  }, [projectId, sprintId]); // eslint-disable-line

  const activeProjectColumns = useMemo(() => {
    return columns.filter(
      (col) => Number(col.project_id) === Number(projectId),
    );
  }, [columns, projectId]);

  /* Task filtering engine */
  const filteredColumns = useMemo(() => {
    return activeProjectColumns.map((col) => ({
      ...col,
      tasks: col.tasks.filter((t) => {
        const mAssignee =
          selectedAssignee === "all" ||
          Number(t.assignee_id) === Number(selectedAssignee);
        const mReporter =
          selectedReporter === "all" ||
          Number(t.reporter_id) === Number(selectedReporter);
        return mAssignee && mReporter;
      }),
    }));
  }, [activeProjectColumns, selectedAssignee, selectedReporter]);

  function handleProjectTabSwitch(e) {
    setProjectTab(e.target.value);
  }

  // Update sprint status in the database
  async function updateSprintStatus(newStatus) {
    try {
      const statusRes = await fetch(`/api/sprints/${sprintId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const bodyRes = await statusRes.json().catch(() => null);
      if (!statusRes.ok) {
        console.error("Error updating sprint status", bodyRes);
      }
    } catch (err) {
      console.error("Error updating sprint status", err);
    }
  }

  // Start a sprint (set status to in_progress)
  async function startSprint(targetSprintId) {
    try {
      const res = await fetch(`/api/sprints/${targetSprintId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "in_progress" }),
      });
      if (res.ok) {
        setSprintId(targetSprintId);
        setSprintStatus("in_progress");
        // Reload to refresh sprint data
        await loadColumns();
      } else {
        console.error("Error starting sprint");
      }
    } catch (err) {
      console.error("Error starting sprint", err);
    }
  }

  // Check if there's an active sprint
  const hasActiveSprint = useMemo(() => {
    return sprints.some((s) => s.status === "in_progress");
  }, [sprints]);

  // Get the first not_started sprint for "Start Sprint" button
  const nextSprintToStart = useMemo(() => {
    return sprints.find((s) => s.status === "not_started");
  }, [sprints]);

  const projectTabs = {
    Board:
      <div>
        {!hasActiveSprint && nextSprintToStart && (
          <div className="bg-slate-700/50 border border-white/20 rounded-lg p-4 mb-4 flex items-center justify-between">
            <div>
              <p className="text-white font-medium m-0">No active sprint</p>
              <p className="text-white/60 text-sm m-0">Start a sprint to begin tracking work on the board.</p>
            </div>
            <button
              onClick={() => startSprint(nextSprintToStart.id)}
              className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-medium px-4 py-2 rounded-lg shadow transition-all"
            >
              Start {nextSprintToStart.name}
            </button>
          </div>
        )}
        {!hasActiveSprint && !nextSprintToStart && sprints.length === 0 && (
          <div className="bg-slate-700/50 border border-white/20 rounded-lg p-4 mb-4">
            <p className="text-white/60 m-0">No sprints available. Create a sprint in the Backlog tab.</p>
          </div>
        )}
        <Board
          key={projectId}
          columns={filteredColumns}
          setColumns={setColumns}
          boardTitle="Board"
          emptyColumnsText="No Columns"
        />
      </div>,
    Backlog:
      <div>
        <Sprints
          columns={sprintColumns}
          sprintStatus={sprintStatus}
          sprintId={sprintId}
          sprints={sprints}
          setSprintColumns={setSprintColumns}
          setSprintStatus={setSprintStatus}
          updateSprintStatus={updateSprintStatus}
          setSprintId={setSprintId}
          boardTitle="Sprints"
        />
        <Backlog
          key={projectId}
          backlog={backlogColumns}
        />
      </div>
  };

  function openModal() {
    setShowCreateModal(true);
  }

  function closeModal() {
    setShowCreateModal(false);
  }

  async function handleCreated(task) {
    console.log("Created task", task);
    try {
      await loadColumns();
    } catch (err) {
      console.error("Error reloading board after create", err);
    }
    closeModal();
  }

  if (!projectId || !project) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        Loading project...
      </div>
    );
  }

  return (
    <div>
      <div className="bg-gradient-to-r from-slate-700 to-slate-600 rounded-lg px-6 py-4 shadow-lg mb-6">
        <h1 className="text-3xl font-bold text-white m-0">
          {project.name} - {projectTab}
        </h1>
        <button
          type="button"
          value="Board"
          onClick={handleProjectTabSwitch}
        >
          Board
        </button>
        <button
          type="button"
          value="Backlog"
          onClick={handleProjectTabSwitch}
        >
          Backlog
        </button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <ProjectSelector
          projects={projects}
          selectedProjectId={Number(projectId)}
          onSelectProject={handleProjectChange}
        />

        {projectTab === "Board" ? null : (
          <NewTaskButton openModal={openModal} />
        )}

        <div className="flex items-center gap-3 flex-1">
          <span className="font-semibold text-white text-sm whitespace-nowrap">
            Filter Board:
          </span>

          <div className="flex items-center gap-2">
            <label
              htmlFor="assignee-filter"
              className="text-white/70 text-sm whitespace-nowrap"
            >
              Assignee:
            </label>
            <select
              id="assignee-filter"
              value={selectedAssignee}
              onChange={(e) => setSelectedAssignee(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40 focus:ring-2 focus:ring-white/10 cursor-pointer"
            >
              <option value="all" className="bg-slate-800">
                All Assignees
              </option>
              {users.map((u) => (
                <option key={u.id} value={u.id} className="bg-slate-800">
                  {u.display_name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label
              htmlFor="reporter-filter"
              className="text-white/70 text-sm whitespace-nowrap"
            >
              Reporter:
            </label>
            <select
              id="reporter-filter"
              value={selectedReporter}
              onChange={(e) => setSelectedReporter(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40 focus:ring-2 focus:ring-white/10 cursor-pointer"
            >
              <option value="all" className="bg-slate-800">
                All Reporters
              </option>
              {users.map((u) => (
                <option key={u.id} value={u.id} className="bg-slate-800">
                  {u.display_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {showCreateModal && (
          <TaskForm
            projectId={projectId}
            createdBy={1}
            modifiedBy={1}
            columnsForStatus={columns}
            onSuccess={handleCreated}
            onCancel={closeModal}
          />
        )}
      </div>

      <div>
        {projectTabs[projectTab] ?? <div>Unknown tab</div>}
      </div>
    </div>
  );
}
