import jwt from "jsonwebtoken";

export function checkAuth(req, res, next) {
  const token = req.cookies.node_api_token;

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({
      error: "invalid token",
    });
  }
}
