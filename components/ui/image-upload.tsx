"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Upload, ImageIcon } from "lucide-react"

interface ImageUploadProps {
  onImagesChange: (images: File[]) => void
  maxImages?: number
  existingImages?: string[]
}

export function ImageUpload({ onImagesChange, maxImages = 5, existingImages = [] }: ImageUploadProps) {
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const validFiles = files.filter((file) => file.type.startsWith("image/"))

    if (selectedImages.length + validFiles.length > maxImages) {
      alert(`મહત્તમ ${maxImages} ફોટો પસંદ કરી શકો છો`)
      return
    }

    const newImages = [...selectedImages, ...validFiles]
    setSelectedImages(newImages)
    onImagesChange(newImages)

    // Create preview URLs
    const newPreviewUrls = validFiles.map((file) => URL.createObjectURL(file))
    setPreviewUrls((prev) => [...prev, ...newPreviewUrls])
  }

  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index)
    setSelectedImages(newImages)
    onImagesChange(newImages)

    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(previewUrls[index])
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="verification-images">વેરિફિકેશન ફોટો</Label>
        <p className="text-sm text-muted-foreground">
          કોણે કેટલી વસ્તુ પરત લીધી તેની ફોટો અપલોડ કરો (મહત્તમ {maxImages} ફોટો)
        </p>
      </div>

      <Input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />

      <Button
        type="button"
        variant="outline"
        onClick={triggerFileInput}
        className="w-full border-dashed border-2 h-20 flex flex-col gap-2 bg-transparent"
        disabled={selectedImages.length >= maxImages}
      >
        <Upload className="h-6 w-6" />
        <span>ફોટો પસંદ કરો</span>
      </Button>

      {/* Preview existing images */}
      {existingImages.length > 0 && (
        <div>
          <Label className="text-sm font-medium">અગાઉની ફોટો:</Label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {existingImages.map((url, index) => (
              <div key={index} className="relative">
                <img
                  src={url || "/placeholder.svg"}
                  alt={`Existing verification ${index + 1}`}
                  className="w-full h-20 object-cover rounded border"
                />
                <div className="absolute top-1 right-1 bg-green-500 text-white rounded-full p-1">
                  <ImageIcon className="h-3 w-3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview selected images */}
      {selectedImages.length > 0 && (
        <div>
          <Label className="text-sm font-medium">પસંદ કરેલી ફોટો:</Label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {previewUrls.map((url, index) => (
              <div key={index} className="relative">
                <img
                  src={url || "/placeholder.svg"}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-20 object-cover rounded border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-1 right-1 h-6 w-6 p-0"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {selectedImages.length}/{maxImages} ફોટો પસંદ કરેલી
      </p>
    </div>
  )
}
