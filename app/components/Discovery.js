"use client";
import { useState } from "react";
import styles from "@/app/styles/discovery.module.css";
import Post from "./Post";
function convertSpotifyLinkToEmbed(spotifyLink) {
    // Extract the track ID from the Spotify URL
    const regex = /(?:spotify\.com\/(?:track|album|playlist)\/)([\w\d]+)/;
    const match = spotifyLink.match(regex);

    if (match && match[1]) {
        const trackId = match[1];
        // Construct the embed URL
        const embedUrl = `https://open.spotify.com/embed/track/${trackId}`;
        return embedUrl;
    } else {
        throw new Error("Invalid Spotify URL");
    }
}

export default function ImageGrid() {
    // State to store the user input, API response, and loading status
    const [input, setInput] = useState("");
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showPlaylist, setShowPlaylist] = useState(false);

    // Handle input change
    const handleInputChange = (e) => {
        setInput(e.target.value);
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Replace with your API endpoint
            const res = await fetch(`/api/getPostsFromQuery`, {
                method: "POST",
                body: JSON.stringify({ query: input }),
            });

            const data = await res.json();
            setResponse(data);
            // setResponse(data); // Set the response (based on your API)
            // setImages(data.images || []); // Assuming images are part of the response
        } catch (error) {
            console.error("Error fetching data:", error);
        }

        setLoading(false);
    };

    const handlePlaylists = async () => {
        setLoading(true);

        try {
            const res = await fetch(`/api/generatePlaylist`, {
                method: "POST",
                body: JSON.stringify({ query: input }),
            });

            const data = await res.json();
            setResponse(data.data);
            setShowPlaylist(true);
        } catch (error) {
            console.error("Error fetching data:", error);
        }

        setLoading(false);
    };
    const handlePosts = async () => {
        setLoading(true);

        try {
            const res = await fetch(`/api/getPostsFromQuery`, {
                method: "POST",
                body: JSON.stringify({ query: input }),
            });

            const data = await res.json();
            const output = { data: data };
            setResponse(output.data);
            setShowPlaylist(false);
        } catch (error) {
            console.error("Error fetching data:", error);
        }

        setLoading(false);
    };

    if (showPlaylist) {
        return (
            <div className={styles.main}>
                <form onSubmit={handleSubmit}>
                    <input type="text" value={input} onChange={handleInputChange} placeholder="Enter your mood" required />
                </form>
                <div className={styles.options}>
                    <button onClick={() => handlePosts()}>Posts</button>
                    <button onClick={() => handlePlaylists()}>Personalized Playlist</button>
                </div>

                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        marginBottom: "30px",
                        gap: "10px",
                        rowGap: "30px",
                    }}
                >
                    {response &&
                        response.map((info, index) => (
                            <iframe
                                key={index}
                                src={convertSpotifyLinkToEmbed(info.spotifyUrl)}
                                style={{ background: "linear-gradient(to bottom right, white, grey, white, grey, white)" }}
                                width="100%"
                                height="80"
                                frameBorder="0"
                                allowtransparency="true"
                                allow="encrypted-media"
                            />
                        ))}
                    {/* {images.map((image, index) => (
                    <div key={index}>
                        <img src={image.url} alt={`Image ${index + 1}`} style={{ width: "100%", borderRadius: "8px" }} />
                    </div>
                ))} */}
                </div>
            </div>
        );
    } else {
        if (!response) {
            return (
                <div className={styles.main}>
                    <form onSubmit={handleSubmit}>
                        <input type="text" value={input} onChange={handleInputChange} placeholder="Enter your mood" required />
                    </form>
                    <div className="center">
                        <h1>
                            Uh oh! There's nothing here yet. Type in your mood, then enter to see posts.{" "}
                            <img className="sad_note" src="/sad_note.png"></img>
                        </h1>
                    </div>
                </div>
            );
        }
        return (
            <div className={styles.main}>
                <form onSubmit={handleSubmit}>
                    <input type="text" value={input} onChange={handleInputChange} placeholder="Enter your mood" required />
                </form>
                {response && response.message && <div className={styles.response}>{response.message.responseWithoutMood}</div>}
                {response && (
                    <div className={styles.options}>
                        <button onClick={() => handlePosts()}>Posts</button>
                        <button onClick={() => handlePlaylists()}>Personalized Playlist</button>
                    </div>
                )}

                {response.data.length == 0 && (
                    <div className="center">
                        <h1>
                            Oh no!! It looks like there are no posts under this mood. <img className="sad_note" src="/sad_note.png"></img>
                        </h1>
                    </div>
                )}

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                        gap: "10px",
                        rowGap: "30px",
                    }}
                >
                    {response &&
                        response.data &&
                        response.data.map((info, index) => (
                            <Post key={index} index={index} ipfsHash={info.ipfsHash} spotifyLink={info.songData.spotifyUrl} />
                        ))}
                    {/* {images.map((image, index) => (
                    <div key={index}>
                        <img src={image.url} alt={`Image ${index + 1}`} style={{ width: "100%", borderRadius: "8px" }} />
                    </div>
                ))} */}
                </div>
            </div>
        );
    }
}
