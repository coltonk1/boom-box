import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = "BoomBox";
const COLLECTION_NAME = "uploads";
const USERS_COLLECTION = "users";

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

async function updateUserJoinedGroups(userSub, email, name, groupName) {
    let client;
    try {
        client = new MongoClient(MONGODB_URI);
        await client.connect();
        const db = client.db(DB_NAME);
        const usersCollection = db.collection(USERS_COLLECTION);

        // Check if user already exists
        const user = await usersCollection.findOne({ userSub });

        if (!user) {
            // User doesn't exist, create new user with joinedGroups
            await usersCollection.insertOne({
                userSub,
                email,
                name,
                joinedGroups: [groupName],
            });

            return { success: true, message: "User created and group added" };
        }

        if (user.joinedGroups && user.joinedGroups.includes(groupName)) {
            return { success: true, message: "Group already in joinedGroups" };
        }

        // Add the group to joinedGroups if not already there
        const updateOperation = {
            $addToSet: { joinedGroups: groupName },
        };

        await usersCollection.updateOne({ userSub }, updateOperation);
        return { success: true, message: "Group added to joinedGroups" };
    } catch (error) {
        console.error("Error updating user joinedGroups:", error);
        return { success: false, error: "Failed to update user joinedGroups" };
    } finally {
        if (client) {
            await client.close();
        }
    }
}

// Main API route handler
export async function POST(req) {
    const data = await req.json();
    const { uuid, groupName, userSub, email, name } = data;

    try {
        const groupUpdateResult = await setGroup(uuid, groupName);
        if (groupUpdateResult == 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Nothing updated",
                },
                { status: 500 }
            );
        }

        const userUpdateResult = await updateUserJoinedGroups(userSub, email, name, groupName);
        if (!userUpdateResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: userUpdateResult.error,
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
