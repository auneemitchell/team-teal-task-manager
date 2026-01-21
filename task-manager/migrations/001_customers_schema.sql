-- Migration: create Customers table
-- Uses `CustomerID` as the primary key to match application code.
CREATE TABLE IF NOT EXISTS Customers (
  CustomerID   INTEGER PRIMARY KEY,
  CompanyName  TEXT NOT NULL,
  ContactName  TEXT
);
