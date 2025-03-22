'use client'

import { useState } from 'react'
import { Button } from '@/components/shared/ui/button'
import { Input } from '@/components/shared/ui/input'
import { Label } from '@/components/shared/ui/label'
import { Megaphone, Link as LinkIcon, Bold, Italic } from 'lucide-react'
import { addDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shared/ui/select'

const colorOptions = [
  { name: 'Purple', value: 'text-violet-500' },
  { name: 'Blue', value: 'text-blue-500' },
  { name: 'Green', value: 'text-green-500' },
  { name: 'Yellow', value: 'text-yellow-500' },
  { name: 'Red', value: 'text-red-500' },
  { name: 'Pink', value: 'text-pink-500' },
  { name: 'Orange', value: 'text-orange-500' },
  { name: 'Cyan', value: 'text-cyan-500' },
  { name: 'Lime', value: 'text-lime-500' },
  { name: 'Emerald', value: 'text-emerald-500' },
  { name: 'Rose', value: 'text-rose-500' },
  { name: 'Indigo', value: 'text-indigo-500' },
]

const fontSizes = [
  { name: 'Small', value: 'text-sm' },
  { name: 'Base', value: 'text-base' },
  { name: 'Large', value: 'text-lg' },
  { name: 'XL', value: 'text-xl' },
  { name: '2XL', value: 'text-2xl' },
  { name: '3XL', value: 'text-3xl' },
]

const fontFamilies = [
  { name: 'GeistMono', value: 'font-geist-mono' },
  { name: 'Space Grotesk', value: 'font-space-grotesk' },
  { name: 'JetBrains Mono', value: 'font-jetbrains-mono' },
  { name: 'Fira Code', value: 'font-fira-code' },
  { name: 'Source Code Pro', value: 'font-source-code-pro' },
  { name: 'IBM Plex Mono', value: 'font-ibm-plex-mono' },
]

export function AdminAnnouncementBanner() {
  const [announcement, setAnnouncement] = useState('')
  const [selectedColor, setSelectedColor] = useState('text-violet-500')
  const [selectedFontSize, setSelectedFontSize] = useState('text-base')
  const [selectedFont, setSelectedFont] = useState('font-geist-mono')
  const [validUntil, setValidUntil] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [link, setLink] = useState('')
  const [linkText, setLinkText] = useState('')
  const [showLinkForm, setShowLinkForm] = useState(false)
  const [selectionStart, setSelectionStart] = useState(0)
  const [selectionEnd, setSelectionEnd] = useState(0)

  const handleAddLink = () => {
    if (!link || !linkText) {
      toast.error('Please provide both link URL and text')
      return
    }
    const linkMarkdown = `[${linkText}](${link})`
    setAnnouncement(prev => prev + ' ' + linkMarkdown)
    setLink('')
    setLinkText('')
    setShowLinkForm(false)
  }

  const handleTextFormat = (format: 'bold' | 'italic') => {
    const textarea = document.getElementById('announcement') as HTMLTextAreaElement
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = announcement.substring(start, end)

    if (!selectedText) {
      toast.error('Please select some text to format')
      return
    }

    const prefix = format === 'bold' ? '**' : '_'
    const formattedText = `${prefix}${selectedText}${prefix}`
    const newText = announcement.substring(0, start) + formattedText + announcement.substring(end)
    setAnnouncement(newText)
  }

  const handleSelectionChange = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const textarea = e.target as HTMLTextAreaElement
    setSelectionStart(textarea.selectionStart)
    setSelectionEnd(textarea.selectionEnd)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!announcement.trim()) {
      toast.error('Please enter an announcement message')
      return
    }

    if (!validUntil) {
      toast.error('Please select validity period')
      return
    }

    setIsSubmitting(true)
    try {
      const validUntilDate = new Date(validUntil)
      if (validUntilDate < new Date()) {
        toast.error('Validity date must be in the future')
        return
      }

      await addDoc(collection(db, 'banner_announcements'), {
        text: announcement,
        color: selectedColor,
        fontSize: selectedFontSize,
        fontFamily: selectedFont,
        createdAt: serverTimestamp(),
        validUntil: Timestamp.fromDate(validUntilDate),
        active: true,
        type: 'banner'
      })

      toast.success('Banner announcement created successfully!')
      setAnnouncement('')
      setValidUntil('')
      setLink('')
      setLinkText('')
      setShowLinkForm(false)
    } catch (error) {
      console.error('Error creating banner announcement:', error)
      toast.error('Failed to create banner announcement')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get minimum date-time for validity (current time)
  const getMinDateTime = () => {
    const now = new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    return now.toISOString().slice(0, 16)
  }

  // Preview style classes
  const previewClasses = `${selectedColor} ${selectedFontSize} ${selectedFont}`

  return (
    <div className="bg-violet-950/50 rounded-lg p-4 md:p-6 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <Megaphone className="w-6 h-6 text-violet-400" />
        <h2 className="text-xl font-semibold text-white">Create Banner Announcement</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="announcement">Announcement Text</Label>
          <div className="flex gap-2 mb-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleTextFormat('bold')}
              className="flex items-center gap-2"
            >
              <Bold className="w-4 h-4" />
              Bold
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleTextFormat('italic')}
              className="flex items-center gap-2"
            >
              <Italic className="w-4 h-4" />
              Italic
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowLinkForm(!showLinkForm)}
              className="flex items-center gap-2"
            >
              <LinkIcon className="w-4 h-4" />
              {showLinkForm ? 'Hide Link Form' : 'Add Link'}
            </Button>
          </div>
          <textarea
            id="announcement"
            value={announcement}
            onChange={(e) => setAnnouncement(e.target.value)}
            onSelect={handleSelectionChange}
            placeholder="Enter your announcement message"
            className="w-full min-h-[100px] rounded-md bg-black/50 border-violet-500/20 p-3 text-white placeholder:text-gray-400"
          />
          <p className="text-xs text-gray-400 mt-1">
            Use ** for bold (e.g., **bold text**) and _ for italic (e.g., _italic text_)
          </p>
        </div>

        {/* Link Addition Form */}
        <div className="space-y-2">
          {showLinkForm && (
            <div className="space-y-2 p-4 bg-black/20 rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="link">Link URL</Label>
                <Input
                  id="link"
                  type="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://example.com"
                  className="bg-black/50 border-violet-500/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkText">Link Text</Label>
                <Input
                  id="linkText"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Click here"
                  className="bg-black/50 border-violet-500/20"
                />
              </div>
              <Button
                type="button"
                onClick={handleAddLink}
                size="sm"
                className="mt-2"
              >
                Insert Link
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Font Size Selection */}
          <div className="space-y-2">
            <Label>Font Size</Label>
            <Select value={selectedFontSize} onValueChange={setSelectedFontSize}>
              <SelectTrigger>
                <SelectValue placeholder="Select font size" />
              </SelectTrigger>
              <SelectContent>
                {fontSizes.map((size) => (
                  <SelectItem key={size.value} value={size.value}>
                    {size.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Font Family Selection */}
          <div className="space-y-2">
            <Label>Font Family</Label>
            <Select value={selectedFont} onValueChange={setSelectedFont}>
              <SelectTrigger>
                <SelectValue placeholder="Select font family" />
              </SelectTrigger>
              <SelectContent>
                {fontFamilies.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    {font.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="validUntil">Valid Until</Label>
          <Input
            id="validUntil"
            type="datetime-local"
            value={validUntil}
            min={getMinDateTime()}
            onChange={(e) => setValidUntil(e.target.value)}
            className="bg-black/50 border-violet-500/20"
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Select Color</Label>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {colorOptions.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => setSelectedColor(color.value)}
                className={`px-3 py-1.5 rounded-md ${color.value} border-2 transition-all ${
                  selectedColor === color.value
                    ? 'border-white scale-105'
                    : 'border-transparent hover:border-white/50'
                }`}
              >
                {color.name}
              </button>
            ))}
          </div>
        </div>

        {/* Preview Section */}
        <div className="space-y-2 p-4 bg-black/20 rounded-lg">
          <Label>Preview</Label>
          <p className={previewClasses} dangerouslySetInnerHTML={{ 
            __html: announcement
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/_(.*?)_/g, '<em>$1</em>')
              .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="underline hover:opacity-80" target="_blank" rel="noopener noreferrer">$1</a>')
          }} />
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto bg-violet-600 hover:bg-violet-700"
          >
            {isSubmitting ? 'Creating...' : 'Create Banner Announcement'}
          </Button>
        </div>
      </form>
    </div>
  )
} 