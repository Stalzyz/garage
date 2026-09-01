"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Play, Square, Coffee, Camera, RefreshCw, Check, X, AlertTriangle } from "lucide-react"
import { useApi, fetchApi } from "@/lib/useApi"
import { toast } from "sonner"

type ClockAction = 'clock-in' | 'clock-out' | 'break-in' | 'break-out'

export function ClockWidget({ employeeId }: { employeeId: string }) {
  const { data, mutate } = useApi<any>(`/hr/attendance/telemetry/${employeeId}`)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isProcessing, setIsProcessing] = useState(false)

  // Selfie camera modal state
  const [pendingAction, setPendingAction] = useState<ClockAction | null>(null)
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [isCameraReady, setIsCameraReady] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setIsCameraReady(false)
  }, [])

  // Start camera when modal opens
  useEffect(() => {
    if (!pendingAction) return
    setCapturedPhoto(null)
    setCameraError(null)
    setIsCameraReady(false)

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera not supported on this device.')
      return
    }

    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 } })
      .then(stream => {
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.onloadedmetadata = () => setIsCameraReady(true)
          videoRef.current.play()
        }
      })
      .catch(() => setCameraError('Camera access denied. Please allow camera permission and try again.'))

    return () => stopCamera()
  }, [pendingAction, stopCamera])

  const capturePhoto = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.save()
    ctx.scale(-1, 1)
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height)
    ctx.restore()
    setCapturedPhoto(canvas.toDataURL('image/jpeg', 0.8))
    stopCamera()
  }, [stopCamera])

  const retakePhoto = () => {
    setCapturedPhoto(null)
    navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'user' } })
      .then(stream => {
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.onloadedmetadata = () => setIsCameraReady(true)
          videoRef.current.play()
        }
      })
      .catch(() => setCameraError('Camera access denied.'))
  }

  const confirmAndSubmit = async () => {
    if (!pendingAction) return
    setIsProcessing(true)
    try {
      await fetchApi(`/hr/attendance/${pendingAction}`, {
        method: 'POST',
        body: JSON.stringify({ employeeId, ...(capturedPhoto ? { photoUrl: capturedPhoto } : {}) })
      })
      toast.success(`✅ ${pendingAction.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} recorded!`)
      mutate()
    } catch (err: any) {
      toast.error(err.message || 'Action failed')
    } finally {
      setIsProcessing(false)
      stopCamera()
      setPendingAction(null)
      setCapturedPhoto(null)
    }
  }

  const cancelAction = () => {
    stopCamera()
    setPendingAction(null)
    setCapturedPhoto(null)
    setCameraError(null)
  }

  const activeShift = data?.activeShift || false
  const onBreak = data?.onBreak || false

  const actionLabels: Record<ClockAction, string> = {
    'clock-in': 'Clock In', 'clock-out': 'Clock Out',
    'break-in': 'Start Break', 'break-out': 'End Break',
  }

  return (
    <>
      <div className="bg-black/40 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center space-y-6">
        <div className="text-center">
          <p className="text-[10px] font-mono tracking-widest uppercase text-white/50 mb-2">Current Time</p>
          <h2 className="text-4xl font-mono font-bold text-white tracking-tighter">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </h2>
          <p className="text-[9px] font-mono text-white/30 mt-1 flex items-center justify-center gap-1">
            <Camera className="w-3 h-3" /> Selfie verification required
          </p>
        </div>

        <div className="flex gap-4 w-full">
          {!activeShift ? (
            <button disabled={isProcessing} onClick={() => setPendingAction('clock-in')}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold font-mono tracking-widest uppercase hover:bg-emerald-500/30 transition-colors disabled:opacity-50">
              <Play className="w-4 h-4" /> Clock In
            </button>
          ) : (
            <>
              <button disabled={isProcessing} onClick={() => setPendingAction('clock-out')}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold font-mono tracking-widest uppercase hover:bg-red-500/30 transition-colors disabled:opacity-50">
                <Square className="w-4 h-4" /> Clock Out
              </button>
              <button disabled={isProcessing} onClick={() => setPendingAction(onBreak ? 'break-out' : 'break-in')}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold font-mono tracking-widest uppercase hover:bg-amber-500/30 transition-colors disabled:opacity-50">
                <Coffee className="w-4 h-4" /> {onBreak ? 'End Break' : 'Start Break'}
              </button>
            </>
          )}
        </div>

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

      {/* Selfie Capture Modal */}
      {pendingAction && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div>
                <p className="text-xs font-mono tracking-widest uppercase text-white/40">Verify Identity</p>
                <h3 className="text-base font-bold text-white">{actionLabels[pendingAction]}</h3>
              </div>
              <button onClick={cancelAction} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-red-500/20 hover:text-red-400 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative aspect-video bg-black overflow-hidden">
              {cameraError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                  <AlertTriangle className="w-8 h-8 text-amber-400 mb-3" />
                  <p className="text-sm text-white/70 mb-4">{cameraError}</p>
                  <button onClick={confirmAndSubmit} disabled={isProcessing}
                    className="px-5 py-2.5 bg-white/10 rounded-xl text-xs font-mono text-white hover:bg-white/20 transition-colors disabled:opacity-50">
                    {isProcessing ? 'Submitting...' : 'Continue Without Photo'}
                  </button>
                </div>
              ) : capturedPhoto ? (
                <img src={capturedPhoto} alt="Captured selfie" className="w-full h-full object-cover" />
              ) : (
                <>
                  <video ref={videoRef} autoPlay muted playsInline
                    className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
                  {!isCameraReady && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                      <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  {isCameraReady && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-32 h-40 rounded-full border-2 border-dashed border-emerald-400/50 shadow-[0_0_20px_rgba(52,211,153,0.2)]" />
                    </div>
                  )}
                </>
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            <div className="p-5 flex gap-3">
              {capturedPhoto ? (
                <>
                  <button onClick={retakePhoto}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-mono font-bold uppercase tracking-widest text-white/70 hover:bg-white/10 transition-colors">
                    <RefreshCw className="w-3.5 h-3.5" /> Retake
                  </button>
                  <button onClick={confirmAndSubmit} disabled={isProcessing}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-xs font-mono font-bold uppercase tracking-widest text-emerald-400 hover:bg-emerald-500/30 transition-colors disabled:opacity-50">
                    <Check className="w-3.5 h-3.5" /> {isProcessing ? 'Recording...' : 'Confirm'}
                  </button>
                </>
              ) : (
                <>
                  <button onClick={cancelAction}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-mono font-bold uppercase tracking-widest text-white/70 hover:bg-white/10 transition-colors">
                    Cancel
                  </button>
                  <button onClick={capturePhoto} disabled={!isCameraReady}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-xs font-mono font-bold uppercase tracking-widest text-emerald-400 hover:bg-emerald-500/30 transition-colors disabled:opacity-50">
                    <Camera className="w-3.5 h-3.5" /> Capture
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
