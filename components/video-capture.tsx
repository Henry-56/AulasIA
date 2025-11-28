"use client"

import type React from "react"

import { useEffect } from "react"

interface VideoCaptureProps {
  videoRef: React.RefObject<HTMLVideoElement | null>
  isRecording: boolean
}

export default function VideoCapture({ videoRef, isRecording }: VideoCaptureProps) {
  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
          },
          audio: false,
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream

          // Handle play() promise properly to avoid AbortError
          const playPromise = videoRef.current.play()

          if (playPromise !== undefined) {
            playPromise.catch((err) => {
              // Silently handle AbortError which is normal during component re-renders
              if (err.name !== 'AbortError') {
                console.error("Error playing video:", err)
              }
            })
          }
        }
      } catch (error) {
        console.error("Error accessing camera:", error)
      }
    }

    initCamera()

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
        tracks.forEach((track) => track.stop())
      }
    }
  }, [videoRef])

  return <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
}
