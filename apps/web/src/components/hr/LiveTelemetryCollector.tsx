"use client"

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Activity, Camera, Check, ChevronDown, ChevronUp, Eye, EyeOff, Monitor, Pause, Play, ShieldCheck, Zap } from 'lucide-react'
import { useCurrentUser } from '@/context/CurrentUserContext'
import { fetchApi } from '@/lib/useApi'
import { toast } from 'sonner'

export function LiveTelemetryCollector() {
  const { userId, employeeId, role, firstName } = useCurrentUser()
  
  // Effective tracking ID is employeeId if available, otherwise userId
  const trackingId = employeeId || userId

  // Local activity state (displayed in UI)
  const [isMinimized, setIsMinimized] = useState(true)
  const [isScreenTracking, setIsScreenTracking] = useState(false)
  const [activeSeconds, setActiveSeconds] = useState(0)
  const [idleSeconds, setIdleSeconds] = useState(0)
  const [keystrokesCount, setKeystrokesCount] = useState(0)
  const [clicksCount, setClicksCount] = useState(0)
  const [lastHeartbeatTime, setLastHeartbeatTime] = useState<Date | null>(null)
  const [isCapturingSnapshot, setIsCapturingSnapshot] = useState(false)

  // Mutable refs for tracking without triggering re-renders on every key/mouse event
  const streamRef = useRef<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const lastInteractionTimeRef = useRef<number>(Date.now())
  const intervalKeystrokesRef = useRef<number>(0)
  const intervalClicksRef = useRef<number>(0)
  const intervalActiveSecondsRef = useRef<number>(0)
  const intervalIdleSecondsRef = useRef<number>(0)

  // Do not track clients or students
  const isEligibleStaff = role && !['CLIENT', 'STUDENT'].includes(role)

  // 1. Capture user interactions (Keystrokes & Clicks)
  useEffect(() => {
    if (!isEligibleStaff) return

    const handleKeyDown = () => {
      lastInteractionTimeRef.current = Date.now()
      intervalKeystrokesRef.current += 1
      setKeystrokesCount(prev => prev + 1)
    }

    const handleMouseDown = () => {
      lastInteractionTimeRef.current = Date.now()
      intervalClicksRef.current += 1
      setClicksCount(prev => prev + 1)
    }

    const handleMouseMove = () => {
      lastInteractionTimeRef.current = Date.now()
    }

    const handleScroll = () => {
      lastInteractionTimeRef.current = Date.now()
    }

    window.addEventListener('keydown', handleKeyDown, { passive: true })
    window.addEventListener('mousedown', handleMouseDown, { passive: true })
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [isEligibleStaff])

  // 2. Active vs Idle second ticker
  useEffect(() => {
    if (!isEligibleStaff) return

    const ticker = setInterval(() => {
      const now = Date.now()
      const timeSinceLastInteraction = now - lastInteractionTimeRef.current
      const isDocumentVisible = typeof document !== 'undefined' && document.visibilityState === 'visible'

      // Idle if no mouse/keyboard interaction for > 60 seconds or tab is hidden
      if (timeSinceLastInteraction > 60000 || !isDocumentVisible) {
        intervalIdleSecondsRef.current += 1
        setIdleSeconds(prev => prev + 1)
      } else {
        intervalActiveSecondsRef.current += 1
        setActiveSeconds(prev => prev + 1)
      }
    }, 1000)

    return () => clearInterval(ticker)
  }, [isEligibleStaff])

  // 3. Periodic Telemetry Heartbeat (every 60 seconds)
  const sendHeartbeat = useCallback(async () => {
    if (!trackingId || !isEligibleStaff) return

    const activeSecs = intervalActiveSecondsRef.current
    const idleSecs = intervalIdleSecondsRef.current
    const keys = intervalKeystrokesRef.current
    const clicks = intervalClicksRef.current

    // Don't send empty heartbeat if 0 seconds accumulated
    if (activeSecs + idleSecs < 10 && keys === 0 && clicks === 0) return

    // Convert seconds to minutes for DB schema
    const activeMinutes = +(activeSecs / 60).toFixed(2)
    const idleMinutes = +(idleSecs / 60).toFixed(2)

    try {
      await fetchApi('/hr/telemetry/heartbeat', {
        method: 'POST',
        body: JSON.stringify({
          employeeId: trackingId,
          activeMinutes,
          idleMinutes,
          keyboardStrokes: keys,
          mouseClicks: clicks,
          appCategory: 'DEEP_WORK',
          activeAppTitle: typeof document !== 'undefined' ? document.title : 'Grekam OS'
        })
      })

      // Reset interval batch counters upon successful dispatch
      intervalActiveSecondsRef.current = 0
      intervalIdleSecondsRef.current = 0
      intervalKeystrokesRef.current = 0
      intervalClicksRef.current = 0
      setLastHeartbeatTime(new Date())
    } catch (err) {
      console.warn('[Telemetry] Heartbeat dispatch deferred:', err)
    }
  }, [trackingId, isEligibleStaff])

  useEffect(() => {
    if (!isEligibleStaff || !trackingId) return

    // Send every 60 seconds
    const heartbeatInterval = setInterval(() => {
      sendHeartbeat()
    }, 60000)

    return () => clearInterval(heartbeatInterval)
  }, [isEligibleStaff, trackingId, sendHeartbeat])

  // 4. Capture Screen Frame Helper
  const takeScreenSnapshot = useCallback(async (isManual = false) => {
    if (!streamRef.current || !videoRef.current || !trackingId) {
      if (isManual) toast.error('Enable Screen Monitoring first before taking a snapshot')
      return
    }

    const video = videoRef.current
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      if (isManual) toast.error('Video stream is still initializing, please retry')
      return
    }

    setIsCapturingSnapshot(true)
    try {
      const canvas = document.createElement('canvas')
      // Scale down to standard 1280px width for fast upload and lightweight storage
      const targetWidth = 1280
      const targetHeight = Math.round((targetWidth / video.videoWidth) * video.videoHeight)
      canvas.width = targetWidth
      canvas.height = targetHeight

      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Could not create canvas context')

      ctx.drawImage(video, 0, 0, targetWidth, targetHeight)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.65) // Compressed JPEG

      await fetchApi('/hr/telemetry/screenshot', {
        method: 'POST',
        body: JSON.stringify({
          employeeId: trackingId,
          imageUrl: dataUrl,
          notes: isManual ? 'Staff manual snapshot verification' : 'Automated periodic screen capture'
        })
      })

      if (isManual) {
        toast.success('Live screen snapshot synced to Monitoring Dashboard!')
      }
    } catch (err: any) {
      console.error('[Telemetry] Screenshot error:', err)
      if (isManual) toast.error(err.message || 'Failed to capture screenshot')
    } finally {
      setIsCapturingSnapshot(false)
    }
  }, [trackingId])

  // 5. Start / Stop Screen Monitoring Stream
  const toggleScreenMonitoring = async () => {
    if (isScreenTracking) {
      // Stop tracking
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
      setIsScreenTracking(false)
      toast.info('Screen monitoring paused')
      return
    }

    try {
      if (!navigator.mediaDevices?.getDisplayMedia) {
        toast.error('Screen sharing is not supported by this browser')
        return
      }

      // Request display stream (Entire Screen / Application Window)
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'monitor',
          frameRate: 5
        },
        audio: false
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play().catch(() => {})
      }

      // Handle when employee clicks browser's native "Stop Sharing"
      stream.getVideoTracks()[0].onended = () => {
        setIsScreenTracking(false)
        streamRef.current = null
        if (videoRef.current) videoRef.current.srcObject = null
        toast.info('Screen stream stopped')
      }

      setIsScreenTracking(true)
      toast.success('Screen monitoring activated. Initial snapshot capturing...')

      // Wait 1 second for video stream to establish frame, then take initial snapshot
      setTimeout(() => {
        takeScreenSnapshot(false)
      }, 1500)
    } catch (err: any) {
      if (err.name !== 'NotAllowedError') {
        console.error('[Telemetry] Screen capture error:', err)
        toast.error(err.message || 'Could not start screen monitoring')
      }
    }
  }

  // 6. Periodic Screen Snapshot timer (Every 5 minutes while active)
  useEffect(() => {
    if (!isScreenTracking) return

    const snapshotInterval = setInterval(() => {
      takeScreenSnapshot(false)
    }, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(snapshotInterval)
  }, [isScreenTracking, takeScreenSnapshot])

  // Don't render for students or external clients
  if (!isEligibleStaff) return null

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60)
    const hours = Math.floor(mins / 60)
    const remMins = mins % 60
    return `${hours}h ${remMins}m`
  }

  return (
    <>
      {/* Hidden off-screen video element to receive the MediaStream */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="hidden pointer-events-none opacity-0 fixed -top-[9999px]"
      />

      {/* Floating Telemetry & Screen Monitoring Dock Widget */}
      <div className="fixed bottom-6 left-6 z-40 transition-all duration-300">
        {isMinimized ? (
          /* Minimized Compact Capsule */
          <button
            onClick={() => setIsMinimized(false)}
            className="flex items-center gap-2.5 px-3 py-2 bg-[#09090b]/90 hover:bg-[#121217] border border-white/10 hover:border-violet-500/40 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.6)] backdrop-blur-xl text-white transition-all group"
            title="Open Work Telemetry Panel"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isScreenTracking ? 'bg-emerald-400' : 'bg-violet-400'
              }`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isScreenTracking ? 'bg-emerald-500' : 'bg-violet-500'
              }`} />
            </span>
            <span className="text-[11px] font-mono font-medium text-white/80 group-hover:text-white">
              {isScreenTracking ? 'Screen Live' : 'Telemetry Active'}
            </span>
            <span className="text-[10px] font-mono text-white/40">
              {formatDuration(activeSeconds)}
            </span>
            <ChevronUp className="w-3.5 h-3.5 text-white/40 group-hover:text-white transition-colors" />
          </button>
        ) : (
          /* Expanded Telemetry & Snapshot Controller */
          <div className="w-80 bg-[#09090b]/95 border border-white/15 rounded-2xl p-4 shadow-[0_12px_45px_rgba(0,0,0,0.7)] backdrop-blur-2xl text-white">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
                  <Activity className="w-3.5 h-3.5 text-violet-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold leading-none">Work Telemetry</h4>
                  <p className="text-[10px] font-mono text-white/40 mt-0.5">{firstName || 'Staff'}</p>
                </div>
              </div>
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1 text-white/40 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Live Metrics Grid */}
            <div className="grid grid-cols-2 gap-2 my-3">
              <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
                <span className="text-[9px] font-mono uppercase tracking-wider text-emerald-400 block font-bold">Active Time</span>
                <span className="text-base font-bold font-mono">{formatDuration(activeSeconds)}</span>
              </div>
              <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
                <span className="text-[9px] font-mono uppercase tracking-wider text-amber-400 block font-bold">Idle Time</span>
                <span className="text-base font-bold font-mono">{formatDuration(idleSeconds)}</span>
              </div>
              <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
                <span className="text-[9px] font-mono uppercase tracking-wider text-blue-400 block font-bold">Keystrokes</span>
                <span className="text-base font-bold font-mono">{keystrokesCount.toLocaleString()}</span>
              </div>
              <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
                <span className="text-[9px] font-mono uppercase tracking-wider text-purple-400 block font-bold">Mouse Clicks</span>
                <span className="text-base font-bold font-mono">{clicksCount.toLocaleString()}</span>
              </div>
            </div>

            {/* Screen Monitoring Stream Control */}
            <div className="space-y-2 pt-1 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-white/70 flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5 text-violet-400" /> Screen Monitoring
                </span>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                  isScreenTracking ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/10 text-white/50'
                }`}>
                  {isScreenTracking ? 'ACTIVE' : 'IDLE'}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={toggleScreenMonitoring}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all ${
                    isScreenTracking
                      ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30'
                      : 'bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-600/30'
                  }`}
                >
                  {isScreenTracking ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {isScreenTracking ? 'Stop Stream' : 'Start Screen Stream'}
                </button>

                {isScreenTracking && (
                  <button
                    onClick={() => takeScreenSnapshot(true)}
                    disabled={isCapturingSnapshot}
                    className="p-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-white transition-colors disabled:opacity-50"
                    title="Capture Instant Snapshot"
                  >
                    <Camera className={`w-4 h-4 ${isCapturingSnapshot ? 'animate-pulse text-emerald-400' : ''}`} />
                  </button>
                )}
              </div>
            </div>

            {/* Privacy & Sync Status Footer */}
            <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[9px] font-mono text-white/40">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" /> Privacy Enforced
              </span>
              <span>
                {lastHeartbeatTime ? `Synced ${lastHeartbeatTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Syncing every 60s'}
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
