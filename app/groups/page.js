"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { useEffect } from "react";
import { useState } from "react";
import Link from "next/link";
export default function GroupPage() {
    const [groups, setGroups] = useState([]);
    const { user } = useUser();

    const getGroups = async () => {
        if (!user?.sub) return; // Ensure user is defined before making the request

        try {
            const res = await fetch(`/api/getUserGroups?userSub=${user.sub}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });

            if (res.ok) {
                let result = await res.json();
                setGroups(result.joinedGroups);
            } else {
                console.error("Failed to fetch user groups.");
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    useEffect(() => {
        getGroups();
    }, [user]);

    return (
        <div className="mainGroupContainer2">
            <div className="groupItemContainer">
                {groups.map((item, index) => {
                    return (
                        <Link href={`/groups/${item}`} key={index}>
                            {item}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
