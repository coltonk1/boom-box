"use client";
import { useUser } from "@auth0/nextjs-auth0/client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import styles from "../../styles/profile.module.css";
import Post from "../../components/Post";

export default function Profile() {
    const { user, error, isLoading } = useUser();
    const { userSub } = useParams();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
                setLoading(false); // Stop loading
            }
        };

        fetchUserPosts();
    }, [userSub]);

    if (user) {
        console.log(posts.length);
        return (
            <>
                <div className={styles.profile_container}>
                    <div>
                        <img src="/free-user-icon-3296-thumb.png" className={styles.profile_picture} alt="Profile" />
                    </div>
                    <p className={styles.user_info}>{user.nickname}</p>
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
                        {posts &&
                            posts.length &&
                            posts.length !== 0 &&
                            posts.map((post, index) => (
                                <Post key={index} ipfsHash={post.ipfsHash} spotifyLink={post.songData?.spotifyUrl} />
                            ))}
                    </div>
                </div>
            </>
        );
    }
}
