"use client";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import NotificationDropdown from "@/components/header/NotificationDropdown";
import UserDropdown from "@/components/header/UserDropdown";
import UniversalSearch from "@/components/header/UniversalSearch";
import { useSidebar } from "@/context/SidebarContext";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";

const AppHeader: React.FC = () => {
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);
  const [snowflakes, setSnowflakes] = useState<Array<{
    id: number;
    left: string;
    animationDuration: string;
    animationDelay: string;
    fontSize: string;
    drift: string;
    angle: number;
  }>>([]);

  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  const toggleApplicationMenu = () => {
    setApplicationMenuOpen(!isApplicationMenuOpen);
  };

  // Generate snowflakes only on client side to avoid hydration mismatch
  useEffect(() => {
    const generatedSnowflakes = Array.from({ length: 100 }, (_, i) => {
      const duration = Math.random() * 50 + 35; // 35-85 seconds
      // Distribute delays more evenly for continuous flow
      // Use negative delays for some snowflakes to start immediately
      const baseDelay = (i * (duration / 100)) % duration;
      const randomOffset = Math.random() * 2; // Small random offset
      // Use negative delays for first 30% of snowflakes to start immediately
      const delay = i < 30 ? -(Math.random() * duration * 0.3) : baseDelay + randomOffset;
      return {
        id: i,
        left: `${Math.random() * 100}%`,
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
        fontSize: `${Math.random() * 10 + 10}px`, // 10-20px
        drift: `${(Math.random() - 0.5) * 100}px`, // Horizontal drift
        angle: Math.random() < 0.5 ? -25 : 25, // -25 or +25 degrees
      };
    });
    setSnowflakes(generatedSnowflakes);
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes snowfall-movement {
            0% {
              transform: translateY(-100vh) translateX(0) rotate(0deg);
            }
            100% {
              transform: translateY(100vh) translateX(calc(var(--snow-drift, 0px) + var(--snow-angle-offset, 0px))) rotate(360deg);
            }
          }
          @keyframes snowfall-opacity {
            0% {
              opacity: 0;
            }
            1% {
              opacity: 0;
            }
            2% {
              opacity: 1;
            }
            12% {
              opacity: 0.8;
            }
            16% {
              opacity: 0.5;
            }
            20% {
              opacity: 0.2;
            }
            22% {
              opacity: 0;
            }
            24% {
              opacity: 0;
            }
            25% {
              opacity: 1;
            }
            31% {
              opacity: 0.8;
            }
            35% {
              opacity: 0.5;
            }
            39% {
              opacity: 0.2;
            }
            41% {
              opacity: 0;
            }
            43% {
              opacity: 0;
            }
            44% {
              opacity: 1;
            }
            50% {
              opacity: 0.8;
            }
            54% {
              opacity: 0.5;
            }
            58% {
              opacity: 0.2;
            }
            60% {
              opacity: 0;
            }
            62% {
              opacity: 0;
            }
            63% {
              opacity: 1;
            }
            69% {
              opacity: 0.8;
            }
            73% {
              opacity: 0.5;
            }
            77% {
              opacity: 0.2;
            }
            79% {
              opacity: 0;
            }
            81% {
              opacity: 0;
            }
            82% {
              opacity: 1;
            }
            88% {
              opacity: 0.7;
            }
            92% {
              opacity: 0.3;
            }
            96% {
              opacity: 0;
            }
            100% {
              opacity: 0;
            }
          }
          .snowflake {
            position: absolute;
            top: -10px;
            color: white;
            font-family: Arial, sans-serif;
            text-shadow: 0 0 5px rgba(221, 221, 221, 0.89);
            animation: snowfall-movement linear infinite, snowfall-opacity ease-in-out infinite;
            pointer-events: none;
            user-select: none;
            z-index: 1;
            opacity: 0;
          }
          .snowflake::before {
            content: "❄";
          }
        `
      }} />
      <header className="sticky top-0 flex w-full bg-white border-gray-200 z-99999 dark:border-gray-800 dark:bg-gray-900 lg:border-b relative">
        {/* Snowflakes container with overflow-hidden */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {snowflakes.map((snowflake) => {
            // Calculate horizontal offset based on angle (tan(15°) ≈ 0.268)
            // For 100vh drop, offset = 100vh * tan(angle)
            const angleOffset = `${100 * Math.tan((snowflake.angle * Math.PI) / 180)}vh`;
            return (
              <span
                key={snowflake.id}
                className="snowflake"
                style={{
                  left: snowflake.left,
                  animationDuration: snowflake.animationDuration,
                  animationDelay: snowflake.animationDelay,
                  fontSize: snowflake.fontSize,
                  '--snow-drift': snowflake.drift,
                  '--snow-angle-offset': angleOffset,
                } as React.CSSProperties & { '--snow-drift': string; '--snow-angle-offset': string }}
              />
            );
          })}
        </div>
      <div className="flex flex-col items-center justify-between grow lg:flex-row lg:px-6 relative z-50">
        <div className="flex items-center justify-between w-full gap-2 px-3 py-3 border-b border-gray-200 dark:border-gray-800 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-4">
          <button
            className="items-center justify-center w-10 h-10 text-gray-500 border-gray-200 rounded-lg z-99999 dark:border-gray-800 lg:flex dark:text-gray-400 lg:h-11 lg:w-11 lg:border"
            onClick={handleToggle}
            aria-label="Toggle Sidebar"
          >
            {isMobileOpen ? (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                  fill="currentColor"
                />
              </svg>
            ) : (
              <svg
                width="16"
                height="12"
                viewBox="0 0 16 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M0.583252 1C0.583252 0.585788 0.919038 0.25 1.33325 0.25H14.6666C15.0808 0.25 15.4166 0.585786 15.4166 1C15.4166 1.41421 15.0808 1.75 14.6666 1.75L1.33325 1.75C0.919038 1.75 0.583252 1.41422 0.583252 1ZM0.583252 11C0.583252 10.5858 0.919038 10.25 1.33325 10.25L14.6666 10.25C15.0808 10.25 15.4166 10.5858 15.4166 11C15.4166 11.4142 15.0808 11.75 14.6666 11.75L1.33325 11.75C0.919038 11.75 0.583252 11.4142 0.583252 11ZM1.33325 5.25C0.919038 5.25 0.583252 5.58579 0.583252 6C0.583252 6.41421 0.919038 6.75 1.33325 6.75L7.99992 6.75C8.41413 6.75 8.74992 6.41421 8.74992 6C8.74992 5.58579 8.41413 5.25 7.99992 5.25L1.33325 5.25Z"
                  fill="currentColor"
                />
              </svg>
            )}
            {/* Cross Icon */}
          </button>

          <Link href="/" className="lg:hidden">
            <Image
              width={154}
              height={32}
              className="dark:hidden"
              src="/images/logo/logo.svg"
              alt="Logo"
            />
            <Image
              width={154}
              height={32}
              className="hidden dark:block"
              src="/images/logo/logo-dark.svg"
              alt="Logo"
            />
          </Link>

          <button
            onClick={toggleApplicationMenu}
            className="flex items-center justify-center w-10 h-10 text-gray-700 rounded-lg z-99999 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M5.99902 10.4951C6.82745 10.4951 7.49902 11.1667 7.49902 11.9951V12.0051C7.49902 12.8335 6.82745 13.5051 5.99902 13.5051C5.1706 13.5051 4.49902 12.8335 4.49902 12.0051V11.9951C4.49902 11.1667 5.1706 10.4951 5.99902 10.4951ZM17.999 10.4951C18.8275 10.4951 19.499 11.1667 19.499 11.9951V12.0051C19.499 12.8335 18.8275 13.5051 17.999 13.5051C17.1706 13.5051 16.499 12.8335 16.499 12.0051V11.9951C16.499 11.1667 17.1706 10.4951 17.999 10.4951ZM13.499 11.9951C13.499 11.1667 12.8275 10.4951 11.999 10.4951C11.1706 10.4951 10.499 11.1667 10.499 11.9951V12.0051C10.499 12.8335 11.1706 13.5051 11.999 13.5051C12.8275 13.5051 13.499 12.8335 13.499 12.0051V11.9951Z"
                fill="currentColor"
              />
            </svg>
          </button>

          <div className="hidden lg:block">
            <UniversalSearch />
          </div>
        </div>
        <div
          className={`${
            isApplicationMenuOpen ? "flex" : "hidden"
          } items-center justify-between w-full gap-4 px-5 py-4 lg:flex shadow-theme-md lg:justify-end lg:px-0 lg:shadow-none`}
        >
          <div className="flex items-center gap-2 2xsm:gap-3">
            {/* <!-- Dark Mode Toggler --> */}
            <ThemeToggleButton />
            {/* <!-- Dark Mode Toggler --> */}

           <NotificationDropdown /> 
            {/* <!-- Notification Menu Area --> */}
          </div>
          
          {/* <!-- User Area --> */}
          <UserDropdown />
    
        </div>
      </div>
    </header>
    </>
  );
};

export default AppHeader;
