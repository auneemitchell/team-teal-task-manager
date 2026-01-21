// Sample Customers route (/api/customers) for example Customers table

export async function onRequest(context) {
  const { request, env } = context;

  const db = env.cf_db;
  const CORS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
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

    // GET method
    if (request.method === "GET") {
      const res = await db
        .prepare("SELECT * FROM Customers ORDER BY CustomerID")
        .all();
      return new Response(JSON.stringify(res.results || []), { headers: CORS });
    }

    // POST method
    if (request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      const company = (body.CompanyName || body.companyName || "").trim();
      const contact = body.ContactName || body.contactName || null;
      if (!company) {
        return new Response(JSON.stringify({ error: "Missing CompanyName" }), {
          status: 400,
          headers: CORS,
        });
      }

      const insertSql = "INSERT INTO Customers (CompanyName, ContactName) VALUES (?, ?)";
      const insertValues = [company, contact];
      const expectedInsertParams = (insertSql.match(/\?/g) || []).length;
      if (expectedInsertParams !== insertValues.length) {
        console.error('SQL parameter mismatch (INSERT)', { insertSql, expectedInsertParams, insertValuesLength: insertValues.length, insertValues });
        throw new Error('D1_ERROR: Wrong number of parameter bindings for SQL query.');
      }
      console.debug('Running SQL', insertSql, insertValues);
      await db.prepare(insertSql).run(...insertValues);

      const created = await db
        .prepare(
          "SELECT * FROM Customers WHERE CustomerID = last_insert_rowid()",
        )
        .first();
      return new Response(JSON.stringify(created || {}), {
        status: 201,
        headers: CORS,
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: CORS,
    });
  } catch (err) {
    console.error("/api/customers error:", err && err.stack ? err.stack : err);
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
