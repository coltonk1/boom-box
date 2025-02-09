"use client";
import { useUser } from "@auth0/nextjs-auth0/client";
export function CheckUser() {
    let user = useUser().user;

    const checkIfUserInDB = async (user) => {
        const res = await fetch(`/api/checkIfUserInDB?sub=${encodeURIComponent(user.sub)}&nickname=${user.nickname}`);
    };
    if (user) {
        checkIfUserInDB(user);
    }
    return <></>;
}
