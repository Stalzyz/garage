"use client"

import { useEffect, useRef, useState } from "react"
import { ScanFace, UserCheck, XCircle, Loader2 } from "lucide-react"

export default function ScannerApp() {
  const [status, setStatus] = useState<"IDLE" | "SCANNING" | "SUCCESS" | "ERROR">("IDLE")
  const [message, setMessage] = useState("Waiting for scan...")
  const [student, setStudent] = useState<any>(null)
  const scannerRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    // Dynamic import to avoid SSR issues with browser APIs
    let html5QrcodeScanner: any;
    
    const initScanner = async () => {
      const { Html5QrcodeScanner } = await import("html5-qrcode")
      if (scannerRef.current && !html5QrcodeScanner) {
        html5QrcodeScanner = new Html5QrcodeScanner(
          "qr-reader",
          { fps: 10, qrbox: { width: 250, height: 250 }, rememberLastUsedCamera: true },
          false
        )

        html5QrcodeScanner.render(
          async (decodedText: string) => {
            if (status === "SCANNING") return; // Prevent double scans
            
            setStatus("SCANNING")
            setMessage("Processing...")
            
            try {
              const res = await fetch("http://localhost:3002/api/v1/academy/attendance/scan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ studentCode: decodedText })
              })
              const data = await res.json()
              
              if (!res.ok || !data.success) throw new Error(data.message || "Invalid QR Code")
              
              setStudent(data.student)
              setMessage(data.alreadyMarked ? data.message : "Attendance Marked! +10 XP")
              setStatus("SUCCESS")
              
              // Play success sound
              new Audio("https://cdn.freesound.org/previews/270/270404_5123851-lq.mp3").play().catch(e => console.log("Audio play blocked"))

              setTimeout(() => {
                setStatus("IDLE")
                setMessage("Waiting for next scan...")
                setStudent(null)
              }, 4000)

            } catch (err: any) {
              setMessage(err.message)
              setStatus("ERROR")
              new Audio("https://cdn.freesound.org/previews/142/142608_1845115-lq.mp3").play().catch(e => console.log("Audio play blocked"))
              
              setTimeout(() => {
                setStatus("IDLE")
                setMessage("Waiting for next scan...")
              }, 4000)
            }
          },
          (error: any) => {
            // Ignore ongoing read errors
          }
        )
      }
    }
    
    initScanner();

    return () => {
      if (html5QrcodeScanner) {
        html5QrcodeScanner.clear().catch((error: any) => console.error("Failed to clear html5QrcodeScanner. ", error));
      }
    }
  }, [status])

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white overflow-hidden">
      
      {/* Dynamic Background Effects */}
      <div className={`absolute inset-0 transition-colors duration-700 opacity-20 pointer-events-none
        ${status === 'SUCCESS' ? 'bg-emerald-500' : status === 'ERROR' ? 'bg-rose-500' : 'bg-transparent'}`} />

      <div className="z-10 w-full max-w-lg text-center">
        <h1 className="text-3xl font-black mb-8 tracking-widest uppercase flex items-center justify-center gap-3">
          <ScanFace className="w-8 h-8 text-sky-400" /> Kiosk Scanner
        </h1>

        <div className="relative bg-white/5 border-2 border-white/10 rounded-[3rem] p-4 overflow-hidden mb-8 backdrop-blur-xl shadow-2xl">
          <div id="qr-reader" ref={scannerRef} className="w-full rounded-[2rem] overflow-hidden [&>video]:object-cover [&>video]:w-full [&>video]:h-full border-none" />
          
          {/* Overlay state */}
          {(status === "SUCCESS" || status === "ERROR" || status === "SCANNING") && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-8 z-50">
              
              {status === "SCANNING" && (
                <div className="flex flex-col items-center animate-pulse">
                  <Loader2 className="w-16 h-16 text-sky-400 animate-spin mb-4" />
                  <div className="text-xl font-bold text-sky-400">{message}</div>
                </div>
              )}
              
              {status === "SUCCESS" && student && (
                <div className="flex flex-col items-center animate-in zoom-in duration-300">
                  <div className="w-24 h-24 rounded-full border-4 border-emerald-400 mb-4 overflow-hidden">
                    <img src={student.avatar || "https://ui-avatars.com/api/?name="+student.name} alt={student.name} className="w-full h-full object-cover" />
                  </div>
                  <UserCheck className="w-12 h-12 text-emerald-400 mb-2" />
                  <h2 className="text-2xl font-black text-white">{student.name}</h2>
                  <div className="text-emerald-400 font-bold mt-2">{message}</div>
                  <div className="mt-4 px-4 py-2 bg-white/10 rounded-full flex gap-4 text-sm font-bold text-white/80">
                    <span>🔥 {student.xp} XP</span>
                    <span>⭐ {student.careerScore} Score</span>
                  </div>
                </div>
              )}

              {status === "ERROR" && (
                <div className="flex flex-col items-center animate-in shake duration-300">
                  <XCircle className="w-20 h-20 text-rose-500 mb-4" />
                  <div className="text-xl font-black text-rose-400 text-center">{message}</div>
                  <div className="text-sm text-white/50 mt-2">Please see the front desk</div>
                </div>
              )}
              
            </div>
          )}
        </div>

        <div className="text-white/40 text-sm font-medium tracking-widest uppercase animate-pulse">
          {status === "IDLE" ? "Point QR Code at Camera" : ""}
        </div>
      </div>
    </div>
  )
}
