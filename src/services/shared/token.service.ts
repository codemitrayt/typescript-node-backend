import jwt from "jsonwebtoken";

import { ENV } from "../../config";
import { CustomJwtPayload } from "../../types/shared.types";

class TokenService {
  constructor() {}

  async signToken(payload: object, exp: string | number = "30d") {
    return jwt.sign(payload, ENV.ACCESS_TOKEN_SECRET, {
      expiresIn: exp,
      algorithm: "HS256",
    } as jwt.SignOptions);
  }

  verifyToken(token: string) {
    return jwt.verify(token, ENV.ACCESS_TOKEN_SECRET) as CustomJwtPayload;
  }
}

export default TokenService;
