import ImageUpload from "../components/ImageUpload";

export default function Home() {
    return (
        <main className="upload_bg_container">
            <div className="topcenter">
                <h1>Create a Post</h1>
                <p>Upload a photo, and let BoomBox do the rest.</p>
            </div>
            <ImageUpload />
        </main>
    );
}
