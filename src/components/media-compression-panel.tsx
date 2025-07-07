"use client";

import React, { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  FileVideo,
  FileImage,
  Download,
  RotateCcw,
  Maximize2,
  Settings,
} from "lucide-react";
import { FileUpload } from "./file-upload";
import { CompressionSettings } from "./compression-settings";
import { useCompressionContext } from "@/contexts/compression-context";

type MediaType = "video" | "image";

interface MediaCompressionPanelProps {
  type: MediaType;
}

export const MediaCompressionPanel: React.FC<MediaCompressionPanelProps> = ({
  type,
}) => {
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);

  const {
    state,
    ffmpeg,
    setFile,
    setSettings,
    handleCompress,
    handleDownload,
    handleReset,
    isProcessing,
  } = useCompressionContext();

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) {
      return `${bytes}B`;
    } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)}KB`;
    } else {
      const mb = bytes / (1024 * 1024);
      return `${mb.toFixed(2)}MB`;
    }
  };

  const config = useMemo(
    () => ({
      video: {
        icon: FileVideo,
        title: "Upload Video",
        description: "Select a video file to compress (max 500MB)",
        accept: "video/*",
        maxSize: 500,
        buttonText: "Compress Video",
        previewTitle: "Compressed video preview",
        aspectRatio: "aspect-video" as const,
      },
      image: {
        icon: FileImage,
        title: "Upload Image",
        description: "Select an image file to compress (max 50MB)",
        accept: "image/*",
        maxSize: 50,
        buttonText: "Compress Image",
        previewTitle: "Compressed image preview",
        aspectRatio: "aspect-square" as const,
      },
    }),
    []
  );

  const currentConfig = config[type];
  const IconComponent = currentConfig.icon;

  const compressionRatio = useMemo(() => {
    if (!state.blob || !state.file) return null;
    return Math.round((1 - state.blob.size / state.file.size) * 100);
  }, [state.blob, state.file]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <IconComponent className="h-5 w-5" />
                {currentConfig.title}
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Settings className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-96">
                  <CompressionSettings
                    type={type}
                    settings={state.settings}
                    onSettingsChange={setSettings}
                  />
                </PopoverContent>
              </Popover>
            </CardTitle>
            <CardDescription>{currentConfig.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FileUpload
              type={type}
              accept={currentConfig.accept}
              maxSize={currentConfig.maxSize}
              onFileSelect={setFile}
              currentFile={state.file}
              onRemove={handleReset}
            />

            {state.file && (
              <div className="text-sm text-muted-foreground">
                {state.file.name} ({formatFileSize(state.file.size)})
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleCompress}
                className="flex-1"
                disabled={!ffmpeg.isInitialized || !state.file || isProcessing}
              >
                {!ffmpeg.isInitialized
                  ? "Initializing..."
                  : isProcessing
                  ? "Processing..."
                  : currentConfig.buttonText}
              </Button>

              <Button
                variant="outline"
                onClick={handleReset}
                disabled={isProcessing}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {state.blob && (
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Result</CardTitle>
              <CardDescription>{currentConfig.previewTitle}</CardDescription>
            </CardHeader>
            <CardContent className="w-full space-y-4 h-full flex flex-col">
              <div className="rounded-lg overflow-hidden w-full h-full">
                {type === "video" ? (
                  <video
                    src={URL.createObjectURL(state.blob)}
                    controls
                    className="w-full aspect-video object-contain"
                  />
                ) : (
                  <img
                    src={URL.createObjectURL(state.blob)}
                    alt="Compressed"
                    className="w-full h-full object-contain"
                  />
                )}
              </div>

              <div className="flex items-center justify-between mt-auto">
                <div className="text-sm text-muted-foreground">
                  Size: {formatFileSize(state.blob.size)}
                  {compressionRatio && (
                    <span className="text-green-600 ml-1">
                      ({compressionRatio}% smaller)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsFullscreenOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <Maximize2 className="h-4 w-4" />
                    Fullscreen
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleDownload}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      {isProcessing && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Progress value={ffmpeg.progress.progress} className="h-2" />
              <div className="text-sm text-muted-foreground text-center">
                {Math.round(ffmpeg.progress.progress)}% complete
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={isFullscreenOpen} onOpenChange={setIsFullscreenOpen}>
        <DialogContent className="sm:max-w-7xl h-full max-h-[90vh]">
          <div className="w-full h-full flex-1 flex items-center justify-center">
            {state.blob && (
              <>
                {type === "video" ? (
                  <video
                    src={URL.createObjectURL(state.blob)}
                    controls
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <img
                    src={URL.createObjectURL(state.blob)}
                    alt="Compressed"
                    className="max-w-full max-h-full object-contain"
                  />
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
