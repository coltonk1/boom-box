function convertSpotifyLinkToEmbed(spotifyLink) {
    // Extract the track ID from the Spotify URL
    const regex = /(?:spotify\.com\/(?:track|album|playlist)\/)([\w\d]+)/;
    const match = spotifyLink.match(regex);

    if (match && match[1]) {
        const trackId = match[1];
        // Construct the embed URL
        const embedUrl = `https://open.spotify.com/embed/track/${trackId}`;
        return embedUrl;
    } else {
        throw new Error("Invalid Spotify URL");
    }
}

export default function Post(data) {
    console.log(data);
    const { index, ipfsHash, spotifyLink } = data;
    return (
        <div key={index} className="postContainer">
            <img
                src={"https://gateway.pinata.cloud/ipfs/" + ipfsHash}
                alt={`Image ${index + 1}`}
                style={{
                    width: "100%",
                    borderRadius: "8px",
                    background: "linear-gradient(to bottom right, white, grey, white, grey, white)",
                }}
            />
            <iframe
                src={convertSpotifyLinkToEmbed(spotifyLink)}
                style={{ background: "linear-gradient(to bottom right, white, grey, white, grey, white)" }}
                width="100%"
                height="80"
                frameBorder="0"
                allowtransparency="true"
                allow="encrypted-media"
            />
        </div>
    );
}
