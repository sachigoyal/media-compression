'use client'

import React from 'react'
import { CheckCircle, AlertCircle, Clock, Download, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'

export interface CompressionProgress {
  status: 'idle' | 'processing' | 'completed' | 'error'
  progress: number
  originalSize?: number
  compressedSize?: number
  compressionRatio?: number
  downloadUrl?: string
  error?: string
  estimatedTime?: number
  elapsedTime?: number
}

interface ProgressTrackerProps {
  progress: CompressionProgress
  onDownload?: () => void
  onReset?: () => void
}

export function ProgressTracker({ 
  progress, 
  onDownload, 
  onReset 
}: ProgressTrackerProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.round(seconds % 60)
    return `${minutes}m ${remainingSeconds}s`
  }

  const getStatusIcon = () => {
    switch (progress.status) {
      case 'idle':
        return <Clock className="h-5 w-5 text-muted-foreground" />
      case 'processing':
        return <Clock className="h-5 w-5 text-blue-500 animate-spin" />
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getStatusColor = () => {
    switch (progress.status) {
      case 'processing':
        return 'default'
      case 'completed':
        return 'default'
      case 'error':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const getStatusText = () => {
    switch (progress.status) {
      case 'idle':
        return 'Ready to compress'
      case 'processing':
        return 'Compressing...'
      case 'completed':
        return 'Compression complete'
      case 'error':
        return 'Compression failed'
      default:
        return 'Unknown status'
    }
  }

  if (progress.status === 'idle') {
    return null
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Compression Progress
          <Badge variant={getStatusColor() as any} className="ml-auto">
            {getStatusText()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        {progress.status === 'processing' && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(progress.progress)}%</span>
            </div>
            <Progress value={progress.progress} className="w-full" />
            {progress.estimatedTime && (
              <p className="text-sm text-muted-foreground">
                Estimated time remaining: {formatTime(progress.estimatedTime)}
              </p>
            )}
          </div>
        )}

        {/* Error Message */}
        {progress.status === 'error' && progress.error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{progress.error}</AlertDescription>
          </Alert>
        )}

        {/* File Size Information */}
        {(progress.originalSize || progress.compressedSize) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {progress.originalSize && (
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground">Original Size</div>
                <div className="text-lg font-semibold">
                  {formatFileSize(progress.originalSize)}
                </div>
              </div>
            )}
            
            {progress.compressedSize && (
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground">Compressed Size</div>
                <div className="text-lg font-semibold text-green-600">
                  {formatFileSize(progress.compressedSize)}
                </div>
              </div>
            )}
            
            {progress.compressionRatio && (
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground">Space Saved</div>
                <div className="text-lg font-semibold text-blue-600">
                  {Math.round(progress.compressionRatio * 100)}%
                </div>
              </div>
            )}
          </div>
        )}

        {/* Elapsed Time */}
        {progress.elapsedTime && (
          <div className="text-center text-sm text-muted-foreground">
            Processing completed in {formatTime(progress.elapsedTime)}
          </div>
        )}

        {/* Action Buttons */}
        {progress.status === 'completed' && (
          <div className="flex gap-2 pt-4">
            {progress.downloadUrl && onDownload && (
              <Button onClick={onDownload} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download Compressed File
              </Button>
            )}
            {onReset && (
              <Button variant="outline" onClick={onReset}>
                <FileText className="h-4 w-4 mr-2" />
                Compress Another
              </Button>
            )}
          </div>
        )}

        {progress.status === 'error' && onReset && (
          <div className="pt-4">
            <Button variant="outline" onClick={onReset} className="w-full">
              Try Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 