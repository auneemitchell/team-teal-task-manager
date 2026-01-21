import { makeCrudHandlers } from "../helpers.js";

// Use the generic CRUD handlers for the Customers item endpoint.
const handlers = makeCrudHandlers({
  table: "Customers",
  primaryKey: "CustomerID",
  allowedColumns: ["CompanyName", "ContactName"],
  dbEnvVar: "cf_db",
});

export const onRequestGet = handlers.item;
export const onRequestPut = handlers.item;
export const onRequestPatch = handlers.item;
export const onRequestDelete = handlers.item;
export const onRequestOptions = handlers.item;
