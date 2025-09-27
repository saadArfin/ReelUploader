import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * This file sets up the NextAuth.js authentication API route.
 *
 * - It imports NextAuth and the authentication options from your configuration.
 * - It creates a handler using NextAuth with your custom authOptions.
 * - It exports the handler for both GET and POST requests, enabling authentication actions like sign-in, sign-out, and session retrieval.
 *
 * This enables NextAuth.js to manage authentication for your app at the /api/auth/[...nextauth] endpoint.
 */

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };