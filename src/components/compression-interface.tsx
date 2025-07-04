'use client'

import React, { useState, useCallback } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileVideo, FileImage, Zap, Shield, Clock } from 'lucide-react'

import { FileUpload } from './file-upload'
import { CompressionSettings, type CompressionSettings as CompressionSettingsType } from './compression-settings'
import { ProgressTracker, type CompressionProgress } from './progress-tracker'
import { ThemeToggle } from './theme-toggle'
import { useFFmpeg } from '@/hooks/use-ffmpeg'

export function CompressionInterface() {
  // FFmpeg hook
  const videoFFmpeg = useFFmpeg()
  const imageFFmpeg = useFFmpeg()

  // Video compression state
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoSettings, setVideoSettings] = useState<CompressionSettingsType>({
    quality: 'medium',
    format: 'mp4',
    resolution: 'original'
  })
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null)

  // Image compression state
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageSettings, setImageSettings] = useState<CompressionSettingsType>({
    quality: 'medium',
    format: 'jpeg',
    resolution: 'original'
  })
  const [imageBlob, setImageBlob] = useState<Blob | null>(null)

  const handleVideoCompress = useCallback(async () => {
    if (!videoFile) return
    
    try {
      const startTime = Date.now()
      const blob = await videoFFmpeg.compressVideo(videoFile, {
        quality: videoSettings.quality,
        format: videoSettings.format,
        resolution: videoSettings.resolution
      })
      const endTime = Date.now()
      
      setVideoBlob(blob)
      
    } catch (error) {
      console.error('Video compression failed:', error)
    }
  }, [videoFile, videoSettings, videoFFmpeg])

  const handleImageCompress = useCallback(async () => {
    if (!imageFile) return
    
    try {
      const startTime = Date.now()
      const blob = await imageFFmpeg.compressImage(imageFile, {
        quality: imageSettings.quality,
        format: imageSettings.format,
        resolution: imageSettings.resolution
      })
      const endTime = Date.now()
      
      setImageBlob(blob)
      
    } catch (error) {
      console.error('Image compression failed:', error)
    }
  }, [imageFile, imageSettings, imageFFmpeg])

  const handleVideoDownload = useCallback(() => {
    if (videoBlob) {
      const url = URL.createObjectURL(videoBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `compressed_video.${videoSettings.format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }, [videoBlob, videoSettings.format])

  const handleImageDownload = useCallback(() => {
    if (imageBlob) {
      const url = URL.createObjectURL(imageBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `compressed_image.${imageSettings.format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }, [imageBlob, imageSettings.format])

  const resetVideo = useCallback(() => {
    setVideoFile(null)
    setVideoBlob(null)
    videoFFmpeg.reset()
  }, [videoFFmpeg])

  const resetImage = useCallback(() => {
    setImageFile(null)
    setImageBlob(null)
    imageFFmpeg.reset()
  }, [imageFFmpeg])

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8 relative">
        <div className="absolute top-0 right-0">
          <ThemeToggle />
        </div>
        <h1 className="text-4xl font-bold mb-4">Media Compressor</h1>
        <p className="text-lg text-muted-foreground mb-6">
          Compress your videos and images with advanced FFmpeg processing
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="flex items-center justify-center gap-2 p-4 bg-muted rounded-lg">
            <Zap className="h-5 w-5 text-yellow-500" />
            <span className="text-sm font-medium">Fast Processing</span>
          </div>
          <div className="flex items-center justify-center gap-2 p-4 bg-muted rounded-lg">
            <Shield className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium">Secure & Private</span>
          </div>
          <div className="flex items-center justify-center gap-2 p-4 bg-muted rounded-lg">
            <Clock className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-medium">Real-time Progress</span>
          </div>
        </div>
      </div>

      {/* Main Compression Interface */}
      <Tabs defaultValue="video" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="video" className="flex items-center gap-2">
            <FileVideo className="h-4 w-4" />
            Video Compression
          </TabsTrigger>
          <TabsTrigger value="image" className="flex items-center gap-2">
            <FileImage className="h-4 w-4" />
            Image Compression
          </TabsTrigger>
        </TabsList>

        {/* Video Compression Tab */}
        <TabsContent value="video" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileVideo className="h-5 w-5" />
                Video Compression
              </CardTitle>
              <CardDescription>
                Compress MP4, AVI, MOV, and other video formats with customizable quality settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <FileUpload
                    type="video"
                    accept="video/*"
                    maxSize={500}
                    onFileSelect={setVideoFile}
                    currentFile={videoFile}
                    onRemove={resetVideo}
                  />
                  
                  {videoFile && (
                    <Button 
                      onClick={handleVideoCompress} 
                      className="w-full"
                      disabled={videoFFmpeg.progress.status === 'processing' || videoFFmpeg.progress.status === 'loading'}
                    >
                      {videoFFmpeg.progress.status === 'loading' ? 'Loading FFmpeg...' : 
                       videoFFmpeg.progress.status === 'processing' ? 'Compressing...' : 
                       'Compress Video'}
                    </Button>
                  )}
                </div>
                
                <CompressionSettings
                  type="video"
                  settings={videoSettings}
                  onSettingsChange={setVideoSettings}
                />
              </div>
              
              <ProgressTracker
                progress={{
                  status: videoFFmpeg.progress.status === 'loading' ? 'processing' : 
                          videoFFmpeg.progress.status === 'completed' && videoBlob ? 'completed' : 
                          videoFFmpeg.progress.status,
                  progress: videoFFmpeg.progress.progress,
                  originalSize: videoFile?.size,
                  compressedSize: videoBlob?.size,
                  compressionRatio: videoFile && videoBlob ? 1 - (videoBlob.size / videoFile.size) : undefined,
                  downloadUrl: videoBlob ? 'available' : undefined,
                  error: videoFFmpeg.progress.error
                }}
                onDownload={handleVideoDownload}
                onReset={resetVideo}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Image Compression Tab */}
        <TabsContent value="image" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileImage className="h-5 w-5" />
                Image Compression
              </CardTitle>
              <CardDescription>
                Compress JPEG, PNG, WebP, and other image formats while maintaining quality.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <FileUpload
                    type="image"
                    accept="image/*"
                    maxSize={50}
                    onFileSelect={setImageFile}
                    currentFile={imageFile}
                    onRemove={resetImage}
                  />
                  
                  {imageFile && (
                    <Button 
                      onClick={handleImageCompress} 
                      className="w-full"
                      disabled={imageFFmpeg.progress.status === 'processing' || imageFFmpeg.progress.status === 'loading'}
                    >
                      {imageFFmpeg.progress.status === 'loading' ? 'Loading FFmpeg...' : 
                       imageFFmpeg.progress.status === 'processing' ? 'Compressing...' : 
                       'Compress Image'}
                    </Button>
                  )}
                </div>
                
                <CompressionSettings
                  type="image"
                  settings={imageSettings}
                  onSettingsChange={setImageSettings}
                />
              </div>
              
              <ProgressTracker
                progress={{
                  status: imageFFmpeg.progress.status === 'loading' ? 'processing' : 
                          imageFFmpeg.progress.status === 'completed' && imageBlob ? 'completed' : 
                          imageFFmpeg.progress.status,
                  progress: imageFFmpeg.progress.progress,
                  originalSize: imageFile?.size,
                  compressedSize: imageBlob?.size,
                  compressionRatio: imageFile && imageBlob ? 1 - (imageBlob.size / imageFile.size) : undefined,
                  downloadUrl: imageBlob ? 'available' : undefined,
                  error: imageFFmpeg.progress.error
                }}
                onDownload={handleImageDownload}
                onReset={resetImage}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 