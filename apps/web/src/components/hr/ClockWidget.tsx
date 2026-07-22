"use client"

import { useState, useEffect, useRef } from "react"
import { Clock, Play, Square, Coffee } from "lucide-react"
import { useApi, fetchApi } from "@/lib/useApi"
import { toast } from "sonner"
import Webcam from "react-webcam"

export function ClockWidget({ employeeId }: { employeeId: string }) {
  const { data, mutate } = useApi<any>(`/hr/attendance/telemetry/${employeeId}`)
  const [currentTime, setCurrentTime] = useState(new Date())
  
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const webcamRef = useRef<any>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [pendingAction, setPendingAction] = useState<'clock-in' | 'clock-out' | null>(null)

  const handleAction = async (action: 'clock-in' | 'clock-out' | 'break-in' | 'break-out') => {
    if (action === 'clock-in' || action === 'clock-out') {
      setPendingAction(action)
      setShowCamera(true)
      return
    }

    setIsProcessing(true)
    try {
      await fetchApi(`/hr/attendance/${action}`, {
        method: "POST",
        body: JSON.stringify({ employeeId })
      })
      toast.success(`Successfully recorded: ${action.replace("-", " ")}`)
      mutate()
    } catch (err: any) {
      toast.error(err.message || "Action failed")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCaptureAndSubmit = async () => {
    if (!webcamRef.current) return
    setIsProcessing(true)
    try {
      const imageSrc = webcamRef.current.getScreenshot()
      if (!imageSrc) throw new Error("Could not capture screenshot from camera")

      // Convert base64 to file blob
      const blob = await fetch(imageSrc).then(res => res.blob())
      const file = new File([blob], "selfie.jpg", { type: "image/jpeg" })

      const formData = new FormData()
      formData.append('file', file)

      // Upload locally
      const uploadRes = await fetch('/api/v1/storage/upload-local', {
        method: 'POST',
        body: formData
      })
      const uploadData = await uploadRes.json()
      if (!uploadRes.ok || !uploadData.downloadUrl) {
        throw new Error(uploadData.error || "Failed to upload selfie")
      }

      const photoUrl = uploadData.downloadUrl

      // POST to attendance clock endpoint
      await fetchApi(`/hr/attendance/${pendingAction}`, {
        method: "POST",
        body: JSON.stringify({ employeeId, photoUrl })
      })

      toast.success(`Successfully recorded: ${pendingAction!.replace("-", " ")}`)
      setShowCamera(false)
      setPendingAction(null)
      mutate()
    } catch (err: any) {
      toast.error(err.message || "Failed to complete clock action")
    } finally {
      setIsProcessing(false)
    }
  }

  const activeShift = data?.activeShift || false
  const onBreak = data?.onBreak || false
  
  return (
    <div className="bg-black/40 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center space-y-6">
      {showCamera ? (
        <div className="flex flex-col items-center space-y-4 w-full">
          <p className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">Selfie Camera Required</p>
          <div className="w-full aspect-video rounded-xl overflow-hidden border border-white/10 bg-black">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full h-full object-cover"
              videoConstraints={{ facingMode: "user" }}
            />
          </div>
          <div className="flex gap-3 w-full">
            <button 
              onClick={() => { setShowCamera(false); setPendingAction(null) }}
              className="flex-1 py-2 text-xs font-bold font-mono tracking-widest uppercase border border-white/10 text-white/60 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button 
              disabled={isProcessing}
              onClick={handleCaptureAndSubmit}
              className="flex-1 py-2 text-xs font-bold font-mono tracking-widest uppercase bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isProcessing ? "Processing..." : "Capture & Submit"}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="text-center">
            <p className="text-[10px] font-mono tracking-widest uppercase text-white/50 mb-2">Current Time</p>
            <h2 className="text-4xl font-mono font-bold text-white tracking-tighter">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </h2>
          </div>

          <div className="flex gap-4 w-full">
            {!activeShift ? (
              <button 
                disabled={isProcessing}
                onClick={() => handleAction('clock-in')}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold font-mono tracking-widest uppercase hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
              >
                <Play className="w-4 h-4" /> Clock In
              </button>
            ) : (
              <>
                <button 
                  disabled={isProcessing}
                  onClick={() => handleAction('clock-out')}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold font-mono tracking-widest uppercase hover:bg-red-500/30 transition-colors disabled:opacity-50"
                >
                  <Square className="w-4 h-4" /> Clock Out
                </button>
                
                <button 
                  disabled={isProcessing}
                  onClick={() => handleAction(onBreak ? 'break-out' : 'break-in')}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold font-mono tracking-widest uppercase hover:bg-amber-500/30 transition-colors disabled:opacity-50"
                >
                  <Coffee className="w-4 h-4" /> {onBreak ? "End Break" : "Start Break"}
                </button>
              </>
            )}
          </div>
        </>
      )}

      {data?.telemetry && (
        <div className="w-full grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
          <div>
            <p className="text-[9px] font-mono tracking-widest uppercase text-white/40 mb-1">Logged Today</p>
            <p className="text-sm font-bold text-emerald-400">{data.telemetry.loggedHours} hrs</p>
          </div>
          <div>
            <p className="text-[9px] font-mono tracking-widest uppercase text-white/40 mb-1">Overtime</p>
            <p className="text-sm font-bold text-amber-400">{data.telemetry.overtime} hrs</p>
          </div>
        </div>
      )}
    </div>
  )
}
