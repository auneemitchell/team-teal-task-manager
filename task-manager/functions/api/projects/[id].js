import { makeCrudHandlers } from "./helpers.js";

// Use the generic CRUD handlers for the project collection endpoint
const projectHandlers = makeCrudHandlers({
  table: "Projects",
  primaryKey: "id",
  allowedColumns: ["name", "created_by", "created_at", "updated_at"],
  dbEnvVar: "cf_db",
  orderBy: "id ASC",
});

/* The handler will not modify timestamps when ON UPDATE is used
This is just the nature of CloudFlare D1
so I've added a custom update handler to solve this problem
*/

const updateProjectTimestamps = async (env, id, data) => {
    const updatedData = {
        ...data,
        updated_at: new Date().toISOString(),
    };

    return projectHandlers.updateProjectTimestamps(env, id, updatedData);
};

export const onRequestPut = updateProjectTimestamps;
export const onRequestPatch = updateProjectTimestamps;
export const onRequestGet = projectHandlers.item;
export const onRequestDelete = projectHandlers.item;
export const onRequestOptions = projectHandlers.item; 