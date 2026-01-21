import { makeCrudHandlers } from "../helpers.js";

// Use the generic CRUD handlers for the Customers collection endpoint
const handlers = makeCrudHandlers({
  table: "Customers",
  primaryKey: "CustomerID",
  allowedColumns: ["CompanyName", "ContactName"],
  dbEnvVar: "cf_db",
  orderBy: "CustomerID",
});

export const onRequestGet = handlers.collection;
export const onRequestPost = handlers.collection;
export const onRequestOptions = handlers.collection;
