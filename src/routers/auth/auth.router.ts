import { Router, Request, Response } from "express";

import { passport } from "../../configs";
import { logger } from "../../logger";

const authRouter = Router();

authRouter.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  }),
);

authRouter.get("/google/callback", [
  passport.authenticate("google", { session: false }),
  async (req: Request, res: Response) => {
    const user = req.user;
    logger.info({ msg: "Google user details", user });
    return res.redirect("http://localhost:5088");
  },
]);

export { authRouter };
