"use client";
import { useState } from "react";

export default function ImageUpload() {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [uploadMessage, setUploadMessage] = useState("");

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);

        // Show image preview
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(selectedFile);
    };

    const handleUpload = async () => {
        if (!file) return alert("Please select a file first!");

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            const data = (await res.json()).data;
            if (res.ok) {
                setUploadMessage(`Uploaded successfully! UUID: ${data.uuid}, View: ${data.ipfsUrl}, Song: ${data.song.songTitle}`);
            } else {
                setUploadMessage(`Error: ${data.error}`);
            }
        } catch (error) {
            console.log(error);
            setUploadMessage("Upload failed.");
        }
    };

    return (
        <div>
            <input type="file" accept="image/*" onChange={handleFileChange} />
            {preview && <img src={preview} alt="Preview" width={100} />}
            <button onClick={handleUpload}>Upload</button>
            {uploadMessage && <p>{uploadMessage}</p>}
        </div>
    );
}
