"use client"; // Required for listening to scroll events in the browser
import React, { useState, useEffect } from "react";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import obriveLogo from "@/app/assets/logo/obpark_title_logo.svg";
import { useRouter } from "next/navigation";

interface HeaderProps {
  categoryName: string;
}

export default function Header({ categoryName }: HeaderProps) {
  // 1. State tracking: Is the navbar visible, and what was the last scroll position?
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Always show the navbar if we are close to the very top of the page
      if (currentScrollY < 20) {
        setIsVisible(true);
      } 
      // If scrolling down, hide the navbar
      else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } 
      // If scrolling up, show the navbar
      else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }

      // Keep track of our position for the next scroll loop event
      setLastScrollY(currentScrollY);
    };

    // Attach the scroll listener to the browser window
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Clean up function: Removes the event listener when the user leaves the page
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]); // Re-run this effect block whenever lastScrollY updates

  return (
    /* 2. THE ANIMATION TRICK:
       - sticky top-0: Keeps the bar locked to the view ceiling.
       - transition-transform duration-300: Animates transitions smoothly.
       - translate-y-0: Shows it normally.
       - -translate-y-full: Slides it completely up off-screen out of sight.
    */
    <div 
      className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sticky top-0 z-50 transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-28"
      }`}
    >
      
      {/* Main Navbar Capsule */}
      <div className="w-full h-20 bg-gradient-to-b from-[#59D0B5]  to-[#CAEDE5] rounded-4xl px-8 py-11 flex items-center justify-between shadow-md">
        
        {/* LEFT SECTION: Flat Navigation Links */}
        <nav className="flex items-center gap-8 text-sm font-medium text-slate-800 tracking-tight">
          <Link href="/about" className="hover:opacity-80 transition-opacity">About</Link>
          <Link href="/shop" className="hover:opacity-80 transition-opacity">Shop</Link>
          <Link href="/download" className="hover:opacity-80 transition-opacity">App Download</Link>
        </nav>

        {/* CENTER SECTION: Brand Logo */}
          <div className="flex flex-rowtext-3xl font-black tracking-widest cursor-pointer"
          onClick={() => router.push("/")}
          >
            
                        <Image
                            src={obriveLogo}
                            alt="Obrive Logo"
                            width={130}
                            height={60}
                        />
            
            <span className="text-[8px] font-medium font-sans align-top relative -top-[7px]  text-[#022c22]">©</span>
          </div>

        {/* RIGHT SECTION: CTA Button */}
        <div className="flex items-center">
          <button className="bg-[#022c22] hover:bg-[#064e3b] text-white text-xs font-semibold tracking-wider px-6 py-3 rounded-full flex items-center gap-2 transition-colors group shadow-md  cursor-pointer">
            <span>SCHEDULE CALL</span>
            <ArrowUpRight className="h-6 w-6 text-[#CAEDE5] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>

      </div>
    </div>
  );
}