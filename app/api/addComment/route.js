import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = "BoomBox";
const COLLECTION_NAME = "uploads";

async function addComment(uuidToFind, username, description) {
    let client;
    try {
        client = new MongoClient(MONGODB_URI);
        await client.connect();
        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);

        // Create the comment object
        const comment = {
            username: username,
            description: description,
            date: new Date(), // Add the current date/time
        };

        // Update the document by adding the comment to the 'comments' array
        const updateOperation = {
            $push: { comments: comment },
        };

        const result = await collection.updateOne(
            { uuid: uuidToFind }, // Filter to find document by UUID
            updateOperation // The update operation to add the comment
        );

        console.log(`Matched ${result.matchedCount} document(s)`);
        console.log(`Modified ${result.modifiedCount} document(s)`);
        return result.modifiedCount;
    } catch (error) {
        console.error("Error adding comment to MongoDB:", error);
        throw new Error("Failed to add comment to the database");
    } finally {
        if (client) {
            await client.close();
        }
    }
}

// Main API route handler
export async function POST(req) {
    const data = await req.json();
    const uuid = data.uuid;
    const username = data.username;
    const description = data.description;

    try {
        const result = await addComment(uuid, username, description);
        if (result === 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Nothing updated",
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Comment added successfully",
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
