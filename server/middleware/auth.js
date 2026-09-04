const { hkdf } = require("@panva/hkdf");
const { jwtDecrypt } = require("jose");

async function encryptionKey(secret) {
  return hkdf(
    "sha256",
    secret,
    "",
    "NextAuth.js Generated Encryption Key",
    32
  );
}

async function readSession(request) {
  if (!process.env.NEXTAUTH_SECRET) {
    throw new Error("NEXTAUTH_SECRET is required by the API");
  }

  const cookies = request.cookies || Object.fromEntries(
      (request.headers.cookie || "")
        .split(";")
        .map((part) => part.trim())
        .filter(Boolean)
        .map((part) => {
          const separator = part.indexOf("=");
          const name = separator >= 0 ? part.slice(0, separator) : part;
          const value = separator >= 0 ? part.slice(separator + 1) : "";
          return [name, decodeURIComponent(value)];
        })
    );

  const cookieNames = ["next-auth.session-token", "__Secure-next-auth.session-token"];
  const chunks = Object.entries(cookies)
    .filter(([name]) => cookieNames.some((base) => name === base || name.startsWith(`${base}.`)))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, value]) => value);
  if (chunks.length === 0) return null;

  try {
    const { payload } = await jwtDecrypt(
      chunks.join(""),
      await encryptionKey(process.env.NEXTAUTH_SECRET),
      { clockTolerance: 15 }
    );
    return payload;
  } catch (_error) {
    return null;
  }
}

async function requireUser(request, response, next) {
  try {
    const token = await readSession(request);
    if (!token?.id || !token?.email) {
      return response.status(401).json({ error: "Authentication required" });
    }
    request.user = { id: token.id, email: token.email, role: token.role || "user" };
    return next();
  } catch (error) {
    return next(error);
  }
}

function requireAdmin(request, response, next) {
  return requireUser(request, response, () => {
    if (request.user.role !== "admin") {
      return response.status(403).json({ error: "Administrator access required" });
    }
    return next();
  });
}

function requireSelfParam(paramName) {
  return (request, response, next) => {
    if (request.user.role === "admin" || request.params[paramName] === request.user.id) {
      return next();
    }
    return response.status(403).json({ error: "You can only access your own account data" });
  };
}

function requireSelfBody(fieldName) {
  return (request, response, next) => {
    if (request.user.role === "admin" || request.body?.[fieldName] === request.user.id) {
      return next();
    }
    return response.status(403).json({ error: "You can only modify your own account data" });
  };
}

module.exports = { requireUser, requireAdmin, requireSelfParam, requireSelfBody };
