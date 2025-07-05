"use client";

import React, { useState, useCallback, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileVideo, FileImage } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { MediaCompressionPanel } from "@/components/media-compression-panel";
import { CompressionProvider } from "@/contexts/compression-context";

export function CompressionInterface() {
  const [activeTab, setActiveTab] = useState("video");

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
  }, []);

  const tabsList = useMemo(
    () => (
      <TabsList className="grid w-full grid-cols-2 mb-8">
        <TabsTrigger value="video" className="flex items-center gap-2">
          <FileVideo className="h-4 w-4" />
          Video Compression
        </TabsTrigger>
        <TabsTrigger value="image" className="flex items-center gap-2">
          <FileImage className="h-4 w-4" />
          Image Compression
        </TabsTrigger>
      </TabsList>
    ),
    []
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Media Compressor</h1>
          <p className="text-muted-foreground mt-1">
            FFmpeg-powered video and image compression
          </p>
        </div>
        <ThemeToggle />
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        {tabsList}

        <TabsContent value="video" className="space-y-6">
          <CompressionProvider initialMediaType="video">
            <MediaCompressionPanel type="video" />
          </CompressionProvider>
        </TabsContent>

        <TabsContent value="image" className="space-y-6">
          <CompressionProvider initialMediaType="image">
            <MediaCompressionPanel type="image" />
          </CompressionProvider>
        </TabsContent>
      </Tabs>
    </div>
  );
}
