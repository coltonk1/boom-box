import { useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";

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

export default function Post(data) {
    const user = useUser().user;
    const [inputVal, setInputVal] = useState("");
    const handleSubmit = (e) => {
        e.preventDefault();
        // uuidToFind, username, description
        console.log(inputVal);
        console.log(user.nickname);
    };
    const handleChange = (e) => {
        setInputVal(e.target.value);
    };
    console.log(data);
    const { index, ipfsHash, spotifyLink } = data;
    return (
        <div key={index} className="postContainer">
            <img
                src={"https://gateway.pinata.cloud/ipfs/" + ipfsHash}
                alt={`Image ${index + 1}`}
                style={{
                    width: "100%",
                    borderRadius: "8px",
                    background: "linear-gradient(to bottom right, white, grey, white, grey, white)",
                }}
                onClick={(e) => {
                    // handleClick(e, data.);
                }}
            />
            <div className="fullPost" style={{ display: "none" }}>
                <div>
                    <div>
                        <div>
                            <p>Name</p>
                            <p>Comment1</p>
                        </div>
                    </div>
                    <div className="commentSection">
                        <form
                            onSubmit={(e) => {
                                handleSubmit(e);
                            }}
                        >
                            <input
                                onChange={(e) => {
                                    handleChange(e);
                                }}
                                placeholder="Write a comment"
                            ></input>
                            <button type="submit">Submit</button>
                        </form>
                    </div>
                </div>
            </div>
            <iframe
                src={convertSpotifyLinkToEmbed(spotifyLink)}
                style={{ background: "linear-gradient(to bottom right, white, grey, white, grey, white)" }}
                width="100%"
                height="80"
                frameBorder="0"
                allowtransparency="true"
                allow="encrypted-media"
            />
        </div>
    );
}
