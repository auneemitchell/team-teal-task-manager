// Sample single Customer route (/api/customers/:id) for example Customers table

export async function onRequest(context) {
  const { request, env, params } = context;
  const id = params && params.id;

  const db = env.cf_db;
  const CORS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    if (!db) {
      return new Response(
        JSON.stringify({
          error: "No D1 binding found",
        }),
        { status: 500, headers: CORS },
      );
    }

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }

    // Check that ID is provided
    if (!id) {
      return new Response(JSON.stringify({ error: "Missing id" }), {
        status: 400,
        headers: CORS,
      });
    }

    // GET method
    if (request.method === "GET") {
      const row = await db
        .prepare("SELECT * FROM Customers WHERE CustomerID = ?")
        .first(id);
      if (!row)
        return new Response(JSON.stringify({}), { status: 404, headers: CORS });
      return new Response(JSON.stringify(row), { headers: CORS });
    }

    // PUT/PATCH method
    if (request.method === "PUT" || request.method === "PATCH") {
      const body = await request.json().catch(() => ({}));
      const company = body.CompanyName || body.companyName;
      const contact = body.ContactName || body.contactName;

      if (company === undefined && contact === undefined) {
        return new Response(JSON.stringify({ error: "Nothing to update" }), {
          status: 400,
          headers: CORS,
        });
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

      await db
        .prepare(
          `UPDATE Customers SET ${updates.join(", ")} WHERE CustomerID = ?`,
        )
        .run(...values);

      const updated = await db
        .prepare("SELECT * FROM Customers WHERE CustomerID = ?")
        .first(id);
      return new Response(JSON.stringify(updated || {}), { headers: CORS });
    }

    // DELETE method
    if (request.method === "DELETE") {
      await db.prepare("DELETE FROM Customers WHERE CustomerID = ?").run(id);
      return new Response(null, { status: 204, headers: CORS });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: CORS,
    });
  } catch (err) {
    console.error(
      `/api/customers/${id} error:`,
      err && err.stack ? err.stack : err,
    );
    return new Response(
      JSON.stringify({ error: String(err || "Internal error") }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }
}
