import { NextResponse } from "next/server";
import { searchSongByArtist } from "./spotify"; // Import your existing searchSongByArtist function
import { getAccessToken } from "./spotify"; // Import your existing getAccessToken function
import { GoogleGenerativeAI } from "@google/generative-ai"; // Import Google Generative AI client

async function generatePlaylist(query, token) {
    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
    const MODEL_NAME = "gemini-2.0-flash"; // Adjust to your correct model name

    let songsList = [];
    try {
        const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
        const model = genAI.getGenerativeModel({
            model: MODEL_NAME,
        });

        const prompt =
            "Based on the following query, generate a list of songs that would fit the described emotion or mood. Provide a list of songs with the format 'Artist - Song Name'. You must return multiple songs if appropriate. Only include artist name and song name.";

        const result = await model.generateContent([`${prompt}: ${query}`]);

        const response = await result.response;
        const rawSongs = response.text().split("\n"); // Split the response into lines assuming each song is on a new line

        // Process each song into artist and song title
        for (let song of rawSongs) {
            const [artist, songTitle] = song.split(" - ");
            if (artist && songTitle) {
                const spotifyData = await searchSongByArtist(songTitle, artist, token);
                if (spotifyData.spotifyUrl) {
                    songsList.push({
                        songName: songTitle,
                        artist: artist,
                        spotifyUrl: spotifyData.spotifyUrl,
                    });
                }
            }
        }
    } catch (error) {
        console.error("Error generating song playlist from query:", error);
        throw new Error("Failed to generate playlist");
    }

    return songsList;
}

export async function POST(req) {
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

    try {
        const token = await getAccessToken(); // Get the access token for Spotify
        const playlist = await generatePlaylist(query, token);

        if (playlist.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: "No songs found for the given query.",
                },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                data: playlist, // Returning the playlist array with song details
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to generate playlist",
                message: error.message,
            },
            { status: 500 }
        );
    }
}
