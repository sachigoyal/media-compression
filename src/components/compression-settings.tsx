'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

export interface CompressionSettings {
  quality: 'low' | 'medium' | 'high'
  format: string
  resolution: string
}

interface CompressionSettingsProps {
  type: 'image' | 'video'
  settings: CompressionSettings
  onSettingsChange: (settings: CompressionSettings) => void
}

const videoFormats = [
  { value: 'mp4', label: 'MP4', description: 'Most compatible' },
  { value: 'webm', label: 'WebM', description: 'Smaller size' },
  { value: 'avi', label: 'AVI', description: 'Uncompressed' },
  { value: 'mov', label: 'MOV', description: 'Apple format' }
]

const imageFormats = [
  { value: 'jpeg', label: 'JPEG', description: 'Smaller size' },
  { value: 'png', label: 'PNG', description: 'Lossless' },
  { value: 'webp', label: 'WebP', description: 'Modern format' },
  { value: 'bmp', label: 'BMP', description: 'Uncompressed' }
]

const videoResolutions = [
  { value: 'original', label: 'Original', description: 'Keep original size' },
  { value: '1920:1080', label: '1080p', description: '1920×1080' },
  { value: '1280:720', label: '720p', description: '1280×720' },
  { value: '854:480', label: '480p', description: '854×480' },
  { value: '640:360', label: '360p', description: '640×360' }
]

const imageResolutions = [
  { value: 'original', label: 'Original', description: 'Keep original size' },
  { value: '1920:1080', label: 'Full HD', description: '1920×1080' },
  { value: '1280:720', label: 'HD', description: '1280×720' },
  { value: '800:600', label: 'SVGA', description: '800×600' },
  { value: '640:480', label: 'VGA', description: '640×480' }
]

const qualityOptions = [
  { value: 'low', label: 'Low', description: 'Smallest file size' },
  { value: 'medium', label: 'Medium', description: 'Balanced quality' },
  { value: 'high', label: 'High', description: 'Best quality' }
]

export function CompressionSettings({ 
  type, 
  settings, 
  onSettingsChange 
}: CompressionSettingsProps) {
  const formats = type === 'video' ? videoFormats : imageFormats
  const resolutions = type === 'video' ? videoResolutions : imageResolutions

  const updateSetting = (key: keyof CompressionSettings, value: string) => {
    onSettingsChange({
      ...settings,
      [key]: value
    })
  }

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'low': return 'destructive'
      case 'medium': return 'secondary'
      case 'high': return 'default'
      default: return 'secondary'
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Compression Settings
          <Badge variant="outline" className="capitalize">{type}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quality Setting */}
        <div className="space-y-2">
          <Label htmlFor="quality">Quality</Label>
          <Select 
            value={settings.quality} 
            onValueChange={(value) => updateSetting('quality', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select quality" />
            </SelectTrigger>
            <SelectContent>
              {qualityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <span>{option.label}</span>
                      <Badge 
                        variant={getQualityColor(option.value) as any}
                        className="text-xs"
                      >
                        {option.description}
                      </Badge>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Format Setting */}
        <div className="space-y-2">
          <Label htmlFor="format">Output Format</Label>
          <Select 
            value={settings.format} 
            onValueChange={(value) => updateSetting('format', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              {formats.map((format) => (
                <SelectItem key={format.value} value={format.value}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{format.label}</span>
                      <Badge variant="outline" className="text-xs">
                        {format.description}
                      </Badge>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Resolution Setting */}
        <div className="space-y-2">
          <Label htmlFor="resolution">Resolution</Label>
          <Select 
            value={settings.resolution} 
            onValueChange={(value) => updateSetting('resolution', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select resolution" />
            </SelectTrigger>
            <SelectContent>
              {resolutions.map((resolution) => (
                <SelectItem key={resolution.value} value={resolution.value}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{resolution.label}</span>
                      <Badge variant="outline" className="text-xs">
                        {resolution.description}
                      </Badge>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Settings Summary */}
        <div className="pt-4 border-t">
          <Label className="text-sm font-medium mb-2 block">Settings Summary</Label>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-xs">
              Quality: {settings.quality}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Format: {settings.format.toUpperCase()}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Resolution: {settings.resolution === 'original' ? 'Original' : settings.resolution.replace(':', '×')}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 