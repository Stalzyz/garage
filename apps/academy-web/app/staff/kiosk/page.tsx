"use client"

import { useState, useRef, useEffect } from "react"
import { CheckCircle2, Loader2, UserCheck, Camera } from "lucide-react"
import { toast } from "sonner"
import { useApi, fetchApi } from "@/lib/useApi"

export default function StaffKioskPage() {
  const { data } = useApi<{ employees: any[] }>("/hr/employees")
  const employees = data?.employees || []

  const [step, setStep] = useState<"SELECT" | "CAMERA" | "SUCCESS">("SELECT")
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null)
  const [action, setAction] = useState<"IN" | "OUT">("IN")
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [photoData, setPhotoData] = useState<string | null>(null)

  useEffect(() => {
    if (step === "CAMERA") {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(s => {
          setStream(s)
          if (videoRef.current) {
            videoRef.current.srcObject = s
          }
        })
        .catch(err => {
          console.error(err)
          toast.error("Camera access denied or unavailable.")
        })
    } else {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
        setStream(null)
      }
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [step])

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const dataUrl = canvas.toDataURL("image/jpeg")
        setPhotoData(dataUrl)
      }
    }
  }

  const handleRetake = () => {
    setPhotoData(null)
  }

  const handleSubmit = async () => {
    if (!photoData) {
      toast.error("Please take a selfie first.")
      return
    }
    setIsSubmitting(true)
    try {
      const endpoint = action === "IN" ? "/hr/attendance/clock-in" : "/hr/attendance/clock-out"
      
      const res = await fetch(`http://localhost:4000/api/v1${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: selectedEmployee.id,
          photoUrl: photoData
        })
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to log attendance")
      }

      setStep("SUCCESS")
    } catch (err: any) {
      toast.error(err.message || "Failed to save attendance.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const reset = () => {
    setStep("SELECT")
    setSelectedEmployee(null)
    setPhotoData(null)
  }

  if (step === "SUCCESS") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 text-white">
        <div className="max-w-md w-full text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center animate-bounce">
            <CheckCircle2 className="w-12 h-12 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-black mb-3">
            {action === "IN" ? "Clocked In Successfully!" : "Clocked Out Successfully!"}
          </h1>
          <p className="text-white/60 mb-8">Have a great {action === "IN" ? "day ahead!" : "evening!"}</p>
          <button onClick={reset} className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors font-bold text-sm">
            Done
          </button>
        </div>
      </div>
    )
  }

  if (step === "CAMERA") {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white">
        <div className="max-w-xl w-full">
          <h1 className="text-2xl font-bold mb-2 text-center">Take a Selfie</h1>
          <p className="text-white/50 text-center mb-8">Please align your face in the frame.</p>

          <div className="relative aspect-video bg-white/5 rounded-3xl overflow-hidden border border-white/10 mb-8">
            {!photoData && (
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            )}
            {photoData && (
              <img src={photoData} alt="Captured" className="w-full h-full object-cover" />
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          <div className="flex flex-col gap-4">
            {!photoData ? (
              <button onClick={handleCapture} className="w-full py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
                <Camera className="w-5 h-5" /> Capture Photo
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <button onClick={handleRetake} className="w-full py-4 bg-white/10 text-white font-bold rounded-2xl hover:bg-white/20 transition-all">
                  Retake
                </button>
                <button onClick={handleSubmit} disabled={isSubmitting} className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle2 className="w-5 h-5" /> Submit</>}
                </button>
              </div>
            )}
            <button onClick={() => setStep("SELECT")} className="w-full py-3 text-white/50 text-sm hover:text-white transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 text-white">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4 border border-primary/30">
            <UserCheck className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-black mb-2">Staff Check-In</h1>
          <p className="text-white/50 text-sm">Select your name to log your attendance.</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-xs text-white/50 uppercase tracking-widest block mb-2 font-bold">Select Employee</label>
            <select 
              value={selectedEmployee?.id || ""} 
              onChange={e => setSelectedEmployee(employees.find(emp => emp.id === e.target.value))}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white focus:outline-none focus:border-primary transition-colors [&>option]:bg-zinc-900"
            >
              <option value="">-- Choose Name --</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.user?.firstName} {emp.user?.lastName}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              disabled={!selectedEmployee}
              onClick={() => { setAction("IN"); setStep("CAMERA") }}
              className="py-4 rounded-2xl font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 disabled:opacity-50 transition-all"
            >
              Clock In
            </button>
            <button 
              disabled={!selectedEmployee}
              onClick={() => { setAction("OUT"); setStep("CAMERA") }}
              className="py-4 rounded-2xl font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 disabled:opacity-50 transition-all"
            >
              Clock Out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
