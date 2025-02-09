import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = "BoomBox";
const COLLECTION_NAME = "uploads";

async function deletePostByUUID(uuid) {
    let client;
    try {
        client = new MongoClient(MONGODB_URI);
        await client.connect();
        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);

        // Query to find and delete the post by uuid
        const query = { uuid: decodeURIComponent(uuid) };
        console.log("Deleting post with query:", query);

        const result = await collection.deleteOne(query);
        console.log("Delete result:", result);

        return result.deletedCount > 0;
    } catch (error) {
        console.error("Error deleting post from MongoDB:", error);
        throw new Error("Failed to delete post");
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

    if (!uuid) {
        return NextResponse.json({ success: false, error: "UUID is required" }, { status: 400 });
    }

    try {
        const deleted = await deletePostByUUID(uuid);
        if (!deleted) {
            return NextResponse.json({ success: false, error: "Post not found or already deleted" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Post deleted successfully" });
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ success: false, error: "Server error occurred", message: error.message }, { status: 500 });
    }
}
