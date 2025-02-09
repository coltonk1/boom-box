import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = "BoomBox";
const COLLECTION_NAME = "users";

async function getNicknameBySub(sub) {
    let client;
    try {
        client = new MongoClient(MONGODB_URI);
        await client.connect();
        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);

        // Query to find user by 'sub' and only return the 'nickname' field
        const query = { sub: sub };
        const projection = { nickname: 1 }; // Only fetch the 'nickname' field

        // Retrieve the user and their nickname
        const user = await collection.findOne(query, { projection });

        if (!user) {
            return null; // Return null if no user is found
        }

        return user.nickname; // Return the user's nickname
    } catch (error) {
        console.error("Error retrieving nickname from MongoDB:", error);
        throw new Error("Failed to retrieve nickname");
    } finally {
        if (client) {
            await client.close();
        }
    }
}

export async function GET(req) {
    try {
        // Get the "sub" from the query params
        const { searchParams } = new URL(req.url);
        const sub = searchParams.get("sub");

        if (!sub) {
            return Response.json({ error: "Missing 'sub' query parameter" }, { status: 400 });
        }

        const nickname = await getNicknameBySub(sub);

        if (!nickname) {
            return Response.json({ error: "No user found with that sub" }, { status: 404 });
        }

        return Response.json({ nickname }, { status: 200 });
    } catch (error) {
        console.error(error);
        return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
