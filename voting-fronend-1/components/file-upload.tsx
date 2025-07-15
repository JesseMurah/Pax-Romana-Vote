"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X } from "lucide-react"

interface FileUploadProps {
  id: string
  accept?: string
  onChange: (file: File | null) => void
}

export function FileUpload({ id, accept, onChange }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    setFile(selectedFile)
    onChange(selectedFile)

    if (selectedFile && selectedFile.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
    } else {
      setPreview(null)
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    setPreview(null)
    onChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-2">
      <input type="file" id={id} ref={fileInputRef} accept={accept} onChange={handleFileChange} className="hidden" />

      {!file ? (
        <Button
          type="button"
          variant="outline"
          className="w-full h-32 flex flex-col items-center justify-center border-dashed"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-6 w-6 mb-2" />
          <span>Click to upload</span>
          <span className="text-xs text-gray-500 mt-1">
            {accept === "image/*" ? "JPG, PNG or GIF" : "PDF, DOC, DOCX"}
          </span>
        </Button>
      ) : (
        <div className="relative border rounded-md p-2">
          <div className="flex items-center">
            {preview ? (
              <div className="w-24 h-24 mr-4">
                <img
                  src={preview || "/placeholder.svg"}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-md"
                />
              </div>
            ) : (
              <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center mr-4">
                <span className="text-xs uppercase">{file.name.split(".").pop()}</span>
              </div>
            )}
            <div className="flex-1">
              <p className="font-medium truncate">{file.name}</p>
              <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-red-500"
              onClick={handleRemoveFile}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
