import jwt from "jsonwebtoken";

export const verifyJWT = (req, res, next) => {
  //const token = req.headers.authorization?.split(" ")[1];
  const token = req.cookies?.jwt;
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
