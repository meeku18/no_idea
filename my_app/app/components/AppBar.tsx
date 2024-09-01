"use client";
import { signIn, signOut, useSession } from "next-auth/react"
import React from "react";

export const AppBar = () => {
    const session = useSession();
    return <div className="flex justify-between mx-5">
        <div>
            MUSI
        </div>
        <div className="bg-blue-400 p-2">
            {session.data?.user && <button onClick={() => signOut()}>Logout</button>}
            {!session.data?.user && <button onClick={() => signIn()}>Signin</button>}
        </div>
    </div>
}   