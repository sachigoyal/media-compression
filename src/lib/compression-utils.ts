export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const formatTime = (seconds: number): string => {
  if (seconds < 60) return `${Math.round(seconds)}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.round(seconds % 60)
  return `${minutes}m ${remainingSeconds}s`
}

export const calculateCompressionRatio = (originalSize: number, compressedSize: number): number => {
  return 1 - (compressedSize / originalSize)
}

export const downloadFile = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const validateFileSize = (file: File, maxSizeMB: number): boolean => {
  return file.size <= maxSizeMB * 1024 * 1024
}

export const getImageMemoryEstimate = async (file: File): Promise<{ width: number, height: number, estimatedMemoryMB: number }> => {
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
        estimatedMemoryMB
      })
    }
    
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }
    
    img.src = url
  })
}

export const isImageSafeForProcessing = (width: number, height: number, quality: 'speed' | 'low' | 'medium' | 'high'): boolean => {
  const pixels = width * height
  const limits = {
    speed: 8000000,
    low: 12000000,
    medium: 16000000,
    high: 25000000
  }
  
  return pixels <= limits[quality]
}

export const validateFileType = (file: File, acceptedTypes: string): boolean => {
  const types = acceptedTypes.split(',').map(type => type.trim())
  const fileType = file.type
  return types.some(acceptedType => {
    if (acceptedType.endsWith('/*')) {
      return fileType.startsWith(acceptedType.slice(0, -1))
    }
    return fileType === acceptedType
  })
}

export const createFilePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string)
      } else {
        reject(new Error('Failed to read file'))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
} 