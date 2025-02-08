'use client';
import { useUser, useAuth0 } from '@auth0/nextjs-auth0/client';
import React from 'react'

export default function Login() {
  const { user, error, isLoading } = useUser();
  const {loginWithRedirect} = useAuth0();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;

  if (user) {
    return (
      <div>
        Welcome {user.name}! <a href="/api/auth/logout">Logout</a>
      </div>
    );
  }

  return <a href="/api/auth/login">Login</a>;
}