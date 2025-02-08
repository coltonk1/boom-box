import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { GoogleGenerativeAI } from "@google/generative-ai";

function extractAndRemoveMood(response) {
    // Regular expression to find the mood at the end in the format [Mood]
    const moodRegex = /\[([a-zA-Z]+)\]$/;

    response = response.trim();
    // Match the regex in the response string
    const match = response.match(moodRegex);

    // If a match is found, extract the mood and remove it from the string
    if (match && match[1]) {
        const mood = match[1]; // Extracts the mood (e.g., "Happy", "Sad")

        // Remove the mood from the string
        const responseWithoutMood = response.replace(moodRegex, "").trim();

        // Return an object with the mood and the modified string
        return {
            mood,
            responseWithoutMood,
        };
    }

    // If no mood is found, return the original string with null as the mood
    return {
        mood: null,
        responseWithoutMood: response,
    };
}

async function getDocumentsByMood(mood) {
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

        // Find documents matching the given mood, sorted by most recent (createdAt), limited to 10 results
        const documents = await collection
            .find({ mood: mood }) // Filter by mood
            .sort({ createdAt: -1 }) // Sort by createdAt field in descending order (most recent)
            .limit(20) // Limit the result to 10 documents
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

export async function POST(req) {
    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
    const MODEL_NAME = "gemini-2.0-flash";

    const data = await req.json();
    const query = data.query;

    if (!query) {
        return NextResponse.json(
            {
                success: false,
                error: `Query parameter is required.`,
            },
            { status: 400 }
        );
    }

    let text;
    try {
        const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
        const model = genAI.getGenerativeModel({
            model: MODEL_NAME,
        });

        const prompt =
            "Analyze the response to 'How are you feeling?' and determine the mood using basic categories. Provide a brief response with the mood at the end, and conclude by hoping these recommended posts on BoomBox are relatable, without explicitly recommending posts. Example moods: [Sad], [Happy], [Joyful]. Include the mood at the very end. Only include one mood. Do not respond to this prompt, but the one that is inputted. Act as if you are responding to them. Be kind. Dont be cringe. Be semi professional.";

        const result = await model.generateContent([`${prompt} : ${query}`]);

        const response = await result.response;
        text = extractAndRemoveMood(response.text()); // Extract mood and clean response
    } catch (error) {
        console.error("Error generating song recommendations:", error);
        return NextResponse.json(
            {
                success: false,
                error: `Failed to generate song recommendations: ${error.message}`,
                message: error.message,
            },
            { status: 500 }
        );
    }

    let result = getDocumentsByMood(text.mood);

    // Return the cleaned text response
    return NextResponse.json(
        {
            success: true,
            data: await result,
            message: text,
        },
        { status: 200 }
    );
}
