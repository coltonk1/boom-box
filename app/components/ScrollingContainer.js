// components/ScrollingContainer.js
"use client";
import { useEffect, useState, useRef } from "react";
import styles from "../styles/scrollingContainer.module.css";
import Post from "./Post";

const ScrollingContainer = ({ data }) => {
    // const [items, setItems] = useState(data);
    const scrollerRef = useRef(null);

    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch the most recent documents from the API
        const fetchDocuments = async () => {
            try {
                const res = await fetch("/api/getRecent");
                const data = await res.json();

                if (data.success) {
                    setDocuments(data.data); // Set documents in state
                    console.log(data.data);
                } else {
                    setError("Failed to fetch documents");
                }
            } catch (err) {
                setError("Error fetching data");
            } finally {
                setLoading(false);
            }
        };

        fetchDocuments();
    }, []);

    // useEffect(() => {
    //     const TIME = 5;

    //     // Ensure the ref is available before doing anything with it
    //     if (!scrollerRef.current) return;

    //     // Set the initial transition and transform
    //     scrollerRef.current.style.transition = `transform ${TIME}s linear`;
    //     scrollerRef.current.style.transform = "translateX(-300px)"; // Use translateX instead of translate

    //     const interval = setInterval(() => {
    //         // Only update state and manipulate the DOM if scrollerRef is available
    //         if (scrollerRef.current) {
    //             setDocuments((prevItems) => {
    //                 const updatedItems = [...prevItems];
    //                 updatedItems.push(updatedItems.shift()); // Shift items and push them back to create a looping effect

    //                 // Reset transition and immediately change the position
    //                 scrollerRef.current.style.transition = ""; // Remove transition to avoid interfering with the next transition
    //                 scrollerRef.current.style.transform = "translateX(0px)"; // Reset position

    //                 // After a small timeout, apply the transition again
    //                 setTimeout(() => {
    //                     if (scrollerRef.current) {
    //                         scrollerRef.current.style.transition = `transform ${TIME}s linear`;
    //                         scrollerRef.current.style.transform = "translateX(-300px)"; // Slide again
    //                     }
    //                 }, 50); // Small timeout to prevent immediate reset of transition

    //                 return updatedItems;
    //             });
    //         }
    //     }, TIME * 1000); // Make sure the interval is consistent with the transition time

    //     // Cleanup the interval when the component unmounts
    //     return () => clearInterval(interval);
    // }, []); // Run effect once on mount, no dependencies

    return (
        <div className={styles.scroll_container}>
            <div className={styles.scrolling_items} ref={scrollerRef}>
                {documents.slice(0, 6).map((item, index) => (
                    <div key={index} className={styles.scroll_item}>
                        <Post
                            key={index}
                            index={index}
                            ipfsHash={item.ipfsHash}
                            spotifyLink={item.songData.spotifyUrl}
                            uuid={item.uuid}
                            comments={item.comments}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ScrollingContainer;
