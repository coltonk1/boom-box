// components/ScrollingContainer.js
"use client";
import { useEffect, useState, useRef } from "react";
import styles from "../styles/scrollingContainer.module.css";

const ScrollingContainer = ({ data }) => {
    const [items, setItems] = useState(data);
    const scrollerRef = useRef(null);

    useEffect(() => {
        scrollerRef.current.style.transition = "transform 3s linear";
        scrollerRef.current.style.transform = "translate(-100px)";
        const interval = setInterval(() => {
            setItems((prevItems) => {
                const updatedItems = [...prevItems];
                updatedItems.push(updatedItems.shift());
                scrollerRef.current.style.transition = "";
                scrollerRef.current.style.transform = "translate(0px)";

                setTimeout(() => {
                    scrollerRef.current.style.transition = "transform 3s linear";
                    scrollerRef.current.style.transform = "translate(-100px)";
                }, 20);

                return updatedItems;
            });
        }, 3000);
        return () => clearInterval(interval);
    }, [data]);

    return (
        <div className={styles.scroll_container}>
            <div className={styles.scrolling_items} ref={scrollerRef}>
                {items.slice(0, 10).map((item, index) => (
                    <div key={index} className={styles.scroll_item}>
                        <div className={`${styles.content}`}>{item}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ScrollingContainer;
