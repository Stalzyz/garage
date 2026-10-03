"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Play, Square, Coffee, Camera, RefreshCw, X, Check, MapPin, Briefcase, FileText, DollarSign, Layers } from "lucide-react"
import { useApi, fetchApi } from "@/lib/useApi"
import { toast } from "sonner"

export type ClockAction = 'clock-in' | 'clock-out' | 'break-in' | 'break-out' | 'switch-task'

interface JibblePunchModalProps {
  action: ClockAction
  employeeId: string
  onClose: () => void
  onSuccess: () => void
}

export function JibblePunchModal({ action, employeeId, onClose, onSuccess }: JibblePunchModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [isCameraReady, setIsCameraReady] = useState(false)
  const [enableCamera, setEnableCamera] = useState(true)

  // Form Fields
  const [projectId, setProjectId] = useState("")
  const [taskId, setTaskId] = useState("")
  const [notes, setNotes] = useState("")
  const [isBillable, setIsBillable] = useState(true)

  // Data fetching for projects & tasks
  const { data: projectsData } = useApi<any>("/projects")
  const { data: tasksData } = useApi<any>(projectId ? `/projects/${projectId}/tasks` : null)

  const projects = projectsData?.data || projectsData?.projects || []
  const tasks = tasksData?.data || tasksData?.tasks || []

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setIsCameraReady(false)
  }, [])

  useEffect(() => {
    if (!enableCamera) {
      stopCamera()
      return
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera not supported on this device.")
      return
    }

    navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 640, height: 480 } })
      .then(stream => {
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.onloadedmetadata = () => setIsCameraReady(true)
          videoRef.current.play()
        }
      })
      .catch(() => setCameraError("Camera access denied or unverified."))

    return () => stopCamera()
  }, [enableCamera, stopCamera])

  const capturePhoto = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.save()
    ctx.scale(-1, 1)
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height)
    ctx.restore()
    setCapturedPhoto(canvas.toDataURL("image/jpeg", 0.85))
    stopCamera()
  }, [stopCamera])

  const retakePhoto = () => {
    setCapturedPhoto(null)
    setEnableCamera(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    let coords: { latitude?: number; longitude?: number } = {}
    if (typeof window !== "undefined" && navigator.geolocation) {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { 
            timeout: 10000, 
            enableHighAccuracy: true,
            maximumAge: 60000 
          })
        })
        coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude }
      } catch (geoErr) {
        console.warn('[Jibble] Geolocation capture deferred/denied:', geoErr)
      }
    }

    const payload = {
      employeeId,
      projectId: projectId || undefined,
      taskId: taskId || undefined,
      notes: notes || undefined,
      isBillable,
      photoUrl: capturedPhoto || undefined,
      ...coords,
    }

    try {
      const endpoint = action === 'switch-task' ? '/hr/time/switch' : `/hr/attendance/${action}`
      await fetchApi(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
      })
      toast.success(`Successfully recorded ${action.replace(/-/g, " ")}!`)
      onSuccess()
      onClose()
    } catch (err: any) {
      toast.error(err.message || "Failed to record entry")
    } finally {
      setIsProcessing(false)
      stopCamera()
    }
  }

  const actionTitles: Record<ClockAction, { title: string; color: string; icon: any }> = {
    'clock-in': { title: "Clock In & Select Activity", color: "text-emerald-400", icon: Play },
    'clock-out': { title: "Clock Out Shift", color: "text-red-400", icon: Square },
    'break-in': { title: "Start Break", color: "text-amber-400", icon: Coffee },
    'break-out': { title: "End Break & Resume Work", color: "text-emerald-400", icon: Play },
    'switch-task': { title: "Switch Project / Task", color: "text-blue-400", icon: Layers },
  }

  const currentAction = actionTitles[action]
  const ActionIcon = currentAction.icon

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-[#0f1117] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl bg-white/5 border border-white/10 ${currentAction.color}`}>
              <ActionIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-mono tracking-widest uppercase text-white/40">Grekam OS • Time Tracker</p>
              <h3 className="text-base font-bold text-white">{currentAction.title}</h3>
            </div>
          </div>
          <button onClick={() => { stopCamera(); onClose(); }} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-red-500/20 hover:text-red-400 transition-colors">
            <X className="w-4 h-4 text-white/70" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Project & Task Selection */}
          {(action === 'clock-in' || action === 'switch-task' || action === 'break-out') && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Project Selector */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-1.5 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-blue-400" /> Client / Project
                  </label>
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                  >
                    <option value="" className="bg-[#0f1117] text-white/50">-- Select Project (Optional) --</option>
                    {projects.map((p: any) => (
                      <option key={p.id} value={p.id} className="bg-[#0f1117] text-white">
                        {p.name} {p.client?.name ? `(${p.client.name})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Task Selector */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-1.5 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-purple-400" /> Specific Task
                  </label>
                  <select
                    value={taskId}
                    onChange={(e) => setTaskId(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                  >
                    <option value="" className="bg-[#0f1117] text-white/50">-- Select Task (Optional) --</option>
                    {tasks.map((t: any) => (
                      <option key={t.id} value={t.id} className="bg-[#0f1117] text-white">
                        {t.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* What are you working on notes */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-400" /> Activity Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Designing homepage wireframes or Client consultation call"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>

              {/* Billable Toggle */}
              <div className="flex items-center justify-between p-3 bg-white/[0.03] border border-white/10 rounded-xl">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <div>
                    <p className="text-xs font-semibold text-white">Billable Activity</p>
                    <p className="text-[10px] text-white/40">Include this time in client invoices</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsBillable(!isBillable)}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                    isBillable ? "bg-emerald-500" : "bg-white/20"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                      isBillable ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* Selfie Camera Verification */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase tracking-wider text-white/60 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-amber-400" /> Selfie Verification
              </label>
              <button
                type="button"
                onClick={() => setEnableCamera(!enableCamera)}
                className="text-[10px] font-mono text-white/40 hover:text-white underline"
              >
                {enableCamera ? "Disable Camera" : "Enable Camera"}
              </button>
            </div>

            {enableCamera && (
              <div className="relative aspect-video bg-black/60 rounded-xl overflow-hidden border border-white/10">
                {cameraError ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                    <p className="text-xs text-white/60 mb-2">{cameraError}</p>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                      You can proceed without camera
                    </span>
                  </div>
                ) : capturedPhoto ? (
                  <img src={capturedPhoto} alt="Captured selfie" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" style={{ transform: "scaleX(-1)" }} />
                    {!isCameraReady && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                        <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                    {isCameraReady && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-24 h-32 rounded-full border-2 border-dashed border-emerald-400/50 shadow-[0_0_15px_rgba(52,211,153,0.2)]" />
                      </div>
                    )}
                  </>
                )}
                <canvas ref={canvasRef} className="hidden" />

                {enableCamera && !cameraError && (
                  <div className="absolute bottom-2 right-2 z-10">
                    {capturedPhoto ? (
                      <button type="button" onClick={retakePhoto} className="px-2.5 py-1 bg-black/80 border border-white/20 rounded-lg text-[10px] font-mono text-white flex items-center gap-1 hover:bg-black">
                        <RefreshCw className="w-3 h-3" /> Retake
                      </button>
                    ) : (
                      <button type="button" onClick={capturePhoto} disabled={!isCameraReady} className="px-2.5 py-1 bg-emerald-500 border border-emerald-400 rounded-lg text-[10px] font-mono text-black font-bold flex items-center gap-1 hover:bg-emerald-400 disabled:opacity-50">
                        <Camera className="w-3 h-3" /> Snap
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={() => { stopCamera(); onClose(); }}
              className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-white/70 hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className={`flex-1 flex items-center justify-center gap-2 py-3 border rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-colors ${
                action === 'clock-out'
                  ? 'bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30'
                  : action === 'break-in'
                  ? 'bg-amber-500/20 border-amber-500/30 text-amber-400 hover:bg-amber-500/30'
                  : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30'
              } disabled:opacity-50`}
            >
              <Check className="w-4 h-4" />
              {isProcessing ? "Recording..." : `Confirm ${action.replace(/-/g, " ")}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
