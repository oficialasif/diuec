'use client'

import { useState, useRef } from 'react'
import { Button } from './button'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { uploadImage } from '@/lib/upload'
import toast from 'react-hot-toast'
import Image from 'next/image'

interface ImageUploadProps {
    value: string
    onChange: (url: string) => void
    disabled?: boolean
    label?: string
}

export function ImageUpload({ value, onChange, disabled, label = "Upload Image" }: ImageUploadProps) {
    const [loading, setLoading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate type
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file')
            return
        }

        // Validate size (e.g. 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be less than 5MB')
            return
        }

        setLoading(true)
        try {
            const url = await uploadImage(file)
            onChange(url)
            toast.success('Image uploaded!')
        } catch (error: any) {
            console.error(error)
            toast.error('Upload failed: ' + error.message)
        } finally {
            setLoading(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 block">
                {label}
            </label>

            {value ? (
                <div className="relative w-full h-48 bg-zinc-900 rounded-xl overflow-hidden border border-zinc-700 group">
                    <Image
                        src={value}
                        alt="Uploaded"
                        fill
                        className="object-cover"
                    />
                    <button
                        onClick={() => onChange('')}
                        className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors"
                        type="button"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                <div
                    onClick={() => !disabled && fileInputRef.current?.click()}
                    className={`
             border-2 border-dashed border-zinc-700 rounded-xl h-32 
             flex flex-col items-center justify-center cursor-pointer 
             hover:border-violet-500/50 hover:bg-zinc-900/50 transition-all
             ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
           `}
                >
                    {loading ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-violet-500"></div>
                    ) : (
                        <>
                            <Upload className="w-8 h-8 text-zinc-500 mb-2" />
                            <span className="text-sm text-zinc-500">Click to upload</span>
                        </>
                    )}
                </div>
            )}

            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
                disabled={disabled || loading}
            />
        </div>
    )
}
