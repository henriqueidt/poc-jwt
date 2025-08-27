var express = require("express");
var router = express.Router();
const { createHmac } = require("node:crypto");

const users = [
  {
    name: "John Doe",
    email: "john@example.com",
    password: "password123",
  },
  {
    name: "Jane Doe",
    email: "jane@example.com",
    password: "password456",
  },
  {
    name: "Alice Smith",
    email: "alice@example.com",
    password: "password789",
  },
];

const HEADER = { alg: "HS256", typ: "JWT" };

function encodeBase64(str) {
  return Buffer.from(str).toString("base64").toString("utf-8");
}

function decodeBase64(str) {
  return Buffer.from(str, "base64").toString("utf-8");
}

router.post("/login", function (req, res, next) {
  const { email, password } = req.body;

  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const payload = {
    email: user.email,
    name: user.name,
    exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour expiration
  };

  const JWTHeader = encodeBase64(JSON.stringify(HEADER));
  const JWTPayload = encodeBase64(JSON.stringify(payload));

  const signature = createHmac("sha256", process.env.JWT_SECRET)
    .update(`${JWTHeader}.${JWTPayload}`)
    .digest("base64");
  const token = `${JWTHeader}.${JWTPayload}.${signature}`;

  res.json({ message: "Login successful", email, token });
});

module.exports = router;
