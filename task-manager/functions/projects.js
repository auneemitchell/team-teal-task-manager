import { makeCrudHandlers } from "./helpers.js";

 // Use the generic CRUD handlers for the project collection endpoint
const projectHandlers = makeCrudHandlers({
  table: "Projects",
  primaryKey: "id",
  allowedColumns: ["name", "created_by", "created_at", "updated_at"],
  dbEnvVar: "cf_db",
  orderBy: "position  ASC",
});

export const onRequestGet = projectHandlers.collection;
export const onRequestPost   = projectHandlers.collection;
export const onRequestOptions = projectHandlers.collection; 