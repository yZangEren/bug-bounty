const users = [];
const REDACTED_USER_FIELDS = new Set([
  "password",
  "passwordHash",
  "confirmPassword",
  "passwordConfirmation",
]);

function redactSensitiveFields(user = {}) {
  return Object.fromEntries(
    Object.entries(user).filter(([key]) => !REDACTED_USER_FIELDS.has(key)),
  );
}

export async function listUsers() {
  return users.map(redactSensitiveFields);
}

export async function createUser(payload = {}) {
  const user = { id: `usr_${Date.now()}`, ...redactSensitiveFields(payload) };
  users.push(user);
  return redactSensitiveFields(user);
}
