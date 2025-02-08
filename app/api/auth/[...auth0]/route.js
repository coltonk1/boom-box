// app/api/auth/[...auth0]/route.js
import { handleAuth } from "@auth0/nextjs-auth0";

export async function GET(req, res) {
    try {
        // Ensure you call handleAuth properly to handle the auth flow.
        return handleAuth()(req, res); // This will take care of auth and send the response.
    } catch (error) {
        console.error("Error handling Auth0 route:", error);
        return res.status(500).json({ error: error.message }); // Ensure you return a valid response in case of error
    }
}
