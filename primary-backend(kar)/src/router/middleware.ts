import { Request, Response, NextFunction } from "express";
import { JWT_PASSWORD } from "../config";
import jwt from "jsonwebtoken";

export function authMiddleware(req: Request, res: Response, next: NextFunction):void {
  const token = req.headers.authorization as unknown as string;

  try {
    const payload = jwt.verify(token, JWT_PASSWORD) as jwt.JwtPayload;
    if (payload.id) {
      req.id = payload.id;
    }
    next();
  } catch (e) {
    res.status(403).json({
      msg: "You are not logged in"
    });
    return;
  }
}
