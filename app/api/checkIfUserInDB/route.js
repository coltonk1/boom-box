import clientPromise from "@/lib/mongodb";
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = "BoomBox";
const COLLECTION_NAME = "users";

async function getUserBySub(sub) {
    let client;
    try {
        client = new MongoClient(MONGODB_URI);
        await client.connect();
        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);

        // Query to find user by 'sub'
        const query = { sub: sub };

        // Retrieve the user from the collection
        const user = await collection.findOne(query);

        return user; // Return the user (null if not found)
    } catch (error) {
        console.error("Error retrieving user from MongoDB:", error);
        throw new Error("Failed to retrieve user");
    } finally {
        if (client) {
            await client.close();
        }
    }
}

async function createUser(sub, nickname) {
    let client;
    try {
        client = new MongoClient(MONGODB_URI);
        await client.connect();
        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);

        // Insert new user into the database
        const newUser = { sub, nickname };

        const result = await collection.insertOne(newUser);

        console.log(`New user created with sub: ${sub}`);
        return newUser; // Return the newly created user
    } catch (error) {
        console.error("Error creating user in MongoDB:", error);
        throw new Error("Failed to create user");
    } finally {
        if (client) {
            await client.close();
        }
    }
}

export async function GET(req) {
    try {
        // Get the "sub" and "nickname" from the query params
        const { searchParams } = new URL(req.url);
        const sub = searchParams.get("sub");
        const nickname = searchParams.get("nickname");

        if (!sub || !nickname) {
            return Response.json({ error: "Missing 'sub' or 'nickname' query parameter" }, { status: 400 });
        }

        let user = await getUserBySub(sub);

        if (!user) {
            console.log(`No user found with sub: ${sub}, creating new user...`);
            user = await createUser(sub, nickname); // Create the user if not found
        }

        return Response.json(user, { status: 200 });
    } catch (error) {
        console.error(error);
        return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
