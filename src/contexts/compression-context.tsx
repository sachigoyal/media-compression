'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { useFFmpeg } from '@/hooks/use-ffmpeg'
import { CompressionSettings } from '@/lib/ffmpeg-core'

type MediaType = 'video' | 'image'

interface CompressionState {
  file: File | null
  settings: CompressionSettings
  blob: Blob | null
  mediaType: MediaType
}

interface CompressionContextType {
  state: CompressionState
  ffmpeg: ReturnType<typeof useFFmpeg>
  setFile: (file: File | null) => void
  setSettings: (settings: CompressionSettings) => void
  setBlob: (blob: Blob | null) => void
  setMediaType: (type: MediaType) => void
  handleCompress: () => Promise<void>
  handleDownload: () => void
  handleReset: () => void
  isProcessing: boolean
}

const CompressionContext = createContext<CompressionContextType | undefined>(undefined)

export const useCompressionContext = () => {
  const context = useContext(CompressionContext)
  if (!context) {
    throw new Error('useCompressionContext must be used within a CompressionProvider')
  }
  return context
}

interface CompressionProviderProps {
  children: ReactNode
  initialMediaType?: MediaType
}

export const CompressionProvider: React.FC<CompressionProviderProps> = ({ 
  children, 
  initialMediaType = 'video' 
}) => {
  const ffmpeg = useFFmpeg()
  const [state, setState] = useState<CompressionState>({
    file: null,
    settings: {
      quality: 'medium',
      format: initialMediaType === 'video' ? 'mp4' : 'jpeg',
      resolution: 'original'
    },
    blob: null,
    mediaType: initialMediaType
  })

  const setFile = useCallback((file: File | null) => {
    setState(prev => ({ ...prev, file }))
  }, [])

  const setSettings = useCallback((settings: CompressionSettings) => {
    setState(prev => ({ ...prev, settings }))
  }, [])

  const setBlob = useCallback((blob: Blob | null) => {
    setState(prev => ({ ...prev, blob }))
  }, [])

  const setMediaType = useCallback((mediaType: MediaType) => {
    setState(prev => ({ 
      ...prev, 
      mediaType,
      settings: {
        ...prev.settings,
        format: mediaType === 'video' ? 'mp4' : 'jpeg'
      }
    }))
  }, [])

  const handleCompress = useCallback(async () => {
    if (!state.file) return
    
    try {
      const compressedBlob = state.mediaType === 'video' 
        ? await ffmpeg.compressVideo(state.file, state.settings)
        : await ffmpeg.compressImage(state.file, state.settings)
      setBlob(compressedBlob)
    } catch (error) {
      console.error(`${state.mediaType} compression failed:`, error)
    }
  }, [state.file, state.settings, state.mediaType, ffmpeg])

  const handleDownload = useCallback(() => {
    if (!state.blob) return
    
    const url = URL.createObjectURL(state.blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `compressed_${state.mediaType}.${state.settings.format}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [state.blob, state.settings.format, state.mediaType])

  const handleReset = useCallback(() => {
    setState(prev => ({ ...prev, file: null, blob: null }))
    ffmpeg.reset()
  }, [ffmpeg])

  const isProcessing = ffmpeg.progress.status === 'processing'

  const value: CompressionContextType = {
    state,
    ffmpeg,
    setFile,
    setSettings,
    setBlob,
    setMediaType,
    handleCompress,
    handleDownload,
    handleReset,
    isProcessing
  }

  return (
    <CompressionContext.Provider value={value}>
      {children}
    </CompressionContext.Provider>
  )
} 