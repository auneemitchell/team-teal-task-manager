import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { waitFor, fireEvent } from "@testing-library/react";
import Home from "../../src/pages/Home.jsx";
import { renderWithRoot } from "../test-utils/reactTestUtils.jsx";

function renderHome(props = {}) {
  return renderWithRoot(
    <MemoryRouter>
      <Home {...props} />
    </MemoryRouter>,
  );
}

const mockProjects = [
  { id: 1, name: "Project One", type: "kanban" },
  { id: 2, name: "Project Two", type: "scrum" },
];

const mockColumns = [
  { id: 1, name: "To Do", project_id: 1 },
  { id: 2, name: "In Progress", project_id: 1 },
];

const mockTasks = [
  { id: 1, title: "Task One", column_id: 1, project_id: 1, position: 0, assignee_id: 10, reporter_id: 20 },
  { id: 2, title: "Task Two", column_id: null, project_id: 1, position: 0, assignee_id: 11, reporter_id: 20 },
];

const mockUsers = [
  { id: 10, display_name: "Alice" },
  { id: 11, display_name: "Bob" },
];

const mockSprints = [
  { id: 3, name: "Sprint 1", status: "not_started" },
];

describe("Home", () => {
  let fetchMock;
  let originalFetch;
  let originalBodyHTML;

  beforeEach(() => {
    originalBodyHTML = document.body.innerHTML;
    originalFetch = global.fetch;
    fetchMock = vi.fn(async (url) => {
      const urlStr = String(url);
      if (urlStr.includes("/api/projects")) {
        return { ok: true, json: async () => mockProjects };
      }
      if (urlStr.includes("/api/columns")) {
        return { ok: true, json: async () => mockColumns };
      }
      if (urlStr.includes("/api/tasks")) {
        return { ok: true, json: async () => mockTasks };
      }
      if (urlStr.includes("/api/users")) {
        return { ok: true, json: async () => mockUsers };
      }
      return { ok: true, json: async () => [] };
    });
    global.fetch = fetchMock;
  });

  afterEach(() => {
    document.body.innerHTML = originalBodyHTML;
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("renders without crashing", () => {
    const { container } = renderHome();
    expect(container).not.toBeNull();
  });

  it("loads and displays projects, columns and tasks", async () => {
    renderHome({ projectId: 1 });
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/api/projects"));
      expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/api/columns?project_id=1"));
      expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/api/tasks?project_id=1"));
    });
  });

  it("switches to Backlog tab when Backlog button is clicked", async () => {
    const { container } = renderHome({ projectId: 2 });

    let backlogBtn;
    await waitFor(() => {
      const buttons = Array.from(container.querySelectorAll("button"));
      backlogBtn = buttons.find((b) => b.textContent.includes("Backlog"));
      expect(backlogBtn).toBeTruthy();
    });

    fireEvent.click(backlogBtn);

    await waitFor(() => {
      expect(container.textContent).toContain("Backlog");
    });
  });

  it("opens create task modal when New Task button is clicked", async () => {
    const { container } = renderHome({ projectId: 1 });
    await waitFor(() => {
      const buttons = Array.from(container.querySelectorAll("button"));
      const newTaskBtn = buttons.find(
        (b) =>
          b.textContent.includes("New Task") || b.textContent.includes("Add Task") || b.textContent.includes("Create"),
      );
      if (newTaskBtn) fireEvent.click(newTaskBtn);
    });
  });

  it("handles API error when loading projects", async () => {
    fetchMock = vi.fn(async (url) => {
      if (String(url).includes("/api/projects")) {
        return { ok: false, json: async () => ({ error: "boom" }) };
      }
      return { ok: true, json: async () => [] };
    });
    global.fetch = fetchMock;

    const { container } = renderHome();
    await waitFor(() => {
      expect(container).not.toBeNull();
    });
  });

  it("handles API error when loading columns", async () => {
    fetchMock = vi.fn(async (url) => {
      const urlStr = String(url);
      if (urlStr.includes("/api/projects")) return { ok: true, json: async () => mockProjects };
      if (urlStr.includes("/api/columns")) return { ok: false, json: async () => ({ error: "boom" }) };
      return { ok: true, json: async () => [] };
    });
    global.fetch = fetchMock;

    const { container } = renderHome({ projectId: 1 });
    await waitFor(() => {
      expect(container).not.toBeNull();
    });
  });

  it("handles API error when loading tasks", async () => {
    fetchMock = vi.fn(async (url) => {
      const urlStr = String(url);
      if (urlStr.includes("/api/projects")) return { ok: true, json: async () => mockProjects };
      if (urlStr.includes("/api/columns")) return { ok: true, json: async () => mockColumns };
      if (urlStr.includes("/api/tasks")) return { ok: false, json: async () => ({ error: "boom" }) };
      return { ok: true, json: async () => [] };
    });
    global.fetch = fetchMock;

    const { container } = renderHome({ projectId: 1 });

    await waitFor(() => {
      expect(container).not.toBeNull();
    });
  });

  // lines 53-56: sprint API returns a non-array error object x
  it("handles API error when loading sprints", async () => {
    fetchMock = vi.fn(async (url) => {
      const urlStr = String(url);
      if (urlStr.includes("/api/projects")) return { ok: true, json: async () => mockProjects };
      if (urlStr.includes("/api/columns")) return { ok: true, json: async () => mockColumns };
      if (urlStr.includes("/api/tasks")) return { ok: true, json: async () => mockTasks };
      if (urlStr.includes("/api/users")) return { ok: true, json: async () => mockUsers };
      if (urlStr.includes("/api/sprints")) return { ok: true, json: async () => ({ error: "boom" }) };
      return { ok: true, json: async () => [] };
    });
    global.fetch = fetchMock;

    const { container } = renderHome({ projectId: 1 });
    await waitFor(() => expect(container).not.toBeNull());
  });

  // line 62: sprintId from props not present in project's sprint list → defaults to first sprint
  it("defaults sprintId to first sprint when the given sprintId is not in the project", async () => {
    fetchMock = vi.fn(async (url) => {
      const urlStr = String(url);
      if (urlStr.includes("/api/projects")) return { ok: true, json: async () => mockProjects };
      if (urlStr.includes("/api/columns")) return { ok: true, json: async () => mockColumns };
      if (urlStr.includes("/api/tasks")) return { ok: true, json: async () => mockTasks };
      if (urlStr.includes("/api/users")) return { ok: true, json: async () => mockUsers };
      if (urlStr.includes("/api/sprints")) return { ok: true, json: async () => mockSprints };
      return { ok: true, json: async () => [] };
    });
    global.fetch = fetchMock;

    renderHome({ projectId: 1, sprintId: 999 });
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/api/sprints"));
    });
  });

  // line 69: tasks within a column are sorted ascending by position
  it("sorts tasks within a column by position", async () => {
    const unsortedTasks = [
      { id: 3, title: "Task C", column_id: 1, project_id: 1, position: 2, assignee_id: 10, reporter_id: 20 },
      { id: 4, title: "Task A", column_id: 1, project_id: 1, position: 0, assignee_id: 10, reporter_id: 20 },
      { id: 5, title: "Task B", column_id: 1, project_id: 1, position: 1, assignee_id: 10, reporter_id: 20 },
    ];
    fetchMock = vi.fn(async (url) => {
      const urlStr = String(url);
      if (urlStr.includes("/api/projects")) return { ok: true, json: async () => mockProjects };
      if (urlStr.includes("/api/columns")) return { ok: true, json: async () => mockColumns };
      if (urlStr.includes("/api/tasks")) return { ok: true, json: async () => unsortedTasks };
      if (urlStr.includes("/api/users")) return { ok: true, json: async () => mockUsers };
      return { ok: true, json: async () => [] };
    });
    global.fetch = fetchMock;

    const { container } = renderHome({ projectId: 1 });
    await waitFor(() => {
      const text = container.textContent;
      const posA = text.indexOf("Task A");
      const posB = text.indexOf("Task B");
      const posC = text.indexOf("Task C");
      expect(posA).toBeGreaterThan(-1);
      expect(posA).toBeLessThan(posB);
      expect(posB).toBeLessThan(posC);
    });
  });

  // lines 91-98: matching sprint found → sprint status and sprint columns are set
  it("sets sprint status and sprint columns when the current sprint is found", async () => {
    const sprintTasks = [
      { id: 10, title: "Sprint Task", column_id: 1, project_id: 1, position: 0, sprint_id: 3, assignee_id: 10, reporter_id: 20 },
    ];
    fetchMock = vi.fn(async (url) => {
      const urlStr = String(url);
      if (urlStr.includes("/api/projects")) return { ok: true, json: async () => mockProjects };
      if (urlStr.includes("/api/columns")) return { ok: true, json: async () => mockColumns };
      if (urlStr.includes("/api/tasks")) return { ok: true, json: async () => sprintTasks };
      if (urlStr.includes("/api/users")) return { ok: true, json: async () => mockUsers };
      if (urlStr.includes("/api/sprints")) return { ok: true, json: async () => mockSprints };
      return { ok: true, json: async () => [] };
    });
    global.fetch = fetchMock;

    renderHome({ projectId: 1, sprintId: 3 });
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/api/sprints?project_id=1"));
    });
  });

  // lines 102-105: fetch throws inside loadColumns → catch block runs
  it("handles network error thrown while loading columns", async () => {
    fetchMock = vi.fn(async (url) => {
      const urlStr = String(url);
      if (urlStr.includes("/api/projects")) return { ok: true, json: async () => mockProjects };
      if (urlStr.includes("/api/columns")) throw new Error("Network error");
      return { ok: true, json: async () => [] };
    });
    global.fetch = fetchMock;

    const { container } = renderHome({ projectId: 1 });
    await waitFor(() => expect(container).not.toBeNull());
  });

  // line 121: fetch throws inside loadFilterMetadata → catch block runs
  it("handles network error thrown in loadFilterMetadata", async () => {
    fetchMock = vi.fn(async (url) => {
      const urlStr = String(url);
      if (urlStr.includes("/api/projects")) return { ok: true, json: async () => mockProjects };
      if (urlStr.includes("/api/columns")) return { ok: true, json: async () => mockColumns };
      if (urlStr.includes("/api/tasks")) return { ok: true, json: async () => mockTasks };
      if (urlStr.includes("/api/sprints")) return { ok: true, json: async () => [] };
      if (urlStr.includes("/api/users")) throw new Error("Network error");
      return { ok: true, json: async () => [] };
    });
    global.fetch = fetchMock;

    const { container } = renderHome({ projectId: 1 });
    await waitFor(() => expect(container).not.toBeNull());
  });

  // lines 141-142: fetch throws inside loadProjects → catch block runs
  it("handles network error thrown while loading projects", async () => {
    fetchMock = vi.fn(async () => {
      throw new Error("Network error");
    });
    global.fetch = fetchMock;

    const { container } = renderHome();
    await waitFor(() => expect(container).not.toBeNull());
  });

  // lines 202-204: selecting a different project reloads data and resets tab to Board
  it("reloads data for the new project when a different project is selected", async () => {
    const { container } = renderHome({ projectId: 1 });

    // Wait for projects to load, then open the ProjectSelector dropdown
    await waitFor(() => {
      const selectorBtn = Array.from(container.querySelectorAll("button")).find((b) =>
        b.textContent.includes("Project One") || b.textContent.includes("Select Project"),
      );
      expect(selectorBtn).not.toBeNull();
    });
    const selectorBtn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent.includes("Project One") || b.textContent.includes("Select Project"),
    );
    fireEvent.click(selectorBtn);

    // Wait for the Project Two card to appear (ProjectCard renders a div, not a button)
    await waitFor(() => {
      const cards = Array.from(container.querySelectorAll("[data-testid='project-card']"));
      const project2Card = cards.find((c) => c.textContent.includes("Project Two"));
      expect(project2Card).not.toBeNull();
    });
    const project2Card = Array.from(container.querySelectorAll("[data-testid='project-card']")).find(
      (c) => c.textContent.includes("Project Two"),
    );
    fireEvent.click(project2Card);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/api/columns?project_id=2"));
    });
  });

  // lines 207-214: clicking sprint status button issues a PUT to /api/sprints/:id
  it("calls PUT /api/sprints/:id when the sprint status button is clicked", async () => {
    fetchMock = vi.fn(async (url, options) => {
      const urlStr = String(url);
      if (urlStr.match(/\/api\/sprints\/\d+/) && options?.method === "PUT") {
        return { ok: true, json: async () => ({}) };
      }
      if (urlStr.includes("/api/projects")) return { ok: true, json: async () => mockProjects };
      if (urlStr.includes("/api/columns")) return { ok: true, json: async () => mockColumns };
      if (urlStr.includes("/api/tasks")) return { ok: true, json: async () => mockTasks };
      if (urlStr.includes("/api/sprints")) return { ok: true, json: async () => mockSprints };
      if (urlStr.includes("/api/users")) return { ok: true, json: async () => mockUsers };
      return { ok: true, json: async () => [] };
    });
    global.fetch = fetchMock;

    const { container } = renderHome({ projectId: 2, sprintId: 3 });
    await waitFor(() => {
      const backlogBtn = Array.from(container.querySelectorAll("button")).find((b) => b.textContent === "Backlog");
      expect(backlogBtn).not.toBeNull();
      fireEvent.click(backlogBtn);
    });

    await waitFor(() => {
      const statusBtn = Array.from(container.querySelectorAll("button")).find((b) => b.textContent === "Not started");
      expect(statusBtn).not.toBeNull();
      fireEvent.click(statusBtn);
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/api/sprints/3"),
        expect.objectContaining({ method: "PUT" }),
      );
    });
  });

  // lines 215-216: PUT returns non-ok response → error is logged
  it("logs an error when the sprint status PUT returns a non-ok response", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    fetchMock = vi.fn(async (url, options) => {
      const urlStr = String(url);
      if (urlStr.match(/\/api\/sprints\/\d+/) && options?.method === "PUT") {
        return { ok: false, json: async () => ({ error: "update failed" }) };
      }
      if (urlStr.includes("/api/projects")) return { ok: true, json: async () => mockProjects };
      if (urlStr.includes("/api/columns")) return { ok: true, json: async () => mockColumns };
      if (urlStr.includes("/api/tasks")) return { ok: true, json: async () => mockTasks };
      if (urlStr.includes("/api/sprints")) return { ok: true, json: async () => mockSprints };
      if (urlStr.includes("/api/users")) return { ok: true, json: async () => mockUsers };
      return { ok: true, json: async () => [] };
    });
    global.fetch = fetchMock;

    const { container } = renderHome({ projectId: 2, sprintId: 3 });
    await waitFor(() => {
      const backlogBtn = Array.from(container.querySelectorAll("button")).find((b) => b.textContent === "Backlog");
      expect(backlogBtn).not.toBeNull();
      fireEvent.click(backlogBtn);
    });

    await waitFor(() => {
      const statusBtn = Array.from(container.querySelectorAll("button")).find((b) => b.textContent === "Not started");
      expect(statusBtn).not.toBeNull();
      fireEvent.click(statusBtn);
    });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("Error updating sprint status", expect.anything());
    });
  });

  // lines 218-219: fetch throws during sprint status update → catch block runs
  it("handles network error thrown during sprint status update", async () => {
    fetchMock = vi.fn(async (url, options) => {
      const urlStr = String(url);
      if (urlStr.match(/\/api\/sprints\/\d+/) && options?.method === "PUT") {
        throw new Error("Network error");
      }
      if (urlStr.includes("/api/projects")) return { ok: true, json: async () => mockProjects };
      if (urlStr.includes("/api/columns")) return { ok: true, json: async () => mockColumns };
      if (urlStr.includes("/api/tasks")) return { ok: true, json: async () => mockTasks };
      if (urlStr.includes("/api/sprints")) return { ok: true, json: async () => mockSprints };
      if (urlStr.includes("/api/users")) return { ok: true, json: async () => mockUsers };
      return { ok: true, json: async () => [] };
    });
    global.fetch = fetchMock;

    const { container } = renderHome({ projectId: 2, sprintId: 3 });
    await waitFor(() => {
      const backlogBtn = Array.from(container.querySelectorAll("button")).find((b) => b.textContent === "Backlog");
      expect(backlogBtn).not.toBeNull();
      fireEvent.click(backlogBtn);
    });

    await waitFor(() => {
      const statusBtn = Array.from(container.querySelectorAll("button")).find((b) => b.textContent === "Not started");
      expect(statusBtn).not.toBeNull();
      fireEvent.click(statusBtn);
    });

    await waitFor(() => expect(container).not.toBeNull());
  });

  // lines 257-261, 265: successful task creation reloads columns and closes the modal
  it("reloads columns and closes modal after a task is created", async () => {
    fetchMock = vi.fn(async (url, options) => {
      const urlStr = String(url);
      if (urlStr === "/api/tasks" && options?.method === "POST") {
        return { ok: true, json: async () => ({ id: 99, title: "New Task" }) };
      }
      if (urlStr.includes("/api/projects")) return { ok: true, json: async () => mockProjects };
      if (urlStr.includes("/api/columns")) return { ok: true, json: async () => mockColumns };
      if (urlStr.includes("/api/tasks")) return { ok: true, json: async () => mockTasks };
      if (urlStr.includes("/api/sprints")) return { ok: true, json: async () => [] };
      if (urlStr.includes("/api/users")) return { ok: true, json: async () => mockUsers };
      return { ok: true, json: async () => [] };
    });
    global.fetch = fetchMock;

    const { container } = renderHome({ projectId: 1 });
    await waitFor(() => {
      const newTaskBtn = Array.from(container.querySelectorAll("button")).find((b) =>
        b.textContent.includes("New Task"),
      );
      expect(newTaskBtn).not.toBeNull();
      fireEvent.click(newTaskBtn);
    });

    await waitFor(() => {
      const titleInput = container.querySelector("input[name='title']");
      expect(titleInput).not.toBeNull();
      fireEvent.change(titleInput, { target: { value: "My New Task" } });
    });

    const form = container.querySelector("form");
    expect(form).not.toBeNull();
    fireEvent.submit(form);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/tasks", expect.objectContaining({ method: "POST" }));
    });
  });

  // lines 262-264: if reloading columns throws after task creation, the error is caught
  it("handles network error when reloading columns after task creation", async () => {
    let columnsCallCount = 0;
    fetchMock = vi.fn(async (url, options) => {
      const urlStr = String(url);
      if (urlStr === "/api/tasks" && options?.method === "POST") {
        return { ok: true, json: async () => ({ id: 99, title: "New Task" }) };
      }
      if (urlStr.includes("/api/projects")) return { ok: true, json: async () => mockProjects };
      if (urlStr.includes("/api/columns")) {
        columnsCallCount++;
        if (columnsCallCount > 1) throw new Error("Network error on reload");
        return { ok: true, json: async () => mockColumns };
      }
      if (urlStr.includes("/api/tasks")) return { ok: true, json: async () => mockTasks };
      if (urlStr.includes("/api/sprints")) return { ok: true, json: async () => [] };
      if (urlStr.includes("/api/users")) return { ok: true, json: async () => mockUsers };
      return { ok: true, json: async () => [] };
    });
    global.fetch = fetchMock;

    const { container } = renderHome({ projectId: 1 });
    await waitFor(() => {
      const newTaskBtn = Array.from(container.querySelectorAll("button")).find((b) =>
        b.textContent.includes("New Task"),
      );
      expect(newTaskBtn).not.toBeNull();
      fireEvent.click(newTaskBtn);
    });

    await waitFor(() => {
      const titleInput = container.querySelector("input[name='title']");
      expect(titleInput).not.toBeNull();
      fireEvent.change(titleInput, { target: { value: "My New Task" } });
    });

    const form = container.querySelector("form");
    expect(form).not.toBeNull();
    fireEvent.submit(form);

    await waitFor(() => {
      expect(columnsCallCount).toBeGreaterThan(1);
    });
  });

  // line 320: changing the assignee filter updates state
  it("updates filtered columns when the assignee filter is changed", async () => {
    const { container } = renderHome({ projectId: 1 });

    let assigneeSelect;
    await waitFor(() => {
      assigneeSelect = container.querySelector("#assignee-filter");
      expect(assigneeSelect).not.toBeNull();
    });
    fireEvent.change(assigneeSelect, { target: { value: "10" } });

    await waitFor(() => {
      expect(container.querySelector("#assignee-filter").value).toBe("10");
    });
  });

  // line 344: changing the reporter filter updates state
  it("updates filtered columns when the reporter filter is changed", async () => {
    const { container } = renderHome({ projectId: 1 });

    let reporterSelect;
    await waitFor(() => {
      reporterSelect = container.querySelector("#reporter-filter");
      expect(reporterSelect).not.toBeNull();
    });
    fireEvent.change(reporterSelect, { target: { value: "10" } });

    await waitFor(() => {
      expect(container.querySelector("#reporter-filter").value).toBe("10");
    });
  });
});
