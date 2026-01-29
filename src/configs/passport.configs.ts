import passport from "passport";
import {
  Strategy as GoogleStrategy,
  Profile,
  VerifyCallback,
} from "passport-google-oauth20";

import { ENV } from "./env.configs";
import { User, UserRole } from "../types/user.types";

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
        const user: User = {
          id: profile.id,
          email: profile.emails?.[0]?.value || "",
          displayName: profile.displayName,
          firstName: profile.name?.givenName || "",
          lastName: profile.name?.familyName || "",
          image: profile.photos?.[0]?.value || "",
          provider: profile.provider,
          role: UserRole.USER,
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
