import test from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../app.js";

async function listen(app) {
  const server = app.listen(0);

  await new Promise((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });

  return server;
}

async function close(server) {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}

test("POST and GET /api/users do not expose submitted passwords", async () => {
  const app = createApp();
  const server = await listen(app);

  try {
    const { port } = server.address();
    const baseUrl = `http://127.0.0.1:${port}`;

    const createResponse = await fetch(`${baseUrl}/api/users`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: "Redaction Test",
        email: "redaction@example.com",
        password: "super-secret-password",
      }),
    });
    const createPayload = await createResponse.json();

    assert.equal(createResponse.status, 201);
    assert.equal(createPayload.success, true);
    assert.equal(createPayload.data.name, "Redaction Test");
    assert.equal(createPayload.data.email, "redaction@example.com");
    assert.equal("password" in createPayload.data, false);

    const listResponse = await fetch(`${baseUrl}/api/users`);
    const listPayload = await listResponse.json();

    assert.equal(listResponse.status, 200);
    assert.equal(listPayload.success, true);
    const createdUser = listPayload.data.find(
      (user) => user.email === "redaction@example.com",
    );

    assert.ok(createdUser);
    assert.equal(createdUser.name, "Redaction Test");
    assert.equal("password" in createdUser, false);
  } finally {
    await close(server);
  }
});
