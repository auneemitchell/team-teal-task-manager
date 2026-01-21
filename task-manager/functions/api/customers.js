// Sample Customers route (/api/customers) for example Customers table

export async function onRequest(context) {
  const { request, env } = context;

  // GET returns all customers as JSON
  if (request.method === "GET") {
    const res = await env.prod_db
      .prepare("SELECT * FROM Customers ORDER BY CustomerID")
      .all();
    return new Response(JSON.stringify(res.results || []), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // POST creates a new customer and returns it as JSON
  if (request.method === "POST") {
    const body = await request.json().catch(() => ({}));
    const company = (body.CompanyName || body.companyName || "").trim();
    const contact = body.ContactName || body.contactName || null;
    if (!company) {
      return new Response("Missing CompanyName", { status: 400 });
    }

    await env.prod_db
      .prepare("INSERT INTO Customers (CompanyName, ContactName) VALUES (?, ?)")
      .run(company, contact);

    const created = await env.prod_db
      .prepare("SELECT * FROM Customers WHERE CustomerID = last_insert_rowid()")
      .first();

    return new Response(JSON.stringify(created || {}), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(null, { status: 405 });
}
