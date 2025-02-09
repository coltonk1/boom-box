import { handleAuth, handleLogin } from "@auth0/nextjs-auth0";

export const GET = handleAuth({
    login: handleLogin({
        redirectUri: "https://localhost.com:3000/test", // Customize the redirect URL
    }),
});
