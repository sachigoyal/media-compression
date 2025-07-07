import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'

export interface CompressionSettings {
  quality: 'speed' | 'low' | 'medium' | 'high'
  format: string
  resolution: string
}

export interface CompressionProgress {
  status: 'idle' | 'loading' | 'processing' | 'completed' | 'error'
  progress: number
  error?: string
}

const MEMORY_LIMITS = {
  speed: { maxPixels: 8000000, maxMemoryMB: 100 },
  low: { maxPixels: 12000000, maxMemoryMB: 150 },
  medium: { maxPixels: 16000000, maxMemoryMB: 200 },
  high: { maxPixels: 25000000, maxMemoryMB: 300 }
}

interface ImageMetadata {
  width: number
  height: number
  pixels: number
  estimatedMemoryMB: number
}

export class FFmpegCore {
  private ffmpeg: FFmpeg
  private isLoaded = false
  private onProgress?: (progress: CompressionProgress) => void

  constructor(onProgress?: (progress: CompressionProgress) => void) {
    this.ffmpeg = new FFmpeg()
    this.onProgress = onProgress
  }

  async load(): Promise<void> {
    if (this.isLoaded) return

    try {
      this.updateProgress({ status: 'loading', progress: 0 })
      
      const baseURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.4/dist/umd'
      
      await this.ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      })

      this.isLoaded = true
      this.updateProgress({ status: 'idle', progress: 0 })
    } catch (error) {
      this.updateProgress({ 
        status: 'error', 
        progress: 0, 
        error: error instanceof Error ? error.message : 'Failed to load FFmpeg' 
      })
      throw error
    }
  }

  private async getImageMetadata(file: File): Promise<ImageMetadata> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      
      img.onload = () => {
        URL.revokeObjectURL(url)
        const pixels = img.width * img.height
        const estimatedMemoryMB = (pixels * 4) / (1024 * 1024) * 3
        
        resolve({
          width: img.width,
          height: img.height,
          pixels,
          estimatedMemoryMB
        })
      }
      
      img.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('Failed to load image metadata'))
      }
      
      img.src = url
    })
  }

  private shouldResizeImage(metadata: ImageMetadata, settings: CompressionSettings): boolean {
    const limits = MEMORY_LIMITS[settings.quality]
    return metadata.pixels > limits.maxPixels || metadata.estimatedMemoryMB > limits.maxMemoryMB
  }

  private calculateSafeResolution(metadata: ImageMetadata, settings: CompressionSettings): string {
    const limits = MEMORY_LIMITS[settings.quality]
    const scale = Math.sqrt(limits.maxPixels / metadata.pixels)
    
    const newWidth = Math.floor(metadata.width * scale)
    const newHeight = Math.floor(metadata.height * scale)
    
    const evenWidth = newWidth % 2 === 0 ? newWidth : newWidth - 1
    const evenHeight = newHeight % 2 === 0 ? newHeight : newHeight - 1
    
    return `${evenWidth}:${evenHeight}`
  }

  async compressVideo(file: File, settings: CompressionSettings): Promise<Blob> {
    if (!this.isLoaded) {
      await this.load()
    }
    
    try {
      this.updateProgress({ status: 'processing', progress: 0 })
      
      const inputName = `input.${file.name.split('.').pop()}`
      const outputName = `output.${settings.format}`
      
      await this.ffmpeg.writeFile(inputName, await fetchFile(file))
      
      const args = this.buildVideoCommand(inputName, outputName, settings)
      
      this.ffmpeg.on('progress', ({ progress }) => {
        this.updateProgress({ status: 'processing', progress: progress * 100 })
      })
      
      await this.ffmpeg.exec(args)
      
      const data = await this.ffmpeg.readFile(outputName)
      const blob = new Blob([data], { type: `video/${settings.format}` })
      
      await this.ffmpeg.deleteFile(inputName)
      await this.ffmpeg.deleteFile(outputName)
      
      this.updateProgress({ status: 'completed', progress: 100 })
      return blob
      
    } catch (error) {
      this.updateProgress({ 
        status: 'error', 
        progress: 0, 
        error: error instanceof Error ? error.message : 'Compression failed' 
      })
      throw error
    }
  }

  async compressImage(file: File, settings: CompressionSettings): Promise<Blob> {
    if (!this.isLoaded) {
      await this.load()
    }
    
    try {
      this.updateProgress({ status: 'processing', progress: 0 })
      
      const metadata = await this.getImageMetadata(file)
      
      const inputName = `input.${file.name.split('.').pop()}`
      const outputName = `output.${settings.format}`
      
      await this.ffmpeg.writeFile(inputName, await fetchFile(file))
      
      const needsResize = this.shouldResizeImage(metadata, settings)
      const processedSettings = needsResize && settings.resolution === 'original' 
        ? (() => {
            const safeResolution = this.calculateSafeResolution(metadata, settings)
            console.warn(`Image too large for memory (${metadata.width}x${metadata.height}, ${metadata.estimatedMemoryMB.toFixed(1)}MB). Resizing to ${safeResolution}`)
            return { ...settings, resolution: safeResolution }
          })()
        : { ...settings }
      
      const args = this.buildImageCommand(inputName, outputName, processedSettings)
      
      this.ffmpeg.on('progress', ({ progress }) => {
        this.updateProgress({ status: 'processing', progress: progress * 100 })
      })
      
      await this.ffmpeg.exec(args)
      
      const data = await this.ffmpeg.readFile(outputName)
      const blob = new Blob([data], { type: `image/${settings.format}` })
      
      await this.ffmpeg.deleteFile(inputName)
      await this.ffmpeg.deleteFile(outputName)
      
      this.updateProgress({ status: 'completed', progress: 100 })
      return blob
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Compression failed'
      
      if (errorMessage.includes('memory') || errorMessage.includes('out of bounds')) {
        this.updateProgress({ 
          status: 'error', 
          progress: 0, 
          error: 'Image too large for processing. Try a smaller image or lower quality setting.' 
        })
      } else {
        this.updateProgress({ 
          status: 'error', 
          progress: 0, 
          error: errorMessage 
        })
      }
      throw error
    }
  }

  private buildVideoCommand(input: string, output: string, settings: CompressionSettings): string[] {
    const args = ['-i', input]
    
    switch (settings.quality) {
      case 'speed':
        args.push('-crf', '35', '-preset', 'ultrafast')
        args.push('-x264-params', 'aq-mode=0:me=dia:subme=1:ref=1')
        break
      case 'low':
        args.push('-crf', '32', '-preset', 'ultrafast')
        break
      case 'medium':
        args.push('-crf', '23', '-preset', 'superfast')
        break
      case 'high':
        args.push('-crf', '18', '-preset', 'fast')
        break
    }
    
    if (settings.resolution !== 'original') {
      args.push('-s', settings.resolution)
    }
    
    args.push('-c:v', 'libx264', '-c:a', 'aac')
    args.push('-threads', '0')

    if (settings.quality === 'speed') {
      args.push('-tune', 'zerolatency')
      args.push('-movflags', '+faststart')
    } else {
      args.push('-tune', 'fastdecode')
    }
    
    args.push(output)
    return args
  }

  private buildImageCommand(input: string, output: string, settings: CompressionSettings): string[] {
    const args = ['-i', input]
    
    args.push('-threads', '1')
    
    if (settings.format === 'jpeg') {
      const quality = settings.quality === 'low' ? '2' : settings.quality === 'medium' ? '5' : '8'
      args.push('-q:v', quality)
    } else if (settings.format === 'webp') {
      const quality = settings.quality === 'low' ? '40' : settings.quality === 'medium' ? '70' : '90'
      args.push('-quality', quality)
      if (settings.quality === 'speed') {
        args.push('-method', '0')
      }
    } else if (settings.format === 'png') {
      const compression = settings.quality === 'low' ? '9' : settings.quality === 'medium' ? '6' : '3'
      args.push('-compression_level', compression)
    }
    
    if (settings.resolution !== 'original') {
      args.push('-vf', `scale=${settings.resolution}:flags=lanczos`)
    }
    
    args.push('-an')
    args.push('-sn')
    
    args.push(output)
    return args
  }

  private updateProgress(progress: CompressionProgress): void {
    this.onProgress?.(progress)
  }

  reset(): void {
    this.updateProgress({ status: 'idle', progress: 0 })
  }

  get loaded(): boolean {
    return this.isLoaded
  }
} 