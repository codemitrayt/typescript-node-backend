import cors from "cors";
import session from "express-session";
import express, { Response, Request, Application } from "express";

import { ENV } from "../../config";
import { logger } from "../../logger";
import { NODE_ENV } from "../../constant";
import { errorHandler } from "../../middleware";
import { authRouter, uploadRouter } from "../../routes";

export class AppService {
  private app: Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
  }

  initializeMiddlewares() {
    const corsOption: cors.CorsOptions = {
      origin: "*",
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
      allowedHeaders: ["Content-Type", "Authorization"],
    };

    const sessionOptions = session({
      secret: ENV.SESSION_SECRET_KEY,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: ENV.NODE_ENV === NODE_ENV.PRODUCTION,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      },
    });

    this.app.options("*", cors(corsOption));
    this.app.use(cors(corsOption));
    this.app.use(sessionOptions);
    this.app.use(express.json());
    this.app.use(express.static("public"));
  }

  healthCheck = (req: Request, res: Response) => {
    const message = {
      status: "OK",
      message: "Server is running.",
    };

    return res.status(200).json(message);
  };

  initializeRoutes() {
    this.app.get("/", this.healthCheck);
    this.app.use("/api/v1/auth", authRouter);
    this.app.use("/api/v1/upload", uploadRouter);

    this.app.use(errorHandler);
  }

  async start() {
    const PORT = ENV.APP_PORT || 5500;
    try {
      this.app.listen(PORT, () =>
        logger.info(`Server listening on http://localhost:${PORT}`),
      );
    } catch (error) {
      if (error instanceof Error) {
        process.exit(1);
      }
    }
  }

  getApp() {
    return this.app;
  }
}
