"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/Navbar"
import MapWithSidebar from "@/components/JordarnWeather/MapWithSidebar"

export default function HomePage() {
    const [isScrolled, setIsScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0)
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <main>
            <Navbar isScrolled={isScrolled} />
            <MapWithSidebar />
        </main>
    )
}
