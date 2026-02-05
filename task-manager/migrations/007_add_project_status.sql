-- This file alters the Project table to include a project status like Not Started, In Progress, or Complete
ALTER TABLE Projects
ADD COLUMN status TEXT NOT NULL DEFAULT 'not_started'
CHECK (status IN ('not_started', 'in_progress', 'complete'));