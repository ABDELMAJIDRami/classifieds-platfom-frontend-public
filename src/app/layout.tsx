"use client"

import {Geist} from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import axios from "@/core/network/axios";
import {useEffect, useState} from "react";
import {User} from "@/core/interfaces/User";
import { UserContext } from "@/core/contexts/UserContext";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});


export default function RootLayout({children}: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>();
  const [isFetchingUser, setIsFetchingUser] = useState<boolean>(true);

  const fetchUser = async () => {
    try {
      const response = await axios.get('/users/me');
      setUser(response.data);
    } catch (e) {
      console.error('Failed to load user:', e);
    } finally {
      setIsFetchingUser(false);
    }
  };

  useEffect(() => {
    fetchUser().then();
  }, []);

  console.log('User', user);

  return (
    <html lang="en" className="h-full">
    <body
      className={`${geistSans.className} min-h-full flex flex-col`}
    >
    <UserContext.Provider value={{user, setUser, isFetchingUser}}>
      <Header/>
      <main className="flex-1">
        {children}
      </main>
      <Footer/>
    </UserContext.Provider>
    </body>
    </html>
  );
}