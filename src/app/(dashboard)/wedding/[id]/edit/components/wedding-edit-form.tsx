// app/wedding/[id]/edit/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Wedding, getWedding, updateWedding } from "@/lib/api/wedding"
import { Calendar, Plus, Trash2, Clock, Users } from "lucide-react"
import { weddingFormSchema, WeddingFormValues } from "./wedding-form-schema"

interface WeddingEditFormProps {
  weddingId: string
  onTabChange: (tab: string) => void
}

export default function WeddingEditForm({ weddingId, onTabChange }: WeddingEditFormProps) {
  const router = useRouter()

  const [wedding, setWedding] = useState<Wedding | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<WeddingFormValues>({
    resolver: zodResolver(weddingFormSchema),
    defaultValues: {
      path: "",
      category: "",
      isActive: true,
      groom: {
        shortName: "",
        fullName: "",
        fullNameWithTitle: "",
        fatherName: "",
        motherName: "",
        orderInFamily: "",
        instagram: "",
      },
      bride: {
        shortName: "",
        fullName: "",
        fullNameWithTitle: "",
        fatherName: "",
        motherName: "",
        orderInFamily: "",
        instagram: "",
      },
      quotes: {
        quote1: "",
        quote1From: "",
        quote2: "",
        quote2From: "",
      },
      akad: {
        isAkad:true,
        timeRange:
        {
          start: "",
          end: ""
        },
        date: "",
        place: "",
        address: "",
        liveLink: "",
      },
      resepsi: {
        eventCategory:"",
        isResepsi: true,
        timeRange:
        {
          start: "",
          end: ""
        },
        date: "",
        place: "",
        address: "",
        liveLink: "",
        mapsLink: "",
      },
      loveStory: {
        loveStoryActived: false,
        firstMeet: "",
        theProposal: "",
        marriage: "",
      },
      gift: {
        isRecieveGift: false,
        showGift:true,
        giftAddress: "",
        nameNoRek1: "",
        groomBank: "",
        groomNoRek: "",
        nameNoRek2: "",
        brideBank: "",
        brideNoRek: "",
      },
      dressColors: [],
    },
  })

  // Load wedding data
  useEffect(() => {
    const loadWedding = async () => {
      try {
        setLoading(true)
        const weddingData = await getWedding(weddingId)
        setWedding(weddingData)

        // Set form values
        form.reset({
          path: weddingData.path || "",
          category: weddingData.category || "",
          isActive: weddingData.isActive ?? true,
          groom: weddingData.groom,
          bride: weddingData.bride,
          quotes: weddingData.quotes,
          akad: weddingData.akad,
          resepsi: weddingData.resepsi,
          loveStory: weddingData.loveStory,
          gift: weddingData.gift,
          dressColors: weddingData.dressColors || [],
        })
      } catch (err: any) {
        setError(err.message || "Failed to load wedding data")
      } finally {
        setLoading(false)
      }
    }

    if (weddingId) {
      loadWedding()
    }
  }, [weddingId, form])

  // Auto-save functionality
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (type === "change" && wedding) {
        handleAutoSave()
      }
    })
    return () => subscription.unsubscribe()
  }, [form.watch, wedding])

  const handleAutoSave = async () => {
    if (!form.formState.isDirty || saving) return

    try {
      setSaving(true)
      const formData = form.getValues()

      await updateWedding(weddingId, formData)

      setLastSaved(new Date())
      form.reset(formData) // Reset dirty state
    } catch (err: any) {
      console.error("Auto-save failed:", err)
      // Don't show error for auto-save to avoid disrupting user
    } finally {
      setSaving(false)
    }
  }

  const handleManualSave = async (data: WeddingFormValues) => {
    try {
      setSaving(true)
      await updateWedding(weddingId, data)

      setLastSaved(new Date())
      form.reset(data)

      // Show success message
      console.log("Wedding updated successfully")
    } catch (err: any) {
      setError(err.message || "Failed to save wedding")
    } finally {
      setSaving(false)
    }
  }

  const handleBack = () => {
    router.push("/wedding")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading wedding data...</p>
        </div>
      </div>
    )
  }

  if (error && !wedding) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="text-destructive text-lg mb-2">Error</div>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={handleBack}>
            Back to Wedding List
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4 lg:px-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {lastSaved && (
            <Badge variant="outline" className="text-xs bg-green-600 text-white dark:bg-green-800">
              Last saved: {lastSaved.toLocaleTimeString()}
            </Badge>
          )}
          {saving && (
            <Badge variant="secondary" className="text-xs">
              Saving...
            </Badge>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <div className="text-destructive text-sm">{error}</div>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleManualSave)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Wedding path, template category, and activation status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="path"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Path *</FormLabel>
                      <FormControl>
                        <Input disabled placeholder="e.g., john-doe" {...field} />
                      </FormControl>
                      <FormDescription>
                        Unique URL path for the wedding invitation
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Template *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., valoria" {...field} />
                      </FormControl>
                      <FormDescription>
                        Wedding template category
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Groom Information */}
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Groom Information</CardTitle>
                <CardDescription>
                  Details about the groom
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="groom.shortName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="groom.fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="groom.fullNameWithTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name with Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., John Doe, S.T." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="groom.fatherName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Father's Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Father's name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="groom.motherName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mother's Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Mother's name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="groom.orderInFamily"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Order in Family</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., First child" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="groom.instagram"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instagram</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., @johndoe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Bride Information */}
            <Card>
              <CardHeader>
                <CardTitle>Bride Information</CardTitle>
                <CardDescription>
                  Details about the bride
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="bride.shortName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Jane" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bride.fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Jane Smith" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bride.fullNameWithTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name with Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Jane Smith, S.E." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="bride.fatherName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Father's Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Father's name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bride.motherName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mother's Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Mother's name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="bride.orderInFamily"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Order in Family</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Second child" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bride.instagram"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instagram</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., @janesmith" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </div>



          {/* Akad Ceremony */}
          <Card>
            <CardHeader>
              <CardTitle>Akad Ceremony</CardTitle>
              <CardDescription>
                Details for the marriage ceremony (akad nikah)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="akad.date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="akad.timeRange.start"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time start</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="akad.timeRange.end"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time end</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="akad.place"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Place *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Grand Mosque" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="akad.address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Full address of the venue"
                        className="min-h-[60px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="akad.liveLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Live Stream Link</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Wedding Reception Type */}
          <Card>
            <CardHeader>
              <CardTitle>Wedding Ceremony Type</CardTitle>
              <CardDescription>
                Choose the type of wedding ceremony you're having
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="resepsi.isResepsi"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormControl>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div
                          className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all ${field.value
                              ? "border-primary bg-primary/5"
                              : "border-muted hover:border-muted-foreground/50"
                            }`}
                          onClick={() => field.onChange(true)}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${field.value ? "border-primary bg-primary" : "border-muted-foreground"
                              }`}>
                              {field.value && <div className="h-2 w-2 rounded-full bg-primary-foreground" />}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">Resepsi</div>
                              <div className="text-sm text-muted-foreground mt-1">
                                Formal wedding reception with seated dinner, entertainment, and full ceremony
                              </div>
                            </div>
                          </div>
                        </div>

                        <div
                          className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all ${!field.value
                              ? "border-primary bg-primary/5"
                              : "border-muted hover:border-muted-foreground/50"
                            }`}
                          onClick={() => field.onChange(false)}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${!field.value ? "border-primary bg-primary" : "border-muted-foreground"
                              }`}>
                              {!field.value && <div className="h-2 w-2 rounded-full bg-primary-foreground" />}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">Ngunduh Mantu</div>
                              <div className="text-sm text-muted-foreground mt-1">
                                Traditional ceremony to formally receive the bride/groom into the family
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Dynamic Content based on Selection */}
              <div className="space-y-4 mt-6">
                {form.watch("resepsi.isResepsi") ? (
                  // Resepsi (Wedding Reception) Details
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Wedding Reception Details</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="resepsi.date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Reception Date *</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="space-y-2">
                        <FormLabel>Reception Time *</FormLabel>
                        <div className="grid grid-cols-2 gap-3">
                          <FormField
                            control={form.control}
                            name="resepsi.timeRange.start"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <Input type="time" placeholder="Start time" {...field} />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="resepsi.timeRange.end"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <Input type="time" placeholder="End time" {...field} />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="resepsi.eventCategory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Category *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Resepsi, Ngunduh Mantu" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="resepsi.place"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Venue Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Grand Ballroom Hotel, Luxury Resort" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="resepsi.address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Venue Address *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Full address including street, city, and postal code"
                              className="min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="resepsi.liveLink"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Live Stream Link
                              <span className="text-muted-foreground font-normal ml-1">(Optional)</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://zoom.us/j/..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="resepsi.mapsLink"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Google Maps Link
                              <span className="text-muted-foreground font-normal ml-1">(Optional)</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://maps.google.com/..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ) : (
                  // Ngunduh Mantu Details
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>Ngunduh Mantu Details</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="resepsi.date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ceremony Date *</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="space-y-2">
                        <FormLabel>Ceremony Time *</FormLabel>
                        <div className="grid grid-cols-2 gap-3">
                          <FormField
                            control={form.control}
                            name="resepsi.timeRange.start"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <Input type="time" placeholder="Start time" {...field} />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="resepsi.timeRange.end"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <Input type="time" placeholder="End time" {...field} />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                     <FormField
                      control={form.control}
                      name="resepsi.eventCategory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Category *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Resepsi, Ngunduh Mantu" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="resepsi.place"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Family Home / Venue *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Family Home, Community Hall" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="resepsi.address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Family home address or venue location"
                              className="min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="resepsi.liveLink"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Live Stream Link
                              <span className="text-muted-foreground font-normal ml-1">(Optional)</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://zoom.us/j/..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="resepsi.mapsLink"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Location Guide
                              <span className="text-muted-foreground font-normal ml-1">(Optional)</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://maps.google.com/..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Gift */}
          <Card>
            <CardHeader>
              <CardTitle>Gift</CardTitle>
              <CardDescription>
                Details for the gift
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="gift.isRecieveGift"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enable Gift</FormLabel>
                      <FormDescription>
                        Show gift details
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              {form.watch("gift.isRecieveGift") && (
                <>
                  <FormField
                    control={form.control}
                    name="gift.nameNoRek1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Holder Name 1</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="gift.groomBank"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bank Name 1</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., BCA, Mandiri" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="gift.groomNoRek"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Number 1</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              placeholder="e.g., 1234567890"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="gift.nameNoRek2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Holder Name 2</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Jane Smith" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="gift.brideBank"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bank Name 2</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., BCA, Mandiri" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="gift.brideNoRek"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Number 2</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              placeholder="e.g., 0987654321"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="gift.giftAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gift Address</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Full address for physical gifts"
                            className="min-h-[60px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </CardContent>
          </Card>

          {/* Quotes Section */}
          <Card>
            <CardHeader>
              <CardTitle>Quotes</CardTitle>
              <CardDescription>
                Inspirational quotes for the wedding invitation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="quotes.quote1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quote 1 *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter the first quote..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quotes.quote1From"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quote 1 Source *</FormLabel>
                    <FormControl>
                      <Input placeholder="Author or source of the quote" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Separator />
              <FormField
                control={form.control}
                name="quotes.quote2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quote 2 (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter the second quote..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quotes.quote2From"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quote 2 Source (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Author or source of the quote" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Love Story Section */}
          <Card>
            <CardHeader>
              <CardTitle>Love Story</CardTitle>
              <CardDescription>
                Love Story for the wedding invitation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="loveStory.loveStoryActived"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enable Story</FormLabel>
                      <FormDescription>
                        Show love story details
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              {form.watch("loveStory.loveStoryActived") && (
                <>
                  <FormField
                    control={form.control}
                    name="loveStory.firstMeet"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Meet *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter the first quote..."
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="loveStory.theProposal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>The Proposal</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter the second quote..."
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="loveStory.marriage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>The Mariage</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter the second quote..."
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </CardContent>
          </Card>

          {/* Dress Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Dress Colors</CardTitle>
              <CardDescription>
                Define the preferred dress colors for the wedding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {form.watch("dressColors")?.map((color, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-md border shadow-sm"
                      style={{ backgroundColor: color }}
                    />
                    <FormField
                      control={form.control}
                      name={`dressColors.${index}`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <div className="flex gap-2">
                              <Input
                                placeholder="#FFFFFF"
                                {...field}
                                className="font-mono"
                                onChange={(e) => {
                                  const value = e.target.value.toUpperCase();
                                  field.onChange(value);
                                }}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  const currentColors = form.getValues("dressColors") || [];
                                  const newColors = currentColors.filter((_, i) => i !== index);
                                  form.setValue("dressColors", newColors);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const currentColors = form.getValues("dressColors") || [];
                  form.setValue("dressColors", [...currentColors, "#FFFFFF"]);
                }}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Color
              </Button>

              {/* Color Preview Grid */}
              {form.watch("dressColors") && form.watch("dressColors")!.length > 0 && (
                <div className="mt-4">
                  <FormLabel>Color Preview</FormLabel>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {form.watch("dressColors")?.map((color, index) => (
                      <div
                        key={index}
                        className="flex flex-col items-center gap-1"
                      >
                        <div
                          className="w-8 h-8 rounded-md border shadow-sm"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-xs font-mono">{color}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving || !form.formState.isDirty}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}