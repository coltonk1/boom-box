import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { v4 as uuidv4 } from "uuid";
import { getAccessToken, searchSongByArtist } from "./spotify";
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = "BoomBox";
const COLLECTION_NAME = "uploads";
async function setGroup(uuidToFind, groupName) {
    let client;
    try {
        client = new MongoClient(MONGODB_URI);
        await client.connect();
        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);

        const updateOperation = {
            $set: { GroupName: groupName },
        };

        const result = await collection.updateOne(
            { uuidField: uuidToFind }, // Filter to find document by UUID
            updateOperation // The update operation
        );

        console.log(`Matched ${result.matchedCount} document(s)`);
        console.log(`Modified ${result.modifiedCount} document(s)`);
        return result.modifiedCount;
    } catch (error) {
        console.error("Error updating MongoDB:", error);
        throw new Error("Failed to save to database");
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
    const groupName = data.groupName;

    try {
        const result = setGroup(uuid, groupName);
        if (result == 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Nothing updated",
                    message: error.message,
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Updated successfully",
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
