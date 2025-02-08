"use client";
import { useState } from "react";

export default function ImageGrid() {
    // State to store the user input, API response, and loading status
    const [input, setInput] = useState("");
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);

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

    return (
        <div>
            <h1>How are you?</h1>
            <form onSubmit={handleSubmit}>
                <input type="text" value={input} onChange={handleInputChange} placeholder="Enter your mood" required />
            </form>
            {response && response.message && <div>{response.message.responseWithoutMood}</div>}

            <h2>Image Grid</h2>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                    gap: "10px",
                }}
            >
                {response &&
                    response.data &&
                    response.data.map((info, index) => (
                        <div key={index}>
                            <img
                                src={"https://gateway.pinata.cloud/ipfs/" + info.ipfsHash}
                                alt={`Image ${index + 1}`}
                                style={{ width: "100%", borderRadius: "8px" }}
                            />
                        </div>
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
