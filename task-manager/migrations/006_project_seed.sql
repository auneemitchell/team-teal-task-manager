-- Seed a simple project
INSERT OR IGNORE INTO Projects (id, name, created_by, status, created_at, updated_at)
VALUES 
('Example Project 1 - Scary Snakes', 1, 'not_started'),
('Example Project 2 - Mean Clowns', 1, 'in_progress'),
('Example Project 3 - Edge of a Cliff', 1, 'complete');   