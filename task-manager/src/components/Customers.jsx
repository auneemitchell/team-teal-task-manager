import { useEffect, useState } from "react";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [company, setCompany] = useState("");
  const [contact, setContact] = useState("");

  async function load() {
    const res = await fetch("/api/customers");
    const data = await res.json();
    setCustomers(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e) {
    e.preventDefault();
    if (!company) return;
    await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ CompanyName: company, ContactName: contact }),
    });
    setCompany("");
    setContact("");
    load();
  }

  async function remove(id) {
    await fetch(`/api/customers/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <h1>Customers</h1>
      <form onSubmit={create}>
        <input
          placeholder="Company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
        <input
          placeholder="Contact"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
        />
        <button type="submit">Add</button>
      </form>

      <ul>
        {customers.map((c) => (
          <li key={c.CustomerID}>
            <strong>{c.CompanyName}</strong> — {c.ContactName}
            <button
              onClick={() => remove(c.CustomerID)}
              style={{ marginLeft: 8 }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
