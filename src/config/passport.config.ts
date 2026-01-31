import passport from "passport";
import {
  Strategy as GoogleStrategy,
  Profile,
  VerifyCallback,
} from "passport-google-oauth20";

import { ENV } from "./env.config";
import { IUser, UserRole } from "../types/user.types";

passport.use(
  new GoogleStrategy(
    {
      clientID: ENV.GOOGLE_CLIENT_ID!,
      clientSecret: ENV.GOOGLE_CLIENT_SECRET!,
      callbackURL: ENV.GOOGLE_CALLBACK_URL,
      scope: ["profile", "email"],
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: VerifyCallback,
    ) => {
      try {
        const user: Express.User = {
          _id: profile.id,
          email: profile.emails?.[0]?.value || "",
          fullName: profile.displayName,
          avatar: {
            url: profile.photos?.[0]?.value || "",
          },
          role: UserRole.USER,
          password: "test@123",
        };
        return done(null, user);
      } catch (error) {
        return done(error as Error);
      }
    },
  ),
);

passport.serializeUser((user: Express.User, done) => done(null, user));
passport.deserializeUser((user: Express.User, done) => done(null, user));

export { passport };
