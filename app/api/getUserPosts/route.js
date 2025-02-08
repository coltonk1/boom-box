import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = "BoomBox";
const COLLECTION_NAME = "uploads";
async function getPostsFromUser(userSub) {
    let client;
    try {
        client = new MongoClient(MONGODB_URI);
        await client.connect();
        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);
        const string = decodeURIComponent(userSub)
        // Query to find posts by GroupName
        const query = { userSub: string };
        
        console.log({query});

        // Retrieve posts from the collection
        const posts = await collection.find(query).toArray();

        console.log(`${posts.length} post(s) found for user: ${userSub}`);
        return posts; // Return the list of posts
    } catch (error) {
        console.error("Error retrieving posts from MongoDB:", error);
        throw new Error("Failed to retrieve posts");
    } finally {
        if (client) {
            await client.close();
        }
    }
}

// Main API route handler
export async function POST(req) {
    const data = await req.json();
    const userSub = data.userSub;

    try {
        const result = await getPostsFromUser(userSub);
        if (!result) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Nothing found",
                    message: error.message,
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Found photos successfully",
            posts: result,
        });
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Server error occurred",
                message: error.message,
            },
            { status: 500 }
        );
    }
}
