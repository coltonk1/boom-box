"use client";
import { useState } from "react";

import styles from "@/app/styles/upload.module.css";
import { useUser } from "@auth0/nextjs-auth0/client";

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

    let user = useUser().user;

    const handleUpload = async () => {
        if (!file) return alert("Please select a file first!");

        const formData = new FormData();
        formData.append("file", file);
        if (!user) {
            return;
        }

        formData.append("user", user.sub);

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
        <div className={styles.upload_container}>
            <div className={styles.upload_button}>
                {preview ? (<img src={preview} alt="Preview" style={{width: "100%", height: "100%", objectFit: "cover", objectPosition: "center"}}></img>):(
                    <>
                        <img src="https://static-00.iconduck.com/assets.00/upload-icon-2048x2048-eu9n5hco.png"></img>
                        <input type="file" accept="image/*" onChange={handleFileChange} />
                    </>
                )}
            </div>
            <button onClick={handleUpload}>Upload</button>
            {uploadMessage && <><p>Upload Successful ✅</p><p>View in your profiles</p></>}
        </div>
    );
}
