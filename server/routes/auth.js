var express = require("express");
var router = express.Router();
const jwt = require("jsonwebtoken");

/* POST login. */
router.post("/login", function (req, res, next) {
  const { email, password } = req.body;

  const token = jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
  res.json({ message: "Login successful", email, token });
});

module.exports = router;
