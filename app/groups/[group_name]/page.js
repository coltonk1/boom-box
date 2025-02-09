"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { useEffect } from "react";
import Post from "@/app/components/Post";

export default function GroupPics() {
    const [data, setData] = useState([]);
    const { group_name } = useParams();
    const groupName = group_name;

    const getGroups = async () => {
        try {
            const res = await fetch(`/api/getGroupPosts`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ groupName: groupName }),
            });

            if (res.ok) {
                let result = await res.json();
                console.log(result.posts);
                setData(result.posts);
            } else {
                console.error("Failed to fetch user groups.");
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    useEffect(() => {
        getGroups();
    }, []);

    return (
        <div className="mainGroupContainer">
            <div
                style={{
                    display: "block",
                    columns: 4,
                    columnGap: "20px",
                    margin: "0 auto",
                    padding: "0 50px",
                }}
            >
                {data &&
                    data.map((info, index) => (
                        <Post
                            key={index}
                            index={index}
                            ipfsHash={info.ipfsHash}
                            spotifyLink={info.songData.spotifyUrl}
                            comments={info.comments}
                            uuid={info.uuid}
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
}
