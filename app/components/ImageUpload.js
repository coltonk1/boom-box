"use client";
import { useState } from "react";

import styles from "@/app/styles/upload.module.css";

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
            <div className={styles.upload_button}>
                <img src="https://static-00.iconduck.com/assets.00/upload-icon-2048x2048-eu9n5hco.png"></img>
                <input type="file" accept="image/*" onChange={handleFileChange} />
            </div>
            {preview && <img src={preview} alt="Preview" width={100} />}
            <button onClick={handleUpload}>Upload</button>
            {uploadMessage && <p>{uploadMessage}</p>}
        </div>
    );
}
