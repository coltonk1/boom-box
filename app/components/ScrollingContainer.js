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

    useEffect(() => {
        scrollerRef.current.style.transition = "transform 10s linear";
        scrollerRef.current.style.transform = "translate(-300px)";
        const interval = setInterval(() => {
            setDocuments((prevItems) => {
                const updatedItems = [...prevItems];
                updatedItems.push(updatedItems.shift());
                scrollerRef.current.style.transition = "";
                scrollerRef.current.style.transform = "translate(0px)";
                console.log(updatedItems);
                setTimeout(() => {
                    scrollerRef.current.style.transition = "transform 10s linear";
                    scrollerRef.current.style.transform = "translate(-300px)";
                }, 50);

                return updatedItems;
            });
        }, 10000);
        return () => clearInterval(interval);
    }, [documents]);

    return (
        <div className={styles.scroll_container}>
            <div className={styles.scrolling_items} ref={scrollerRef}>
                {documents.slice(0, 10).map((item, index) => (
                    <div key={index} className={styles.scroll_item}>
                        <Post key={index} index={index} ipfsHash={item.ipfsHash} spotifyLink={item.songData.spotifyUrl} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ScrollingContainer;
