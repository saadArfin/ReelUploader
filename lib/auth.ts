import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "./db";
import UserModel from "../models/User";

/**
 * This file configures NextAuth.js for custom authentication using email and password.
 *
 * Flow:
 * 1. The CredentialsProvider allows users to log in with their email and password.
 * 2. When a user submits their credentials:
 *    - The authorize() function runs.
 *    - It checks if both email and password are provided.
 *    - It connects to the database and looks for a user with the given email.
 *    - If the user is found, bcrypt compares the submitted password with the hashed password in the database.
 *    - If the password matches, it returns the user's id and email.
 *    - If not, it throws an error.
 * 3. If authentication succeeds:
 *    - The jwt callback adds the user's id to the JWT token.
 *    - The session callback adds the user's id to the session object, making it available on the client side.
 * 4. Custom pages are set for sign-in and error handling.
 * 5. Sessions use JWTs and last for 30 days.
 * 6. The secret is used to sign tokens securely.
 *
 * This setup enables secure, type-safe authentication using credentials, with the user's id available in the session for use throughout the app.
 */

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        try {
          await connectToDatabase();
          const user = await UserModel.findOne({ email: credentials.email });

          if (!user) {
            throw new Error("No user found with this email");
          }

          const isValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isValid) {
            throw new Error("Invalid password");
          }

          return {
            id: user._id.toString(),
            email: user.email,
          };
        } catch (error) {
          console.error("Auth error:", error);
          throw error;
        }
      },
    }),
  ],
  /**
 * Flow Explanation:
 *
 * 1. After a user successfully logs in, the jwt callback is triggered.
 *    - If a user object is present (i.e., after login), it adds the user's id to the JWT token.
 * 2. When the session is created or accessed on the client, the session callback runs.
 *    - It takes the id from the JWT token and adds it to session.user.id, making it available in the session object.
 *
 * This ensures the user's id is securely stored in the token and made available in the session for client-side use.
 */
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};