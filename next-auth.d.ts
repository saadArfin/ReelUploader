import { DefaultSession } from "next-auth";

/**
 * In this file, you are extending the NextAuth.js Session type to include a custom id property for the user object.
 *
 * Why?
 * By default, NextAuth's session only includes basic user info (like name, email, image).
 * If you need to access the user's unique id (from your database) on the client side, you must add it to the session type.
 * This TypeScript declaration tells NextAuth that your session's user object will also have an id property,
 * enabling type-safe access to session.user.id throughout your app.
 */

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}
