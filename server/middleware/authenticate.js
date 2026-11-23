const jwt = require("jsonwebtoken");

function authenticate(req, res, next) {
  const authorization = req.headers.authorization;
  const [scheme, token] = authorization ? authorization.split(" ") : [];

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Please log in to continue" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (typeof decoded.id !== "string") {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.userId = decoded.id;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

module.exports = authenticate;
