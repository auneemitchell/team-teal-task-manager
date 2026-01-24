PRAGMA foreign_keys = ON;

-- create USERS table
CREATE TABLE IF NOT EXISTS Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    display_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    timezone TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- create PROJECTS table
CREATE TABLE IF NOT EXISTS Projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_by INTEGER NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES Users(id) ON DELETE RESTRICT
);

-- create SPRINTS table
CREATE TABLE IF NOT EXISTS Sprints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    start_date DATE,
    end_date DATE,
    created_by INTEGER NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES Projects(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES Users(id) ON DELETE RESTRICT
);

-- create COLUMNS table
CREATE TABLE IF NOT EXISTS Columns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    key TEXT NOT NULL,
    position INTEGER NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES Projects(id) ON DELETE CASCADE,
    UNIQUE (project_id, key)
);

-- create TASKS table
CREATE TABLE IF NOT EXISTS Tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    sprint_id INTEGER,
    reporter_id INTEGER NOT NULL,
    assignee_id INTEGER,
    created_by INTEGER NOT NULL,
    modified_by INTEGER,
    title TEXT NOT NULL,
    description TEXT,
    start_date DATE,
    due_date DATE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES Projects(id) ON DELETE CASCADE,
    FOREIGN KEY (sprint_id) REFERENCES Sprints(id) ON DELETE SET NULL,
    FOREIGN KEY (reporter_id) REFERENCES Users(id) ON DELETE RESTRICT,
    FOREIGN KEY (assignee_id) REFERENCES Users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES Users(id) ON DELETE RESTRICT,
    FOREIGN KEY (modified_by) REFERENCES Users(id) ON DELETE SET NULL
);

-- create COLUMN TASKS junction
CREATE TABLE IF NOT EXISTS Column_Tasks (
    task_id INTEGER NOT NULL,
    column_id INTEGER NOT NULL,
    position INTEGER NOT NULL,
    PRIMARY KEY (task_id, column_id),
    FOREIGN KEY (task_id) REFERENCES Tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (column_id) REFERENCES Columns(id) ON DELETE CASCADE
);

-- create COMMENTS table
CREATE TABLE Comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL,
    created_by INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES Tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES Users(id) ON DELETE RESTRICT
);

-- maybe helpful indices
CREATE INDEX idx_projects_created_by ON Projects(created_by);
CREATE INDEX idx_sprints_project_id ON Sprints(project_id);
CREATE INDEX idx_tasks_project_id ON Tasks(project_id);
CREATE INDEX idx_tasks_sprint_id ON Tasks(sprint_id);
CREATE INDEX idx_tasks_assignee_id ON Tasks(assignee_id);
CREATE INDEX idx_comments_task_id ON Comments(task_id);
