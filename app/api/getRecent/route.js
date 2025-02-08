import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";

async function getMostRecentDocuments() {
    const MONGODB_URI = process.env.MONGODB_URI;
    const DB_NAME = "BoomBox";
    const COLLECTION_NAME = "uploads";

    // Create a new MongoClient
    const client = new MongoClient(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        // Connect to the MongoDB server
        await client.connect();
        console.log("Connected to MongoDB");

        // Access the database and collection
        const database = client.db(DB_NAME);
        const collection = database.collection(COLLECTION_NAME);

        // Find the most recent 10 documents, sorted by createdAt
        const documents = await collection
            .find() // No filter, get all documents
            .sort({ createdAt: -1 }) // Sort by createdAt in descending order
            .limit(10) // Limit to the 10 most recent documents
            .toArray();

        // Return the documents
        return documents;
    } catch (error) {
        console.error("Error fetching documents:", error);
        throw error;
    } finally {
        // Close the connection to MongoDB
        await client.close();
    }
}

export async function GET(req) {
    let result = getMostRecentDocuments();

    return NextResponse.json(
        {
            success: true,
            data: await result,
        },
        { status: 200 }
    );
}
