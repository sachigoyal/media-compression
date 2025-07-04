'use client'

import React, { useCallback, useState } from 'react'
import { Upload, X, FileVideo, FileImage } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  accept: string
  maxSize?: number // in MB
  currentFile?: File | null
  onRemove?: () => void
  type: 'image' | 'video'
}

export function FileUpload({ 
  onFileSelect, 
  accept, 
  maxSize = 100, 
  currentFile, 
  onRemove,
  type 
}: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [])

  const handleFileSelect = useCallback((file: File) => {
    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      alert(`File size must be less than ${maxSize}MB`)
      return
    }

    // Validate file type
    const acceptedTypes = accept.split(',').map(type => type.trim())
    const fileType = file.type
    const isValidType = acceptedTypes.some(acceptedType => {
      if (acceptedType.endsWith('/*')) {
        return fileType.startsWith(acceptedType.slice(0, -1))
      }
      return fileType === acceptedType
    })

    if (!isValidType) {
      alert(`Please select a valid ${type} file`)
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    onFileSelect(file)
  }, [accept, maxSize, onFileSelect, type])

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onRemove?.()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (currentFile && preview) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {type === 'image' ? (
                  <FileImage className="h-5 w-5 text-blue-500" />
                ) : (
                  <FileVideo className="h-5 w-5 text-green-500" />
                )}
                <div>
                  <p className="font-medium text-sm">{currentFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(currentFile.size)}
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleRemove}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="relative rounded-lg overflow-hidden bg-muted">
              {type === 'image' ? (
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="w-full h-48 object-cover"
                />
              ) : (
                <video 
                  src={preview} 
                  controls 
                  className="w-full h-48 object-cover"
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
            dragOver 
              ? "border-primary bg-primary/5" 
              : "border-muted-foreground/25 hover:border-muted-foreground/50"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="mx-auto mb-4">
            {type === 'image' ? (
              <FileImage className="h-12 w-12 text-muted-foreground mx-auto" />
            ) : (
              <FileVideo className="h-12 w-12 text-muted-foreground mx-auto" />
            )}
          </div>
          
          <div className="space-y-2">
            <p className="text-lg font-medium">
              Drop your {type} here, or click to browse
            </p>
            <p className="text-sm text-muted-foreground">
              Supports {accept.replace(/[*]/g, '').replace(/[/]/g, ' ').toUpperCase()} files up to {maxSize}MB
            </p>
          </div>

          <div className="mt-6">
            <Button asChild>
              <label className="cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                Choose File
                <input
                  type="file"
                  className="hidden"
                  accept={accept}
                  onChange={handleFileInputChange}
                />
              </label>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 