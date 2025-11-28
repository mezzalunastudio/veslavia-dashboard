// app/wedding/[id]/edit/components/media-management.tsx
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ImagePlus, Music, Upload, Trash2, Eye, Loader2 } from "lucide-react"
import { Wedding, getWedding, updateWedding } from "@/lib/api/wedding"
import { fetchImageUrls, uploadImage, deleteImage, uploadAudio } from "@/lib/api/media"

interface MediaManagementProps {
  weddingId: string
}

interface ImageUploadState {
  [key: string]: {
    file: File | null
    preview: string
    uploading: boolean
  }
}

interface ImageUrlMap {
  [key: string]: string
}

export default function MediaManagement({ weddingId }: MediaManagementProps) {
  const [wedding, setWedding] = useState<Wedding | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [imageUploads, setImageUploads] = useState<ImageUploadState>({})
  const [imageUrlMap, setImageUrlMap] = useState<ImageUrlMap>({})
  const [audioUpload, setAudioUpload] = useState<{
    file: File | null
    uploading: boolean
  }>({ file: null, uploading: false })

  const imageFields = [
    { key: "groomImg", label: "Groom Photo", description: "Portrait photo of the groom" },
    { key: "brideImg", label: "Bride Photo", description: "Portrait photo of the bride" },
    { key: "heroImg", label: "Hero Image", description: "Main banner image for the wedding" },
    { key: "headerImg", label: "Header Image", description: "Header section background" },
    { key: "eventImg", label: "Event Image 1", description: "First event/ceremony image" },
    { key: "eventImg2", label: "Event Image 2", description: "Second event/ceremony image" },
    { key: "quoteImg", label: "Quote Background", description: "Background for quotes section" },
    { key: "loveStoryImg", label: "Love Story Image", description: "Love story section image" },
    { key: "giftImg", label: "Gift Section Image", description: "Gift information background" },
    { key: "rsvpImg", label: "RSVP Background", description: "RSVP section background" },
    { key: "footerImg1", label: "Footer Image 1", description: "First footer image" },
    { key: "footerImg2", label: "Footer Image 2", description: "Second footer image" },
    { key: "img1", label: "Additional Image 1", description: "Extra image slot" },
    { key: "img2", label: "Additional Image 2", description: "Extra image slot" },
    { key: "img3", label: "Additional Image 3", description: "Extra image slot" },
  ]

  // Load wedding data and image URLs
  useEffect(() => {
    const loadWeddingAndImages = async () => {
      try {
        setLoading(true)
        const weddingData = await getWedding(weddingId)
        setWedding(weddingData)

        // Extract image keys from wedding data
        const imageKeys = Object.values(weddingData.imageUrl || {}).filter((key): key is string => 
          typeof key === 'string' && key.length > 0
        )

        if (imageKeys.length > 0) {
          const urls = await fetchImageUrls(imageKeys)
          setImageUrlMap(urls)
        }
      } catch (err: any) {
        console.error("Failed to load wedding data:", err)
      } finally {
        setLoading(false)
      }
    }

    if (weddingId) {
      loadWeddingAndImages()
    }
  }, [weddingId])

  const handleImageUpload = (fieldKey: string, file: File) => {
    const preview = URL.createObjectURL(file)
    setImageUploads(prev => ({
      ...prev,
      [fieldKey]: {
        file,
        preview,
        uploading: false
      }
    }))
  }

  const handleAudioUpload = (file: File) => {
    setAudioUpload({
      file,
      uploading: false
    })
  }

  const handleUploadImage = async (fieldKey: string) => {
    const upload = imageUploads[fieldKey]
    if (!upload?.file || !wedding) return

    try {
      setImageUploads(prev => ({
        ...prev,
        [fieldKey]: { ...prev[fieldKey], uploading: true }
      }))
      setUploading(true)

      // Upload image to server
      const imageKey = await uploadImage(wedding.category, wedding.path || weddingId, upload.file)

      // Update wedding data with new image key
      const updatedWedding = await updateWedding(weddingId, {
        imageUrl: {
          ...wedding.imageUrl,
          [fieldKey]: imageKey
        }
      })

      // Fetch new presigned URL for the uploaded image
      const newUrlMap = await fetchImageUrls([imageKey])
      setImageUrlMap(prev => ({ ...prev, ...newUrlMap }))

      setWedding(updatedWedding.data)
      
      // Clean up
      setImageUploads(prev => {
        const newState = { ...prev }
        delete newState[fieldKey]
        return newState
      })
    } catch (error) {
      console.error(`Failed to upload ${fieldKey}:`, error)
    } finally {
      setUploading(false)
    }
  }

  const handleUploadAudio = async () => {
    if (!audioUpload.file || !wedding) return

    try {
      setAudioUpload(prev => ({ ...prev, uploading: true }))
      setUploading(true)

      // Upload audio to server
      const audioKey = await uploadAudio(wedding.category, wedding.path || weddingId, audioUpload.file)

      const updatedWedding = await updateWedding(weddingId, {
        media: {
          ...wedding.media,
          audio: audioKey
        }
      })

      setWedding(updatedWedding.data)
      setAudioUpload({ file: null, uploading: false })
    } catch (error) {
      console.error("Failed to upload audio:", error)
    } finally {
      setUploading(false)
    }
  }

const handleDeleteImage = async (fieldKey: string) => {
  if (!wedding) return

  try {
    setUploading(true)
    
    const imageKey = wedding.imageUrl?.[fieldKey as keyof typeof wedding.imageUrl]
    if (!imageKey) return

    await deleteImage(imageKey)

    const updatedImageUrl = { ...wedding.imageUrl }
    delete updatedImageUrl[fieldKey as keyof typeof wedding.imageUrl]

    const updatedWedding = await updateWedding(weddingId, {
      imageUrl: updatedImageUrl
    })

    setImageUrlMap(prev => {
      const newMap = { ...prev }
      delete newMap[imageKey]
      return newMap
    })

    setWedding(updatedWedding.data)
  } catch (error) {
    console.error(`Failed to delete ${fieldKey}:`, error)
  } finally {
    setUploading(false)
  }
}

  const updateYoutubeVideo = async (videoId: string) => {
    if (!wedding) return

    try {
      setUploading(true)
      const updatedWedding = await updateWedding(weddingId, {
        media: {
          ...wedding.media,
          youtubeVideoId: videoId
        }
      })
      setWedding(updatedWedding.data)
    } catch (error) {
      console.error("Failed to update YouTube video:", error)
    } finally {
      setUploading(false)
    }
  }

  // Helper function to get image URL
  const getImageUrl = (imageKey: string | undefined): string | null => {
    if (!imageKey) return null
    return imageUrlMap[imageKey] || null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading media data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Status */}
      {uploading && (
        <Badge variant="secondary" className="text-xs">
          <Loader2 className="h-3 w-3 animate-spin mr-1" />
          Uploading...
        </Badge>
      )}

      {/* Images Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Images</CardTitle>
          <CardDescription>
            Upload and manage all wedding images. Each image has a specific purpose in the invitation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {imageFields.map(({ key, label, description }) => {
              const imageKey = wedding?.imageUrl?.[key as keyof typeof wedding.imageUrl]
              const imageUrl = getImageUrl(imageKey)
              const uploadState = imageUploads[key]

              return (
                <div key={key} className="border rounded-lg p-4 space-y-3">
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm">{label}</h4>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </div>

                  {/* Image Preview */}
                  <div className="aspect-video bg-muted rounded-md border flex items-center justify-center overflow-hidden">
                    {uploadState?.preview ? (
                      <img
                        src={uploadState.preview}
                        alt={`Preview ${label}`}
                        className="w-full h-full object-cover"
                      />
                    ) : imageUrl ? (
                      <div className="relative w-full h-full group">
                        <img
                          src={imageUrl}
                          alt={label}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-8"
                            onClick={() => window.open(imageUrl, '_blank')}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-8"
                            onClick={() => handleDeleteImage(key)}
                            disabled={uploading}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-muted-foreground text-center p-4">
                        <ImagePlus className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-xs">No image</p>
                      </div>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="space-y-2">
                    {!imageUrl && !uploadState && (
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleImageUpload(key, file)
                        }}
                        className="text-xs"
                      />
                    )}
                    
                    {uploadState && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleUploadImage(key)}
                          disabled={uploadState.uploading || uploading}
                          className="flex-1"
                        >
                          {uploadState.uploading ? (
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          ) : (
                            <Upload className="h-3 w-3 mr-1" />
                          )}
                          {uploadState.uploading ? "Uploading..." : "Upload"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setImageUploads(prev => {
                              const newState = { ...prev }
                              delete newState[key]
                              return newState
                            })
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Audio Section */}
      <Card>
        <CardHeader>
          <CardTitle>Audio</CardTitle>
          <CardDescription>
            Upload background music for the wedding invitation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current Audio */}
            <div className="space-y-3">
              <h4 className="font-medium">Current Audio</h4>
              {wedding?.media?.audio ? (
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Music className="h-8 w-8 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Background Music</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {wedding.media.audio}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // You might want to fetch audio URL similarly to images
                      console.log("Audio key:", wedding.media.audio)
                    }}
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="text-center p-6 border-2 border-dashed rounded-lg">
                  <Music className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No audio uploaded</p>
                </div>
              )}
            </div>

            {/* Upload Audio */}
            <div className="space-y-3">
              <h4 className="font-medium">Upload New Audio</h4>
              <div className="space-y-3">
                <Input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleAudioUpload(file)
                  }}
                />
                {audioUpload.file && (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleUploadAudio}
                      disabled={audioUpload.uploading || uploading}
                      className="flex-1"
                    >
                      {audioUpload.uploading ? (
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      ) : (
                        <Upload className="h-3 w-3 mr-1" />
                      )}
                      {audioUpload.uploading ? "Uploading..." : "Upload Audio"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setAudioUpload({ file: null, uploading: false })}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* YouTube Video */}
      <Card>
        <CardHeader>
          <CardTitle>YouTube Video</CardTitle>
          <CardDescription>
            Add a YouTube video ID for background or featured video
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Input
                placeholder="YouTube Video ID"
                value={wedding?.media?.youtubeVideoId || ""}
                onChange={(e) => updateYoutubeVideo(e.target.value)}
                disabled={uploading}
              />
              <p className="text-xs text-muted-foreground">
                Enter only the video ID (e.g., "dQw4w9WgXcQ")
              </p>
            </div>
            {wedding?.media?.youtubeVideoId && (
              <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                <iframe
                  src={`https://www.youtube.com/embed/${wedding.media.youtubeVideoId}`}
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}