"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export interface CompressionSettings {
  quality: "speed" | "low" | "medium" | "high";
  format: string;
  resolution: string;
}

interface CompressionSettingsProps {
  type: "image" | "video";
  settings: CompressionSettings;
  onSettingsChange: (settings: CompressionSettings) => void;
}

const videoFormats = [
  { value: "mp4", label: "MP4", description: "Compatible" },
  { value: "webm", label: "WebM", description: "Smaller" },
  { value: "avi", label: "AVI", description: "Uncompressed" },
  { value: "mov", label: "MOV", description: "Apple" },
];

const imageFormats = [
  { value: "jpeg", label: "JPEG", description: "Smaller" },
  { value: "png", label: "PNG", description: "Lossless" },
  { value: "webp", label: "WebP", description: "Modern" },
  { value: "bmp", label: "BMP", description: "Uncompressed" },
];

const videoResolutions = [
  { value: "original", label: "Original", description: "Keep size" },
  { value: "1920:1080", label: "1080p", description: "1920×1080" },
  { value: "1280:720", label: "720p", description: "1280×720" },
  { value: "854:480", label: "480p", description: "854×480" },
  { value: "640:360", label: "360p", description: "640×360" },
];

const imageResolutions = [
  { value: "original", label: "Original", description: "Keep size" },
  { value: "1920:1080", label: "Full HD", description: "1920×1080" },
  { value: "1280:720", label: "HD", description: "1280×720" },
  { value: "800:600", label: "SVGA", description: "800×600" },
  { value: "640:480", label: "VGA", description: "640×480" },
];

const qualityOptions = [
  { value: "speed", label: "Speed", description: "Fastest, low memory" },
  { value: "low", label: "Low", description: "Smallest, low memory" },
  { value: "medium", label: "Medium", description: "Balanced" },
  { value: "high", label: "High", description: "Best quality, high memory" },
];

export function CompressionSettings({
  type,
  settings,
  onSettingsChange,
}: CompressionSettingsProps) {
  const formats = type === "video" ? videoFormats : imageFormats;
  const resolutions = type === "video" ? videoResolutions : imageResolutions;

  const updateSetting = (key: keyof CompressionSettings, value: string) => {
    onSettingsChange({
      ...settings,
      [key]: value,
    });
  };

  return (
      <div className="h-full flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Settings</span>
        <Badge variant="outline" className="capitalize text-xs h-4 px-1">
          {type}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="quality" className="text-xs">
            Quality
          </Label>
          <Select
            value={settings.quality}
            onValueChange={(value) => updateSetting("quality", value)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {qualityOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span>{option.label}</span>
                    <span className="text-muted-foreground">
                      {option.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="format" className="text-xs">
            Format
          </Label>
          <Select
            value={settings.format}
            onValueChange={(value) => updateSetting("format", value)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {formats.map((format) => (
                <SelectItem
                  key={format.value}
                  value={format.value}
                  className="text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{format.label}</span>
                    <span className="text-muted-foreground">
                      {format.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="resolution" className="text-xs">
            Resolution
          </Label>
          <Select
            value={settings.resolution}
            onValueChange={(value) => updateSetting("resolution", value)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {resolutions.map((resolution) => (
                <SelectItem
                  key={resolution.value}
                  value={resolution.value}
                  className="text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{resolution.label}</span>
                    <span className="text-muted-foreground">
                      {resolution.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="pt-2 border-t border-dashed mt-auto">
        <div className="flex flex-wrap gap-1">
          <Badge variant="secondary" className="text-xs h-4 px-1">
            {settings.quality}
          </Badge>
          <Badge variant="secondary" className="text-xs h-4 px-1">
            {settings.format.toUpperCase()}
          </Badge>
          <Badge variant="secondary" className="text-xs h-4 px-1">
            {settings.resolution === "original"
              ? "Original"
              : settings.resolution.replace(":", "×")}
          </Badge>
        </div>
      </div>
    </div>
  );
}
