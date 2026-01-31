import { config } from "dotenv";
config();

const {
  NODE_ENV = "development",
  APP_PORT = 5500,

  FRONTEND_URL = "http://localhost:5555",
  GOOGLE_CALLBACK_URL = "http://localhost:5088/api/v1/auth/google/callback",

  GOOGLE_CLIENT_SECRET = "DEFAULT_GOOGLE_CLIENT_SECRET",
  GOOGLE_CLIENT_ID = "DEFAULT_GOOGLE_CLIENT_ID",

  SESSION_SECRET_KEY = "DEFAULT_SESSION_SECRET_KEY",
  ACCESS_TOKEN_SECRET = "DEFAULT_ACCESS_TOKEN_SECRET",

  MONGODB_URL = "mongodb://localhost:27017/mongodb-test",
} = process.env;

const ENV = {
  NODE_ENV,
  APP_PORT,

  FRONTEND_URL,
  GOOGLE_CALLBACK_URL,

  GOOGLE_CLIENT_SECRET,
  GOOGLE_CLIENT_ID,

  SESSION_SECRET_KEY,
  ACCESS_TOKEN_SECRET,

  MONGODB_URL,
};

export { ENV };
