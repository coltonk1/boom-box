import { useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useRef } from "react";
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
    const postMenuRef = useRef(null);
    const user = useUser().user;
    const { index, ipfsHash, spotifyLink, uuid } = data;
    const comments_main = data.comments;
    const allowRemove = data.allowRemove || false;
    const reverseFunc = data.reverseFunc || null;
    const openInput = data.openInput || null;
    const [comments, setComments] = useState(comments_main || []);
    const [inputVal, setInputVal] = useState("");

    const handleSubmit = async (e) => {
        e.target.querySelector("input").value = "";

        e.preventDefault();
        // uuidToFind, username, description
        const res = await fetch(`/api/addComment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ uuid, username: user.nickname, description: inputVal }),
        });

        let result = await res.status;
        if (result == 200) {
            setComments([...comments, { username: user.nickname, description: inputVal }]);
        }
    };
    const handleChange = (e) => {
        setInputVal(e.target.value);
    };

    const openClose = (index) => {
        const element = document.querySelector(`[key='${index}']`);
        console.log(element);
    };

    return (
        <div key={index} className="postContainer" style={{ marginBottom: "30px" }}>
            {allowRemove ? (
                <div
                    className="trashCan"
                    onClick={(e) => {
                        postMenuRef.current.style.display = "block";
                        postMenuRef.current.addEventListener("mouseleave", () => {
                            postMenuRef.current.style.display = "none";
                        });
                    }}
                >
                    <img src="/dots.png" />
                    <div className="post_menu" ref={postMenuRef} style={{ display: "none" }}>
                        <button
                            onClick={async () => {
                                openInput(uuid);
                            }}
                        >
                            <p>Add to Group</p>
                            <img src="https://cdn-icons-png.flaticon.com/512/681/681494.png"></img>
                        </button>
                        <button
                            onClick={async () => {
                                try {
                                    const res = await fetch(`/api/removePost`, {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ uuid }),
                                    });
                                    if (res.ok) {
                                        reverseFunc();
                                    } else {
                                        // Handle failure (optional)
                                        console.error("Failed to remove post.");
                                    }
                                } catch (error) {
                                    console.error("Error:", error);
                                }
                            }}
                        >
                            <p>Delete</p>
                            <img src="https://uxwing.com/wp-content/themes/uxwing/download/user-interface/red-trash-can-icon.png"></img>
                        </button>
                    </div>
                </div>
            ) : null}
            <img
                src={"https://gateway.pinata.cloud/ipfs/" + ipfsHash}
                alt={`Image ${index + 1}`}
                style={{
                    width: "100%",
                    borderRadius: "8px",
                    background: "linear-gradient(to bottom right, white, grey, white, grey, white)",
                }}
                onClick={(e) => {
                    e.target.parentNode.querySelector(".fullPost").style.display = "flex";
                }}
            />
            <div className="fullPost" style={{ display: "none" }}>
                <div
                    style={{
                        position: "absolute",
                        fontWeight: "bold",
                        left: "50px",
                        top: "50%",
                        transform: "translate(0, -50%)",
                        cursor: "pointer",
                        paddingBottom: "80vh",
                        paddingTop: "20vh",
                        paddingLeft: "30px",
                        paddingRight: "30px",
                        fontSize: "4rem",
                    }}
                    onClick={(e) => {
                        e.target.parentNode.style.display = "none";
                    }}
                >
                    {"<"}
                </div>
                <div className="mainDisplay">
                    <img
                        src={"https://gateway.pinata.cloud/ipfs/" + ipfsHash}
                        alt={`Image ${index + 1}`}
                        style={{
                            maxWidth: "calc(100vw - 300px)",
                            maxHeight: "80vh",
                            margin: "auto 0",
                            objectFit: "contain",
                            borderRadius: "8px",
                            background: "linear-gradient(to bottom right, white, grey, white, grey, white)",
                        }}
                    />
                    <iframe
                        src={convertSpotifyLinkToEmbed(spotifyLink)}
                        style={{
                            background: "linear-gradient(to bottom right, white, grey, white, grey, white)",
                            flex: 0,
                            maxHeight: "80px",
                            width: "100%",
                        }}
                        width="100%"
                        frameBorder="0"
                        allowtransparency="true"
                        allow="encrypted-media"
                    />
                </div>
                <div className="allComments">
                    <div>
                        {comments &&
                            comments.map((item, index) => {
                                return (
                                    <div key={index}>
                                        <p className="username">@{item.username}</p>
                                        <p className="description">{item.description}</p>
                                    </div>
                                );
                            })}
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
