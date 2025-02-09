import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = "BoomBox";
const COLLECTION_NAME = "uploads";
const USERS_COLLECTION = "users";

// Create a cached connection to reuse
let cachedClient = null;

async function getMongoClient() {
    if (cachedClient) {
        return cachedClient;
    }

    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    cachedClient = client;
    return client;
}

async function setGroup(uuidToFind, groupName) {
    if (!uuidToFind || !groupName) {
        throw new Error("Missing required parameters: uuid or groupName");
    }

    const client = await getMongoClient();
    try {
        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);

        const updateOperation = {
            $set: { groupName: groupName, isClosed: true },
        };

        const result = await collection.updateOne({ uuid: uuidToFind }, updateOperation);

        if (result.matchedCount === 0) {
            throw new Error(`No document found with uuid: ${uuidToFind}`);
        }

        return result.modifiedCount;
    } catch (error) {
        console.error("Error updating MongoDB:", error);
        throw error; // Propagate the error with original message
    }
}

async function updateUserJoinedGroups(userSub, email, name, groupName) {
    if (!userSub || !groupName) {
        throw new Error("Missing required parameters: userSub or groupName");
    }

    const client = await getMongoClient();
    try {
        const db = client.db(DB_NAME);
        const usersCollection = db.collection(USERS_COLLECTION);

        const user = await usersCollection.findOne({ sub: userSub });

        if (!user) {
            const newUser = {
                sub: userSub,
                email: email || null,
                nickname: name || null,
                joinedGroups: [groupName],
                createdAt: new Date(),
            };

            await usersCollection.insertOne(newUser);
            return { success: true, message: "User created and group added" };
        }

        // Update existing user
        const updateOperation = {
            $addToSet: { joinedGroups: groupName },
            $setOnInsert: {
                email: email || user.email,
                nickname: name || user.nickname,
            },
        };

        await usersCollection.updateOne({ sub: userSub }, updateOperation, { upsert: true });

        return { success: true, message: "Group added to joinedGroups" };
    } catch (error) {
        console.error("Error updating user joinedGroups:", error);
        throw error; // Propagate the error with original message
    }
}

export async function POST(req) {
    try {
        const data = await req.json();
        const { uuid, groupName, userSub, email, name } = data;

        // Validate required fields
        if (!uuid || !groupName || !userSub) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Missing required fields: uuid, groupName, or userSub",
                },
                { status: 400 }
            );
        }

        // Execute operations
        await setGroup(uuid, groupName);
        await updateUserJoinedGroups(userSub, email, name, groupName);

        return NextResponse.json({
            success: true,
            message: "Updated successfully",
        });
    } catch (error) {
        console.error("API Error:", error);

        // Return appropriate error message based on the error type
        const errorMessage = error.message || "Server error occurred";
        const statusCode = error.message.includes("No document found") ? 404 : 500;

        return NextResponse.json(
            {
                success: false,
                error: errorMessage,
            },
            { status: statusCode }
        );
    }
}
