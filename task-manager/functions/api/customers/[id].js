// Sample single Customer route (/api/customers/:id) for example Customers table

export async function onRequest(context) {
  const { request, env, params } = context;
  const id = params && params.id;

  // Check that the ID was provided
  if (!id) {
    return new Response("Missing id", { status: 400 });
  }

  // GET retrieves the provided ID customer data as JSON
  if (request.method === "GET") {
    const row = await env.prod_db
      .prepare("SELECT * FROM Customers WHERE CustomerID = ?")
      .first(id);
    if (!row) {
      return new Response(null, { status: 404 });
    }
    return new Response(JSON.stringify(row), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // PUT/PATCH updates the customer data
  if (request.method === "PUT" || request.method === "PATCH") {
    const body = await request.json().catch(() => ({}));
    const company = body.CompanyName || body.companyName;
    const contact = body.ContactName || body.contactName;

    if (company === undefined && contact === undefined) {
      return new Response("Nothing to update", { status: 400 });
    }

    const updates = [];
    const values = [];
    if (company !== undefined) {
      updates.push("CompanyName = ?");
      values.push(company);
    }
    if (contact !== undefined) {
      updates.push("ContactName = ?");
      values.push(contact);
    }
    values.push(id);

    await env.prod_db
      .prepare(
        `UPDATE Customers SET ${updates.join(", ")} WHERE CustomerID = ?`,
      )
      .run(...values);

    const updated = await env.prod_db
      .prepare("SELECT * FROM Customers WHERE CustomerID = ?")
      .first(id);

    return new Response(JSON.stringify(updated || {}), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // DELETE removes the customer
  if (request.method === "DELETE") {
    await env.prod_db
      .prepare("DELETE FROM Customers WHERE CustomerID = ?")
      .run(id);
    return new Response(null, { status: 204 });
  }

  return new Response(null, { status: 405 });
}
