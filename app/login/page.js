"use client";
import { useUser } from "@auth0/nextjs-auth0/client";
import React from "react";
import Link from "next/link";

export default function Login() {
    const { user, error, isLoading } = useUser();

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>{error.message}</div>;

    if (user) {
        return (
            <div>
                Welcome {user.name}! <Link href="/api/auth/logout">Logout</Link>
            </div>
        );
    }

    return <Link href="/api/auth/login?prompt=login">Login</Link>;
}
