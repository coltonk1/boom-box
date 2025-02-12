"use client";
import { useUser } from "@auth0/nextjs-auth0/client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import styles from "../../styles/profile.module.css";
import Post from "../../components/Post";
import { useRef } from "react";

export default function Profile() {
    const { user, error, isLoading } = useUser();
    const { userSub } = useParams();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [nickname, setNickname] = useState("Loading...");
    const moveInputRef = useRef(null);

    const [currentUUID, setCurrentUUID] = useState(null);
    const [currentGroupName, setCurrentGroupName] = useState("");

    useEffect(() => {
        const getUserNickname = async () => {
            const res = await fetch(`/api/getUser?sub=${userSub}`);
            setNickname((await res.json()).nickname);
        };
        getUserNickname();

        if (!userSub) return; // Don't fetch if userSub is missing

        const fetchUserPosts = async () => {
            try {
                const res = await fetch(`/api/getUserPosts`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userSub }), // Send userSub to backend
                });

                const data = await res.json();

                if (data.success) {
                    console.log(data);
                    setPosts(data.posts); // Store retrieved posts
                    console.log(posts.length !== 0);
                } else {
                    console.error("Failed to fetch posts:", data.error);
                }
            } catch (error) {
                console.error("Error fetching posts:", error);
            } finally {
                // setLoading(false); // Stop loading
            }
        };

        fetchUserPosts();
    }, [userSub]);

    if (user) {
        console.log(posts.length);
        return (
            <>
                <div ref={moveInputRef} className="move_container" style={{ display: "none" }}>
                    <p>Note that a picture can only be included in 1 group.</p>
                    <input
                        onChange={(e) => {
                            setCurrentGroupName(e.target.value);
                        }}
                        id="move_input"
                        placeholder="What is the name of the group?"
                    ></input>
                    <button
                        id="move_input_submit"
                        onClick={async () => {
                            setLoading(true);
                            try {
                                const res = await fetch(`/api/setToGroup`, {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                        uuid: currentUUID,
                                        groupName: currentGroupName,
                                        userSub: user.sub,
                                        email: user.email,
                                        name: user.nickname,
                                    }),
                                });
                                if (res.ok) {
                                } else {
                                    // Handle failure (optional)
                                    console.error("Failed to remove post.");
                                }
                                setLoading(false);
                                moveInputRef.current.style.display = "none";
                            } catch (error) {
                                console.error("Error:", error);
                            }
                        }}
                    >
                        Confirm
                    </button>
                </div>
                <div className={styles.profile_container}>
                    <div>
                        <img src="/free-user-icon-3296-thumb.png" className={styles.profile_picture} alt="Profile" />
                    </div>
                    <p className={styles.user_info}>{nickname}</p>
                    <p className={styles.user_description}>
                        This is an example description. It can be used to describe what type of person you are or what youre into, basically
                        anything!
                    </p>
                    {posts.length !== 0 && (
                        <div className={styles.stats}>
                            <p>Most recent mood: {posts[posts.length - 1].mood}</p>
                            <p>Posts: {posts.length}</p>
                            {/* <p>(Amount of mood from each post, most recent mood, amount of posts, etc.)</p> */}
                        </div>
                    )}

                    <div
                        style={{
                            display: "block",
                            columns: 4,
                            columnGap: "20px",
                            margin: "0 auto",
                        }}
                    >
                        {posts && posts.length && posts.length !== 0 && userSub == user.sub
                            ? posts.map((post, index) => (
                                  <Post key={index} ipfsHash={post.ipfsHash} spotifyLink={post.songData?.spotifyUrl} />
                              ))
                            : posts.map((post, index) => (
                                  <Post
                                      key={index}
                                      ipfsHash={post.ipfsHash}
                                      spotifyLink={post.songData?.spotifyUrl}
                                      allowRemove={true}
                                      uuid={post.uuid}
                                      reverseFunc={() => {
                                          const updatedPosts = [...posts];
                                          updatedPosts.splice(index, 1);
                                          setPosts(updatedPosts);
                                      }}
                                      openInput={(uuid) => {
                                          setCurrentUUID(uuid);
                                          moveInputRef.current.style.display = "block";
                                      }}
                                  />
                              ))}
                    </div>
                </div>
            </>
        );
    }
}
