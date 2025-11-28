// app/wedding/[id]/edit/page.tsx
"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import WeddingEditForm from "./components/wedding-edit-form"
import MediaManagement from "./components/media-management"

export default function WeddingEditPage() {
  const params = useParams()
  const router = useRouter()
  const weddingId = params.id as string
  const [activeTab, setActiveTab] = useState("wedding")

  const handleBack = () => {
    router.push("/wedding")
  }

  return (
    <div className="space-y-6 px-4 lg:px-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handleBack}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Wedding Invitation</h1>
            <p className="text-muted-foreground">
              Manage wedding invitation details and media
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="wedding" className="cursor-pointer">
            Wedding Details
          </TabsTrigger>
          <TabsTrigger value="media" className="cursor-pointer">
            Media & Images
          </TabsTrigger>
        </TabsList>

        <TabsContent value="wedding" className="space-y-6">
          <WeddingEditForm 
            weddingId={weddingId}
            onTabChange={setActiveTab}
          />
        </TabsContent>

        <TabsContent value="media" className="space-y-6">
          <MediaManagement 
            weddingId={weddingId}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}