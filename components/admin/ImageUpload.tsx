'use client'

import React, { useRef, useEffect } from 'react'
import { ImagePlus, X } from 'lucide-react'

interface ImageUploadProps {
  value: (File | string)[]
  onChange: (images: (File | string)[]) => void
  max?: number
}

export default function ImageUpload({ value, onChange, max = 5 }: ImageUploadProps) {
  const previewsRef = useRef<Map<File, string>>(new Map())

  useEffect(() => {
    return () => {
      previewsRef.current.forEach(url => URL.revokeObjectURL(url))
    }
  }, [])

  function preview(img: File | string): string {
    if (typeof img === 'string') return img
    if (!previewsRef.current.has(img)) {
      previewsRef.current.set(img, URL.createObjectURL(img))
    }
    return previewsRef.current.get(img)!
  }

  function add(files: File[]) {
    const remaining = max - value.length
    onChange([...value, ...files.slice(0, remaining)])
  }

  function remove(i: number) {
    const img = value[i]
    if (img instanceof File) {
      const url = previewsRef.current.get(img)
      if (url) URL.revokeObjectURL(url)
      previewsRef.current.delete(img)
    }
    onChange(value.filter((_, idx) => idx !== i))
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {value.map((img, i) => (
          <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border border-border group">
            <img
              src={preview(img)}
              alt=""
              className="w-full h-full object-cover"
              onError={e => { (e.target as HTMLImageElement).style.opacity = '0.3' }}
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-background/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-white"
            >
              <X className="h-3 w-3" />
            </button>
            <span className="absolute bottom-1 left-1 text-[10px] font-bold text-white bg-black/50 rounded px-1 leading-4">
              {i + 1}
            </span>
          </div>
        ))}

        {value.length < max && (
          <label
            className="w-24 h-24 rounded-xl border-2 border-dashed border-border hover:border-primary cursor-pointer flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors"
            onDragOver={e => e.preventDefault()}
            onDrop={e => {
              e.preventDefault()
              add(Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/')))
            }}
          >
            <ImagePlus className="h-6 w-6" />
            <span className="text-[10px] font-medium">Ajouter</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={e => { add(Array.from(e.target.files ?? [])); e.target.value = '' }}
              className="sr-only"
            />
          </label>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        {value.length}/{max} images · JPG, PNG, WebP · Glissez-déposez ou cliquez
      </p>
    </div>
  )
}
