import fetch from "node-fetch";

// Store the token and its expiry in memory (for simplicity)
let cachedToken = null;
let tokenExpiry = null;

// Spotify API credentials
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

// Get access token from Spotify
export async function getAccessToken() {
    if (cachedToken && Date.now() < tokenExpiry) {
        // If token is still valid, return the cached token
        return cachedToken;
    }

    const authUrl = "https://accounts.spotify.com/api/token";
    const authData = new URLSearchParams({
        grant_type: "client_credentials",
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
    });

    const authHeaders = {
        "Content-Type": "application/x-www-form-urlencoded",
    };

    const authResponse = await fetch(authUrl, {
        method: "POST",
        headers: authHeaders,
        body: authData,
    });

    if (authResponse.ok) {
        const authJson = await authResponse.json();
        cachedToken = authJson.access_token;
        // Token expires in 1 hour (3600 seconds)
        tokenExpiry = Date.now() + 3600 * 1000;
        return cachedToken;
    } else {
        throw new Error(`Error getting access token: ${authResponse.statusText}`);
    }
}

// Search for a song by artist using the access token
export async function searchSongByArtist(songName, artistName, token) {
    const searchUrl = "https://api.spotify.com/v1/search";
    const headers = {
        Authorization: `Bearer ${token}`,
    };

    const query = `track:${songName} artist:${artistName}`;
    const params = new URLSearchParams({ q: query, type: "track", limit: 1 });

    const response = await fetch(`${searchUrl}?${params}`, { headers });

    if (response.ok) {
        const results = await response.json();
        const tracks = results.tracks.items;
        if (tracks.length > 0) {
            const track = tracks[0];
            const songTitle = track.name;
            const artist = track.artists[0].name;
            const spotifyUrl = track.external_urls.spotify;
            return { songTitle, artist, spotifyUrl };
        } else {
            return { error: "No results found." };
        }
    } else {
        return { error: `Error: ${response.status} - ${response.statusText}` };
    }
}
