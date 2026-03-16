/**
 * Sprint helper utilities
 */

/**
 * Find the active sprint from a list of sprints.
 * Priority:
 * 1. Sprint with status 'in_progress'
 * 2. First sprint in the list
 * 3. null if no sprints exist
 * 
 * @param {Array} sprints - Array of sprint objects
 * @returns {Object|null} - The active sprint or null
 */
export function findActiveSprint(sprints) {
  if (!Array.isArray(sprints) || sprints.length === 0) {
    return null;
  }

  // Find sprint with status 'in_progress'
  const inProgressSprint = sprints.find((s) => s.status === "in_progress");
  if (inProgressSprint) {
    return inProgressSprint;
  }

  // Fallback to first sprint
  return sprints[0];
}

/**
 * Check if a sprint is the active (in_progress) sprint
 * 
 * @param {Object} sprint - Sprint object
 * @returns {boolean}
 */
export function isActiveSprint(sprint) {
  return sprint?.status === "in_progress";
}
