import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { QrCode, X, Camera, CameraOff, Keyboard } from 'lucide-react'

interface Props {
  onClose: () => void
}

export default function QRScanner({ onClose }: Props) {
  const [mode, setMode] = useState<'camera' | 'manual'>('camera')
  const [manualInput, setManualInput] = useState('')
  const [cameraError, setCameraError] = useState('')
  const [scanning, setScanning] = useState(false)
  const [detected, setDetected] = useState('')

  const videoRef  = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef    = useRef<number>(0)

  // Navigate to ticket page with the scanned/entered code
  const goToTicket = useCallback((raw: string) => {
    const input = raw.trim().toUpperCase()
    if (!input) return
    if (input.includes('/TICKET/')) {
      const code = input.split('/TICKET/')[1]
      window.location.href = `/ticket/${code}`
    } else {
      window.location.href = `/ticket/${input}`
    }
  }, [])

  // Start camera
  const startCamera = useCallback(async () => {
    setCameraError('')
    setScanning(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        scanLoop()
      }
    } catch (err: any) {
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access and try again.'
          : 'Camera not available. Use manual entry below.'
      )
      setScanning(false)
    }
  }, [])

  // Stop camera
  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setScanning(false)
  }, [])

  // QR scan loop using BarcodeDetector (Chrome/Edge) or canvas fallback
  const scanLoop = useCallback(async () => {
    const video = videoRef.current
    if (!video || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(scanLoop)
      return
    }

    try {
      // @ts-ignore — BarcodeDetector is not in TS lib yet
      if ('BarcodeDetector' in window) {
        // @ts-ignore
        const detector = new BarcodeDetector({ formats: ['qr_code'] })
        const codes = await detector.detect(video)
        if (codes.length > 0) {
          const value = codes[0].rawValue
          setDetected(value)
          stopCamera()
          goToTicket(value)
          return
        }
      }
    } catch { /* BarcodeDetector failed, keep looping */ }

    rafRef.current = requestAnimationFrame(scanLoop)
  }, [stopCamera, goToTicket])

  // Auto-start camera when in camera mode
  useEffect(() => {
    if (mode === 'camera') startCamera()
    return () => stopCamera()
  }, [mode])

  // Cleanup on unmount
  useEffect(() => () => stopCamera(), [])

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    goToTicket(manualInput)
  }

  return (
    <div className="brutal-dialog-backdrop fixed inset-0 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.97 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl border-2 border-black/80 shadow-[6px_6px_0_rgba(0,0,0,0.85)]
                   w-full max-w-sm overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-nb-purple flex items-center justify-center
                            shadow-[2px_2px_0_rgba(0,0,0,0.7)]">
              <QrCode className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-display text-base font-black text-black tracking-tight">Scan QR Code</h2>
              <p className="text-xs text-black/40 font-medium">Mark participant attendance</p>
            </div>
          </div>
          <button
            onClick={() => { stopCamera(); onClose() }}
            className="w-8 h-8 rounded-lg bg-black/5 hover:bg-black/10 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode tabs */}
        <div className="flex border-b border-black/10">
          <button
            onClick={() => setMode('camera')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold transition-colors
                        ${mode === 'camera'
                          ? 'text-nb-purple border-b-2 border-nb-purple bg-nb-purple/5'
                          : 'text-black/40 hover:text-black'
                        }`}
          >
            <Camera className="w-3.5 h-3.5" />
            Camera
          </button>
          <button
            onClick={() => { stopCamera(); setMode('manual') }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold transition-colors
                        ${mode === 'manual'
                          ? 'text-nb-purple border-b-2 border-nb-purple bg-nb-purple/5'
                          : 'text-black/40 hover:text-black'
                        }`}
          >
            <Keyboard className="w-3.5 h-3.5" />
            Manual
          </button>
        </div>

        <div className="p-5">
          {mode === 'camera' ? (
            <div className="space-y-4">
              {/* Camera viewport */}
              <div className="relative rounded-xl overflow-hidden bg-black aspect-square">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />

                {/* Scan overlay */}
                {scanning && !cameraError && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    {/* Corner brackets */}
                    <div className="relative w-48 h-48">
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-3 border-l-3 border-nb-green rounded-tl-lg" />
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-3 border-r-3 border-nb-green rounded-tr-lg" />
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-3 border-l-3 border-nb-green rounded-bl-lg" />
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-3 border-r-3 border-nb-green rounded-br-lg" />
                      {/* Scan line */}
                      <motion.div
                        animate={{ top: ['10%', '90%', '10%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        className="absolute left-0 right-0 h-0.5 bg-nb-green/80 shadow-[0_0_6px_rgba(0,255,117,0.8)]"
                      />
                    </div>
                  </div>
                )}

                {/* Error state */}
                {cameraError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-black/80">
                    <CameraOff className="w-10 h-10 text-white/40 mb-3" />
                    <p className="text-white/70 text-xs font-medium text-center leading-relaxed">{cameraError}</p>
                    <button
                      onClick={startCamera}
                      className="mt-4 px-4 py-2 rounded-lg bg-nb-purple text-white text-xs font-bold
                                 border border-white/20 hover:bg-nb-purple/80 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                )}

                {/* Not scanning yet */}
                {!scanning && !cameraError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
                    <Camera className="w-10 h-10 text-white/40 mb-3" />
                    <p className="text-white/60 text-xs font-medium">Starting camera…</p>
                  </div>
                )}
              </div>

              <p className="text-xs text-black/40 font-medium text-center">
                Point camera at participant's QR code
              </p>

              {/* Fallback to manual */}
              <button
                onClick={() => { stopCamera(); setMode('manual') }}
                className="w-full py-2.5 rounded-lg text-xs font-bold text-black/50
                           border border-black/15 hover:bg-black/5 transition-colors"
              >
                Enter code manually instead
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-black/60 uppercase tracking-wider">
                  Registration Code
                </label>
                <form onSubmit={handleManualSubmit} className="space-y-3">
                  <input
                    type="text"
                    value={manualInput}
                    onChange={e => setManualInput(e.target.value)}
                    placeholder="e.g. REG-XCER33"
                    autoFocus
                    className="w-full px-3 py-2.5 text-sm font-semibold rounded-lg
                               bg-white border-2 border-black/20
                               shadow-[2px_2px_0_rgba(0,0,0,0.15)]
                               focus:outline-none focus:border-nb-purple
                               placeholder:text-black/25 font-mono transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!manualInput.trim()}
                    className="w-full py-2.5 rounded-lg text-sm font-bold
                               bg-nb-purple text-white border border-black/20
                               shadow-[3px_3px_0_rgba(0,0,0,0.8)]
                               hover:shadow-[4px_4px_0_rgba(0,0,0,0.9)] hover:-translate-y-px
                               active:shadow-[1px_1px_0_rgba(0,0,0,0.7)] active:translate-y-0
                               disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none
                               transition-all"
                  >
                    Mark Attendance →
                  </button>
                </form>
              </div>

              <p className="text-xs text-black/35 font-medium text-center">
                Ask the participant to share their registration code
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
