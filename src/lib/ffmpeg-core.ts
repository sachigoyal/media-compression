import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'

export interface CompressionSettings {
  quality: 'low' | 'medium' | 'high'
  format: string
  resolution: string
}

export interface CompressionProgress {
  status: 'idle' | 'loading' | 'processing' | 'completed' | 'error'
  progress: number
  error?: string
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

  async compressVideo(file: File, settings: CompressionSettings): Promise<Blob> {
    if (!this.isLoaded) {
      await this.load()
    }
    
    try {
      this.updateProgress({ status: 'processing', progress: 0 })
      
      const inputName = `input.${file.name.split('.').pop()}`
      const outputName = `output.${settings.format}`
      
      // Write input file
      await this.ffmpeg.writeFile(inputName, await fetchFile(file))
      
      // Build FFmpeg command
      const args = this.buildVideoCommand(inputName, outputName, settings)
      
      // Execute compression
      this.ffmpeg.on('progress', ({ progress }) => {
        this.updateProgress({ status: 'processing', progress: progress * 100 })
      })
      
      await this.ffmpeg.exec(args)
      
      // Read output
      const data = await this.ffmpeg.readFile(outputName)
      const blob = new Blob([data], { type: `video/${settings.format}` })
      
      // Clean up
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
      
      const inputName = `input.${file.name.split('.').pop()}`
      const outputName = `output.${settings.format}`
      
      // Write input file
      await this.ffmpeg.writeFile(inputName, await fetchFile(file))
      
      // Build FFmpeg command
      const args = this.buildImageCommand(inputName, outputName, settings)
      
      // Execute compression
      this.ffmpeg.on('progress', ({ progress }) => {
        this.updateProgress({ status: 'processing', progress: progress * 100 })
      })
      
      await this.ffmpeg.exec(args)
      
      // Read output
      const data = await this.ffmpeg.readFile(outputName)
      const blob = new Blob([data], { type: `image/${settings.format}` })
      
      // Clean up
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

  private buildVideoCommand(input: string, output: string, settings: CompressionSettings): string[] {
    const args = ['-i', input]
    
    // Quality settings
    switch (settings.quality) {
      case 'low':
        args.push('-crf', '32', '-preset', 'fast')
        break
      case 'medium':
        args.push('-crf', '23', '-preset', 'medium')
        break
      case 'high':
        args.push('-crf', '18', '-preset', 'slow')
        break
    }
    
    // Resolution
    if (settings.resolution !== 'original') {
      args.push('-s', settings.resolution)
    }
    
    // Codec
    args.push('-c:v', 'libx264', '-c:a', 'aac')
    
    args.push(output)
    return args
  }

  private buildImageCommand(input: string, output: string, settings: CompressionSettings): string[] {
    const args = ['-i', input]
    
    // Quality settings based on format
    if (settings.format === 'jpeg') {
      const quality = settings.quality === 'low' ? '2' : settings.quality === 'medium' ? '5' : '8'
      args.push('-q:v', quality)
    } else if (settings.format === 'webp') {
      const quality = settings.quality === 'low' ? '40' : settings.quality === 'medium' ? '70' : '90'
      args.push('-quality', quality)
    } else if (settings.format === 'png') {
      const compression = settings.quality === 'low' ? '9' : settings.quality === 'medium' ? '6' : '3'
      args.push('-compression_level', compression)
    }
    
    // Resolution
    if (settings.resolution !== 'original') {
      args.push('-s', settings.resolution)
    }
    
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