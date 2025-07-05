'use client'

import React from 'react'
import { CheckCircle, AlertCircle, Clock, Download, FileText } from 'lucide-react'
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
        return <Clock className="h-3 w-3 text-muted-foreground" />
      case 'processing':
        return <Clock className="h-3 w-3 text-primary animate-spin" />
      case 'completed':
        return <CheckCircle className="h-3 w-3 text-muted-foreground" />
      case 'error':
        return <AlertCircle className="h-3 w-3 text-destructive" />
      default:
        return <Clock className="h-3 w-3 text-muted-foreground" />
    }
  }

  const getStatusText = () => {
    switch (progress.status) {
      case 'idle':
        return 'Ready'
      case 'processing':
        return 'Processing'
      case 'completed':
        return 'Complete'
      case 'error':
        return 'Error'
      default:
        return 'Unknown'
    }
  }

  if (progress.status === 'idle') {
    return null
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {getStatusIcon()}
        <span className="text-sm font-medium">Progress</span>
        <Badge variant="outline" className="ml-auto text-xs h-4 px-1">
          {getStatusText()}
        </Badge>
      </div>

      {progress.status === 'processing' && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>Progress</span>
            <span>{Math.round(progress.progress)}%</span>
          </div>
          <Progress value={progress.progress} className="h-2" />
          {progress.estimatedTime && (
            <p className="text-xs text-muted-foreground">
              ETA: {formatTime(progress.estimatedTime)}
            </p>
          )}
        </div>
      )}

      {progress.status === 'error' && progress.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-3 w-3" />
          <AlertDescription className="text-xs">{progress.error}</AlertDescription>
        </Alert>
      )}

      {(progress.originalSize || progress.compressedSize) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
          {progress.originalSize && (
            <div className="text-center p-2 bg-muted border">
              <div className="text-muted-foreground">Original</div>
              <div className="font-semibold">
                {formatFileSize(progress.originalSize)}
              </div>
            </div>
          )}
          
          {progress.compressedSize && (
            <div className="text-center p-2 bg-muted border">
              <div className="text-muted-foreground">Compressed</div>
              <div className="font-semibold">
                {formatFileSize(progress.compressedSize)}
              </div>
            </div>
          )}
          
          {progress.compressionRatio && (
            <div className="text-center p-2 bg-muted border">
              <div className="text-muted-foreground">Saved</div>
              <div className="font-semibold">
                {Math.round(progress.compressionRatio * 100)}%
              </div>
            </div>
          )}
        </div>
      )}

      {progress.elapsedTime && (
        <div className="text-center text-xs text-muted-foreground">
          Completed in {formatTime(progress.elapsedTime)}
        </div>
      )}

      {progress.status === 'completed' && (
        <div className="flex gap-2 pt-2">
          {progress.downloadUrl && onDownload && (
            <Button onClick={onDownload} className="flex-1 h-8 text-xs">
              <Download className="h-3 w-3 mr-1" />
              Download
            </Button>
          )}
          {onReset && (
            <Button variant="outline" onClick={onReset} className="h-8 text-xs">
              <FileText className="h-3 w-3 mr-1" />
              Reset
            </Button>
          )}
        </div>
      )}

      {progress.status === 'error' && onReset && (
        <div className="pt-2">
          <Button variant="outline" onClick={onReset} className="w-full h-8 text-xs">
            Try Again
          </Button>
        </div>
      )}
    </div>
  )
} 