"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ProBuilder } from "@/components/builder/ProBuilder"
import { fetchApi, useApi } from "@/lib/useApi"
import { toast } from "sonner"

export default function BuilderPage() {
  const { id } = useParams()
  const router = useRouter()
  
  // Assuming the page is fetched via CMS pages API
  const { data, isLoading, mutate } = useApi<any>(`/cms/pages/${id}`)
  const page = data?.page
  
  const [isSaving, setIsSaving] = useState(false)

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#1e1e1e] text-white">
        <div className="animate-pulse">Loading Builder Engine...</div>
      </div>
    )
  }

  if (!page) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#1e1e1e] text-white flex-col gap-4">
        <p>Page not found</p>
        <button onClick={() => router.push('/dashboard/cms')} className="px-4 py-2 bg-blue-600 rounded">Go Back</button>
      </div>
    )
  }

  const handleSave = async (html: string, css: string) => {
    setIsSaving(true)
    try {
      await fetchApi(`/cms/pages/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          customHtml: html,
          customCss: css
        })
      })
      toast.success("Page saved successfully")
      mutate()
    } catch (err: any) {
      toast.error(err.message || "Failed to save page")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      <ProBuilder 
        initialHtml={page.customHtml || page.content} 
        initialCss={page.customCss}
        onSave={handleSave} 
      />
    </div>
  )
}
