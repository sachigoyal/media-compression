# Media Compressor

A modern, web-based video and image compression tool built with Next.js 15, FFmpeg, and Shadcn/ui. Compress your media files with advanced settings and real-time progress tracking.

![Media Compressor](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)

## 🚀 Features

### Video Compression
- **Multiple Formats**: Support for MP4, WebM, AVI, MOV
- **Quality Settings**: Low, Medium, High quality presets
- **Resolution Control**: 1080p, 720p, 480p, 360p, or keep original
- **Advanced Encoding**: H.264 codec with configurable CRF values
- **Audio Processing**: AAC audio compression

### Image Compression
- **Multiple Formats**: JPEG, PNG, WebP, BMP
- **Smart Compression**: Format-specific optimization
- **Resolution Scaling**: Various preset sizes or keep original
- **Quality Control**: Lossless and lossy compression options

### User Experience
- **Drag & Drop Interface**: Easy file upload with preview
- **Real-time Progress**: Live compression progress with time estimates
- **File Size Comparison**: Before/after size comparison with compression ratio
- **Dark Mode**: Beautiful light and dark theme support
- **Responsive Design**: Works perfectly on desktop and mobile

### Technical Features
- **FFmpeg Processing**: Server-side compression using FFmpeg
- **Secure Processing**: Files processed locally, not stored
- **Modern Tech Stack**: Next.js 15, React 19, TypeScript
- **Component Library**: Shadcn/ui for beautiful, accessible components

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd image-video-compression
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: TailwindCSS 4.0, Shadcn/ui components
- **Processing**: FFmpeg WebAssembly
- **Theme**: next-themes for dark mode
- **Icons**: Lucide React

## 📁 Project Structure

```
src/
├── app/
│   ├── api/compress/
│   │   ├── image/route.ts      # Image compression API
│   │   └── video/route.ts      # Video compression API
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Main page
├── components/
│   ├── ui/                     # Shadcn/ui components
│   ├── compression-interface.tsx  # Main interface
│   ├── compression-settings.tsx   # Settings panel
│   ├── file-upload.tsx            # File upload component
│   ├── progress-tracker.tsx       # Progress tracking
│   ├── theme-provider.tsx         # Theme provider
│   └── theme-toggle.tsx           # Theme toggle
└── lib/
    └── utils.ts                # Utility functions
```

## 🎯 Usage

### Video Compression

1. **Select Video Tab**: Click on the "Video Compression" tab
2. **Upload File**: Drag and drop or click to select a video file (up to 500MB)
3. **Configure Settings**:
   - **Quality**: Choose Low (smaller file), Medium (balanced), or High (best quality)
   - **Format**: Select output format (MP4, WebM, AVI, MOV)
   - **Resolution**: Choose target resolution or keep original
4. **Compress**: Click "Compress Video" button
5. **Download**: Once complete, download your compressed video

### Image Compression

1. **Select Image Tab**: Click on the "Image Compression" tab
2. **Upload File**: Drag and drop or click to select an image file (up to 50MB)
3. **Configure Settings**:
   - **Quality**: Choose compression level
   - **Format**: Select output format (JPEG, PNG, WebP, BMP)
   - **Resolution**: Choose target resolution or keep original
4. **Compress**: Click "Compress Image" button
5. **Download**: Once complete, download your compressed image

## ⚙️ Configuration

### Compression Settings

**Video Quality Presets**:
- **Low**: CRF 32, fast preset (smallest files)
- **Medium**: CRF 23, medium preset (balanced)
- **High**: CRF 18, slow preset (best quality)

**Image Quality Settings**:
- **JPEG**: Quality levels 2-10
- **PNG**: Compression levels 3-9
- **WebP**: Quality levels 40-90

### File Size Limits
- **Videos**: 500MB maximum
- **Images**: 50MB maximum

## 🔧 API Endpoints

### POST `/api/compress/video`
Compress video files with specified settings.

**Body (FormData)**:
- `file`: Video file
- `quality`: 'low' | 'medium' | 'high'
- `format`: 'mp4' | 'webm' | 'avi' | 'mov'
- `resolution`: Resolution string or 'original'

### POST `/api/compress/image`
Compress image files with specified settings.

**Body (FormData)**:
- `file`: Image file
- `quality`: 'low' | 'medium' | 'high'
- `format`: 'jpeg' | 'png' | 'webp' | 'bmp'
- `resolution`: Resolution string or 'original'

## 🔒 Privacy & Security

- **Local Processing**: All compression happens on your device
- **No File Storage**: Files are not stored on servers
- **Secure Transfer**: Files processed in memory only
- **Privacy First**: No data collection or tracking

## 🚀 Performance

- **WebAssembly**: FFmpeg runs efficiently in the browser
- **Progressive Enhancement**: Works without JavaScript for basic features
- **Optimized Builds**: Next.js 15 with Turbopack for fast development
- **Responsive**: Optimized for all device sizes

## 📱 Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **WebAssembly**: Required for FFmpeg processing
- **File API**: Required for drag & drop functionality

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [FFmpeg](https://ffmpeg.org/) for media processing
- [Shadcn/ui](https://ui.shadcn.com/) for beautiful components
- [Lucide](https://lucide.dev/) for icons
- [Next.js](https://nextjs.org/) for the framework

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](../../issues) page
2. Create a new issue with detailed information
3. Provide browser information and error messages

---

**Made with ❤️ using Next.js, FFmpeg, and Shadcn/ui**
