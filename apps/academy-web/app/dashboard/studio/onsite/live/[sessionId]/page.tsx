"use client"

import { useEffect, useState, use } from "react"
import { useApi, fetchApi } from "@/lib/useApi"
import { QRCodeSVG } from "qrcode.react"
import { toast } from "sonner"
import { CheckCircle2, XCircle, Clock, Maximize, Loader2 } from "lucide-react"

export default function LiveProjectorPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const resolvedParams = use(params)
  const sessionId = resolvedParams.sessionId
  
  const [token, setToken] = useState<string>("")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Fetch the grid (polling every 5 seconds)
  const { data, mutate, isLoading } = useApi<any>(`/academy/attendance/session/${sessionId}`)

  useEffect(() => {
    const pollInterval = setInterval(() => {
      mutate()
    }, 5000)
    return () => clearInterval(pollInterval)
  }, [mutate])

  // Generate QR Token initially and every 30 seconds
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const res = await fetchApi<{token: string, timestamp: number}>("/academy/attendance/token", {
          method: "POST",
          body: JSON.stringify({ sessionId })
        })
        setToken(`token=${res.token}&ts=${res.timestamp}`)
      } catch (err) {
        console.error(err)
      }
    }
    fetchToken()
    const interval = setInterval(fetchToken, 30000)
    return () => clearInterval(interval)
  }, [sessionId])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const handleManualOverride = async (studentId: string, currentStatus: string) => {
    setIsRefreshing(true)
    try {
      const nextStatus = currentStatus === 'PRESENT' ? 'ABSENT' : currentStatus === 'ABSENT' ? 'LATE' : 'PRESENT'
      await fetchApi("/academy/attendance/manual", {
        method: "POST",
        body: JSON.stringify({ sessionId, studentId, status: nextStatus })
      })
      toast.success(`Marked as ${nextStatus}`)
      mutate()
    } catch (err: any) {
      toast.error(err.message || "Failed to update attendance")
    } finally {
      setIsRefreshing(false)
    }
  }

  if (isLoading && !data) {
    return <div className="flex h-screen items-center justify-center bg-[#050505] text-white"><Loader2 className="animate-spin w-8 h-8" /></div>
  }

  if (!data?.session) {
    return <div className="flex h-screen items-center justify-center bg-[#050505] text-white">Session not found.</div>
  }

  const grid = data.grid || []
  const presentCount = grid.filter((s: any) => s.status === 'PRESENT').length
  const totalCount = grid.length

  const qrUrl = `http://localhost:3001/dashboard/student/scan?sessionId=${sessionId}&${token}`

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#050505] text-white overflow-hidden">
      
      {/* Left: QR Code Projection */}
      <div className="flex-1 flex flex-col items-center justify-center border-r border-white/10 p-12 relative bg-black">
        <button onClick={toggleFullscreen} className="absolute top-8 right-8 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
          <Maximize className="w-5 h-5 text-white/50 hover:text-white" />
        </button>
        
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black tracking-tight mb-4">{data.session.title}</h1>
          <p className="text-2xl text-white/50 font-mono">Scan to Mark Attendance</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-[0_0_100px_rgba(255,255,255,0.1)] relative">
          {/* Subtle scanning line animation */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
             <div className="w-full h-1 bg-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.8)] animate-[scan_3s_ease-in-out_infinite]" />
          </div>
          <QRCodeSVG 
            value={qrUrl} 
            size={350}
            bgColor="#ffffff"
            fgColor="#000000"
            level="Q"
            includeMargin={false}
          />
        </div>

        <div className="mt-12 flex items-center gap-4 text-sm text-white/40 font-mono">
          <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Code refreshes every 30s</span>
        </div>
      </div>

      {/* Right: Live Grid */}
      <div className="w-[450px] bg-[#0a0a0a] flex flex-col">
        <div className="p-8 border-b border-white/10">
          <h2 className="text-2xl font-bold mb-2">Live Grid</h2>
          <div className="flex items-center gap-4">
            <div className="text-emerald-400 font-mono text-sm">{presentCount} / {totalCount} Present</div>
            {isRefreshing && <Loader2 className="w-3 h-3 animate-spin text-white/30" />}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
          {grid.map((student: any) => {
            const isPresent = student.status === 'PRESENT'
            const isLate = student.status === 'LATE'
            
            return (
              <div 
                key={student.studentId}
                onClick={() => handleManualOverride(student.studentId, student.status)}
                className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all \${
                  isPresent 
                    ? "bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20" 
                    : isLate 
                      ? "bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20"
                      : "bg-white/5 border-white/5 hover:bg-white/10 opacity-60"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center font-bold text-xs uppercase border border-white/10 shrink-0">
                  {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-bold truncate \${isPresent ? "text-emerald-400" : isLate ? "text-amber-400" : "text-white"}`}>
                    {student.firstName} {student.lastName}
                  </h3>
                  <p className="text-[10px] text-white/40 font-mono truncate">{student.studentCode}</p>
                </div>
                <div className="shrink-0">
                  {isPresent ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : 
                   isLate ? <Clock className="w-5 h-5 text-amber-500" /> : 
                   <XCircle className="w-5 h-5 text-white/20" />}
                </div>
              </div>
            )
          })}
          
          {grid.length === 0 && (
            <div className="text-center text-white/40 py-12">No students enrolled in this batch.</div>
          )}
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { transform: translateY(0); }
          50% { transform: translateY(350px); }
          100% { transform: translateY(0); }
        }
      `}} />
    </div>
  )
}
