import { makeCrudHandlers } from "../helpers.js";

// Use the generic CRUD handlers for the Customers item endpoint
const handlers = makeCrudHandlers({
  table: "Tasks",
  primaryKey: "id",
  // these should maybe change -- a lot of these should be checked application-level
  allowedColumns: [
    "project_id",
    "sprint_id",
    "reporter_id",
    "assignee_id",
    "created_by",
    "modified_by",
    "title",
    "description",
    "start_date",
    "end_date",
    "updated_at",
  ],
  dbEnvVar: "cf_db",
  orderBy: "id",
});

export const onRequestGet = handlers.item;
export const onRequestPut = handlers.item;
export const onRequestPatch = handlers.item;
export const onRequestDelete = handlers.item;
export const onRequestOptions = handlers.item;
