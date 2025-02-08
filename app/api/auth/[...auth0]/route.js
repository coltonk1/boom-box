// app/api/auth/[...auth0]/route.js
import { handleAuth } from "@auth0/nextjs-auth0";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        // Ensure you call handleAuth properly to handle the auth flow.
        const response = await handleAuth(req); // This will handle the auth flow
        return NextResponse.json(response); // Return the response as a JSON in a NextResponse
    } catch (error) {
        console.error("Error handling Auth0 route:", error);
        return NextResponse.json({ error: error.message }, { status: 500 }); // Return a 500 error with the message in JSON format
    }
}
