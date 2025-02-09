"use client";
import "./styles/globals.css";
// import styles from "./styles/layout.module.css";
import Link from "next/link";
import { UserProvider, useUser } from "@auth0/nextjs-auth0/client";

function Navbar() {
    const { user } = useUser();

    return (
        <nav>
            <div>
                <Link href="/">
                    <img src="/disc.png" alt="Logo" />
                </Link>
                <Link href="/">Home</Link>
                <Link href="/discovery">Discovery</Link>
            </div>
            <div>
                {user && <Link href="/upload">Upload</Link>}
                {user ? (
                    <Link href="/api/auth/logout" className="login_button">
                        Logout
                    </Link>
                ) : (
                    <Link href="/api/auth/login?prompt=login&returnTo=https://your-redirect-url.com" className="login_button">
                        Login
                    </Link>
                )}

                {user && (
                    <Link href={"/profile/" + user.sub}>
                        <img src="/free-user-icon-3296-thumb.png" alt="Logo" />
                    </Link>
                )}
            </div>
        </nav>
    );
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <title>Boom Box</title>
                <meta name="description" content="A great app for discovering music!" />
            </head>
            <UserProvider>
                <body>
                    <header>
                        <Navbar />
                    </header>
                    {children}
                </body>
            </UserProvider>
        </html>
    );
}
