'use client'

import { useEffect, useState } from 'react'

export default function CustomCursor() {
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [isPointer, setIsPointer] = useState(false)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // specific check for mobile devices to prevent any listeners
        const isMobile = window.matchMedia('(pointer: coarse)').matches || window.innerWidth <= 768
        if (isMobile) return

        const updateCursor = (e: MouseEvent) => {
            setPosition({ x: e.clientX, y: e.clientY })

            // Check if hovering over clickable element
            const target = e.target as HTMLElement
            const isClickable =
                target.tagName === 'BUTTON' ||
                target.tagName === 'A' ||
                target.closest('button') !== null ||
                target.closest('a') !== null ||
                target.style.cursor === 'pointer' ||
                window.getComputedStyle(target).cursor === 'pointer'

            setIsPointer(isClickable)
        }

        const handleMouseEnter = () => setIsVisible(true)
        const handleMouseLeave = () => setIsVisible(false)

        document.addEventListener('mousemove', updateCursor)
        document.addEventListener('mouseenter', handleMouseEnter)
        document.addEventListener('mouseleave', handleMouseLeave)

        return () => {
            document.removeEventListener('mousemove', updateCursor)
            document.removeEventListener('mouseenter', handleMouseEnter)
            document.removeEventListener('mouseleave', handleMouseLeave)
        }
    }, [])

    if (!isVisible) return null

    return (
        <>
            {/* Main Cursor */}
            <div
                className="custom-cursor"
                style={{
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                }}
            >
                {isPointer ? (
                    // Hand cursor for clickable elements
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        {/* Glitch effect layers */}
                        <g className="glitch-layer-1">
                            <path d="M9 3V7M9 7V11L7 13V21H17V13L15 11V7M9 7H15M15 3V7M15 7V11"
                                stroke="#00ffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </g>
                        <g className="glitch-layer-2">
                            <path d="M9 3V7M9 7V11L7 13V21H17V13L15 11V7M9 7H15M15 3V7M15 7V11"
                                stroke="#ff00ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </g>
                        <g className="glitch-layer-main">
                            <path d="M9 3V7M9 7V11L7 13V21H17V13L15 11V7M9 7H15M15 3V7M15 7V11"
                                stroke="#000000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M9 3V7M9 7V11L7 13V21H17V13L15 11V7M9 7H15M15 3V7M15 7V11"
                                stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </g>
                    </svg>
                ) : (
                    // Arrow cursor for normal state
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        {/* Glitch effect layers */}
                        <g className="glitch-layer-1">
                            <path d="M3 3L10.5 20.5L13.5 13.5L20.5 10.5L3 3Z"
                                fill="#00ffff" stroke="#00ffff" strokeWidth="1" />
                        </g>
                        <g className="glitch-layer-2">
                            <path d="M3 3L10.5 20.5L13.5 13.5L20.5 10.5L3 3Z"
                                fill="#ff00ff" stroke="#ff00ff" strokeWidth="1" />
                        </g>
                        <g className="glitch-layer-main">
                            <path d="M3 3L10.5 20.5L13.5 13.5L20.5 10.5L3 3Z"
                                fill="#000000" stroke="#000000" strokeWidth="2" />
                            <path d="M3 3L10.5 20.5L13.5 13.5L20.5 10.5L3 3Z"
                                fill="#ffffff" stroke="#ffffff" strokeWidth="1" />
                        </g>
                    </svg>
                )}
            </div>

            {/* Cursor Trail Effect */}
            <div
                className="cursor-trail"
                style={{
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                }}
            />
        </>
    )
}
