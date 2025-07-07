import { useState, useCallback, useRef, useEffect } from 'react'
import { FFmpegCore, CompressionSettings, CompressionProgress } from '@/lib/ffmpeg-core'

export function useFFmpeg() {
  const [progress, setProgress] = useState<CompressionProgress>({
    status: 'idle',
    progress: 0
  })
  
  const ffmpegRef = useRef<FFmpegCore | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  
  const getInstance = useCallback(() => {
    if (!ffmpegRef.current) {
      ffmpegRef.current = new FFmpegCore(setProgress)
    }
    return ffmpegRef.current
  }, [])

  useEffect(() => {
    const initializeFFmpeg = async () => {
      try {
        const ffmpeg = getInstance()
        await ffmpeg.load()
        setIsInitialized(ffmpeg.loaded)
      } catch (error) {
        console.error('Failed to initialize FFmpeg:', error)
        setIsInitialized(false)
      }
    }

    initializeFFmpeg()
  }, [getInstance])
  
  const compressVideo = useCallback(async (file: File, settings: CompressionSettings) => {
    const ffmpeg = getInstance()
    return await ffmpeg.compressVideo(file, settings)
  }, [getInstance])
  
  const compressImage = useCallback(async (file: File, settings: CompressionSettings) => {
    const ffmpeg = getInstance()
    return await ffmpeg.compressImage(file, settings)
  }, [getInstance])
  
  const reset = useCallback(() => {
    if (ffmpegRef.current) {
      ffmpegRef.current.reset()
    }
  }, [])
  
  return {
    progress,
    compressVideo,
    compressImage,
    reset,
    isInitialized: ffmpegRef.current?.loaded ?? isInitialized
  }
} 