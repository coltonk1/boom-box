import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = "BoomBox";
const USERS_COLLECTION = "users";

async function getUserJoinedGroups(userSub) {
    let client;
    try {
        client = new MongoClient(MONGODB_URI);
        await client.connect();
        const db = client.db(DB_NAME);
        const usersCollection = db.collection(USERS_COLLECTION);

        // Find the user by userSub
        const user = await usersCollection.findOne({ userSub });

        if (!user) {
            return null; // User not found
        }

        return user.joinedGroups || []; // Return joinedGroups, or an empty array if undefined
    } catch (error) {
        console.error("Error fetching user joinedGroups:", error);
        throw new Error("Failed to retrieve user joinedGroups");
    } finally {
        if (client) {
            await client.close();
        }
    }
}

// API route to get joinedGroups
export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const userSub = searchParams.get("userSub");

    if (!userSub) {
        return NextResponse.json({ success: false, error: "Missing userSub parameter" }, { status: 400 });
    }

    try {
        const joinedGroups = await getUserJoinedGroups(userSub);

        return NextResponse.json({
            success: true,
            joinedGroups: joinedGroups, // Returns the array or null
        });
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ success: false, error: "Server error occurred" }, { status: 500 });
    }
}
