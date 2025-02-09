import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { v4 as uuidv4 } from "uuid";
import { pinata } from "@/app/utils/config";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Jimp from "jimp";
import { getAccessToken, searchSongByArtist } from "./spotify";

// Environment variables and constants
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = "BoomBox";
const COLLECTION_NAME = "uploads";
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const MODEL_NAME = "gemini-2.0-flash";

// Upload file to Pinata
async function uploadToPinata(file) {
    try {
        const result = await pinata.upload.file(file);
        return result.IpfsHash;
    } catch (error) {
        console.error("Error uploading to Pinata:", error);
        throw new Error(`Failed to upload to Pinata: ${error.message}`);
    }
}

// Process image with sharp
async function processImage(file) {
    const buffer = await file.arrayBuffer();
    const image = await Jimp.read(Buffer.from(buffer));

    // Resize the image, maintaining aspect ratio
    image.resize(800, Jimp.AUTO); // Resize to a width of 800px, height is auto-calculated

    // Get the processed image as a buffer
    const processedBuffer = await image.getBufferAsync(Jimp.MIME_JPEG); // or Jimp.MIME_PNG if the image is PNG

    return processedBuffer;
}

// Helper function to convert buffer to base64
async function fileToGenerativePart(buffer, mimeType) {
    const base64 = Buffer.from(buffer).toString("base64");
    return {
        inlineData: {
            data: base64,
            mimeType,
        },
    };
}

// Get song recommendations from Google GenAI
async function getSongRecommendations(imageBuffer, mimeType) {
    try {
        const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
        const model = genAI.getGenerativeModel({
            model: MODEL_NAME,
        });

        const prompt =
            "Analyze the image and suggest a fitting English song, matching its tone and energy: for serene or peaceful images (nature, sunsets), recommend a mellow indie/folk song; for energetic images (parties, cityscapes), suggest an upbeat pop/electronic song; for emotional/introspective images (portraits, rainy days), choose a slower, emotional indie/alternative song; for vibrant/colorful scenes (celebrations, festivals), pick an upbeat, joyful song. Also classify the images by the mood they give off. Use basic / extremely simple moods that can easily be put into categories. The moods are based on the image provided, not the song. Format response as [song_name | artist_name | mood | description]. Do not say anything besides the format I requested. Ensure that the artist is the one that made the song in the response. Recommend a list of 3 just in case.";

        const imagePart = await fileToGenerativePart(imageBuffer, mimeType);

        const result = await model.generateContent([prompt, imagePart]);

        const response = await result.response;
        const text = response.text();

        // Parse the recommendations
        return text
            .split("\n")
            .filter((line) => line.trim())
            .map((line) => {
                const [songName, artistName, mood, description] = line
                    .replace(/[\[\]]/g, "")
                    .split("|")
                    .map((str) => str.trim());
                return { song: songName, artist: artistName, mood: mood, description: description };
            });
    } catch (error) {
        console.error("Error generating song recommendations:", error);
        throw new Error(`Failed to generate song recommendations: ${error.message}`);
    }
}

// Save data to MongoDB
async function saveToMongo(uuid, ipfsHash, songData, mood, description, userSub) {
    let client;
    try {
        client = new MongoClient(MONGODB_URI);
        await client.connect();
        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);

        await collection.insertOne({
            uuid,
            ipfsHash,
            songData,
            mood,
            description,
            createdAt: new Date(),
            userSub,
        });
    } catch (error) {
        console.error("Error saving to MongoDB:", error);
        throw new Error("Failed to save to database");
    } finally {
        if (client) {
            await client.close();
        }
    }
}

// Main API route handler
export async function POST(req) {
    try {
        const formData = await req.formData();
        const file = formData.get("file");
        const userSub = formData.get("user");

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        if (!file.type.startsWith("image/")) {
            return NextResponse.json({ error: "Uploaded file must be an image" }, { status: 400 });
        }

        // Process image and get recommendations in parallel
        const imageBuffer = await processImage(file);
        const [ipfsHash, aiSongs] = await Promise.all([uploadToPinata(file), getSongRecommendations(imageBuffer, file.type)]);

        var song;
        let description;
        let mood;
        for (let i = 0; i < aiSongs.length; i++) {
            const token = await getAccessToken();
            description = aiSongs[i].description;
            mood = aiSongs[i].mood;
            song = await searchSongByArtist(aiSongs[i].song, aiSongs[i].artist, token);
            if (!song.error) {
                break;
            }
        }

        const uuid = uuidv4();
        await saveToMongo(uuid, ipfsHash, song, mood, description, userSub);

        return NextResponse.json({
            success: true,
            message: "Upload successful",
            data: {
                uuid,
                ipfsUrl: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
                song,
            },
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
