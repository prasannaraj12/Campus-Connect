import { motion } from 'framer-motion'
import { Calendar, Clock, MapPin, Users, User, FileText, Mail, Phone, Copy, Check, Ticket, Share2, CheckCircle } from 'lucide-react'
import { formatDate } from '../../lib/utils'
import { Id } from '../../../convex/_generated/dataModel'
import { useState } from 'react'
import ShareButtons from '../ShareButtons'

interface Event {
  _id: Id<"events">
  title: string
  description: string
  date: string
  time: string
  location: string
  category: string
  maxParticipants: number
  teamSize?: number
  requirements?: string
  organizerName?: string
  organizerEmail?: string
  organizerPhone?: string
  organizerRole?: string
  showContactInfo?: boolean
  showSharing?: boolean
}

interface Props {
  event: Event
  organizer: any
  participantCount: number
  isOrganizer?: boolean
  isRegistered?: boolean
  onRegisterClick?: () => void
}

export default function EventInfo({ event, organizer, participantCount, isOrganizer, isRegistered, onRegisterClick }: Props) {
  const capacityPercent = (participantCount / event.maxParticipants) * 100
  const [copied, setCopied] = useState<string | null>(null)
  const isFilling = capacityPercent >= 70
  const isFull = participantCount >= event.maxParticipants

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const hasContactInfo = event.showContactInfo !== false && (event.organizerName || event.organizerEmail || event.organizerPhone)

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="nb bg-white p-6 sm:p-10 border-4 border-nb-black relative overflow-hidden"
    >
      {/* ── Decorative Signal Lines ────────────────────────── */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-nb-yellow -rotate-45 translate-x-16 -translate-y-16 border-b-4 border-nb-black" />

      {/* ── Heading Sector ──────────────────────────────────── */}
      <div className="mb-12">
        <div className="space-y-4 max-w-3xl">
          <div className="flex items-center gap-3">
            <span className="nb-tag bg-nb-black text-white text-[10px] uppercase font-black px-3 py-1">CORE INTEL</span>
            <div className="h-0.5 grow bg-nb-black/10" />
            <span className="text-[10px] font-bold text-nb-black/30 uppercase tracking-[0.4em]">SIGNAL_{event._id.slice(-4).toUpperCase()}</span>
          </div>
          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-black text-nb-black leading-[0.85] uppercase tracking-tighter italic drop-shadow-[4px_4px_0px_rgba(250,204,21,1)]">
            {event.title}
          </h1>
          <div className="flex items-center gap-4 text-nb-black/40 text-[9px] font-black uppercase tracking-widest pt-2">
            <span>OPERATIONAL_STATUS: {isFull ? 'CAPACITY_MAX' : 'ACTIVE_RECRUITMENT'}</span>
            <span className="w-1 h-1 bg-nb-black/20 rounded-full" />
            <span>ENROLLMENT_PCT: {Math.round(capacityPercent)}%</span>
          </div>
        </div>
      </div>

      {/* ── Metric Grid ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="nb-sm bg-nb-yellow p-4 border-2 border-nb-black flex flex-col justify-between min-h-[100px] nb-hover group">
          <div className="flex justify-between items-start">
            <Calendar className="w-5 h-5 opacity-40 group-hover:rotate-12 transition-transform" />
            <span className="text-[8px] font-black uppercase tracking-widest opacity-40">DATE_MARK</span>
          </div>
          <p className="text-lg font-black uppercase leading-tight mt-4">{formatDate(event.date)}</p>
        </div>

        <div className="nb-sm bg-nb-orange p-4 border-2 border-nb-black flex flex-col justify-between min-h-[100px] nb-hover group">
          <div className="flex justify-between items-start text-white">
            <Clock className="w-5 h-5 opacity-60 group-hover:rotate-12 transition-transform" />
            <span className="text-[8px] font-black uppercase tracking-widest opacity-60">TIME_SYNC</span>
          </div>
          <p className="text-lg font-black uppercase leading-tight mt-4 text-white tracking-widest">{event.time}</p>
        </div>

        <div className="nb-sm bg-nb-black p-4 border-2 border-white/20 flex flex-col justify-between min-h-[100px] nb-hover group">
          <div className="flex justify-between items-start text-nb-yellow">
            <MapPin className="w-5 h-5 opacity-60 group-hover:-translate-y-1 transition-transform" />
            <span className="text-[8px] font-black uppercase tracking-widest opacity-60 text-white/40">LOCATION_ID</span>
          </div>
          <p className="text-lg font-black uppercase leading-tight mt-4 text-nb-yellow truncate">{event.location}</p>
        </div>

        <div className="nb-sm bg-nb-paper p-4 border-2 border-nb-black flex flex-col justify-between min-h-[100px] nb-hover group">
          <div className="flex justify-between items-start">
            <Users className="w-5 h-5 opacity-40 group-hover:scale-110 transition-transform" />
            <span className="text-[8px] font-black uppercase tracking-widest opacity-40">CAPACITY_PCT</span>
          </div>
          <p className="text-lg font-black uppercase leading-tight mt-4">
            {participantCount} <span className="opacity-20">/</span> {event.maxParticipants}
          </p>
        </div>
      </div>

      {/* ── Status Bar Sector ────────────────────────────────── */}
      <div className="mb-12 space-y-3">
        <div className="flex justify-between items-end">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 nb-sm border-nb-black ${capacityPercent >= 90 ? 'bg-nb-orange' : 'bg-nb-yellow'}`} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-nb-black/50">Occupancy Level Tracking</span>
          </div>
          <span className="font-display text-3xl font-black italic">{Math.round(capacityPercent)}%</span>
        </div>
        <div className="h-6 bg-nb-paper border-4 border-nb-black nb-sm overflow-hidden flex">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(capacityPercent, 100)}%` }}
            transition={{ duration: 1.2, ease: "circOut" }}
            className={`h-full border-r-4 border-nb-black ${capacityPercent >= 90 ? 'bg-nb-orange animate-pulse' : capacityPercent >= 70 ? 'bg-nb-yellow' : 'bg-nb-black'}`}
          />
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-full w-px bg-nb-black/10 mx-auto" />
          ))}
        </div>
      </div>

      {/* ── Content Sector ──────────────────────────────────── */}
      <div className="grid lg:grid-cols-5 gap-10">
        <div className="lg:col-span-3 space-y-10">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1.5 h-6 bg-nb-black" />
              <h2 className="text-xl font-black uppercase tracking-tight">OPERATIONAL OBJECTIVES</h2>
            </div>
            <div className="bg-nb-paper bg-opacity-30 p-8 nb-sm border-2 border-nb-black/5">
              <p className="text-[13px] font-bold text-nb-black/70 leading-relaxed whitespace-pre-wrap uppercase tracking-tighter">
                {event.description}
              </p>
            </div>
          </div>

          {event.requirements && (
            <div className="nb bg-nb-yellow p-6 border-4 border-nb-black relative">
              <div className="absolute -top-4 -left-4 nb-sm bg-nb-black text-white p-2 border-2 border-nb-black">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-black uppercase mb-3 ml-4 tracking-widest">CRITICAL REQUIREMENTS</h3>
              <p className="text-[11px] font-black text-nb-black/60 leading-relaxed whitespace-pre-wrap uppercase italic">
                {event.requirements}
              </p>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-8">
          {/* Contact Node */}
          <div className="nb bg-nb-black p-6 border-4 border-nb-black text-white">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-5 h-5 text-nb-yellow" />
              <h3 className="text-xs font-black uppercase tracking-widest">COMMAND CONTACT</h3>
            </div>
            
            <div className="space-y-4">
              {hasContactInfo ? (
                <>
                  {event.organizerName && (
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <div>
                        <p className="text-[8px] font-black text-white/40 uppercase mb-1">PRIMARY LEAD</p>
                        <p className="text-sm font-black uppercase tracking-widest">{event.organizerName}</p>
                      </div>
                      <div className="nb-tag bg-nb-yellow text-black text-[8px]">{event.organizerRole?.toUpperCase() || 'CORE'}</div>
                    </div>
                  )}

                  {event.organizerEmail && (
                    <div className="flex items-center justify-between group">
                      <div className="truncate pr-4">
                        <p className="text-[8px] font-black text-white/40 uppercase mb-1">EMAIL FREQUENCY</p>
                        <a href={`mailto:${event.organizerEmail}`} className="text-[10px] font-black uppercase tracking-wider text-nb-yellow hover:underline block truncate">
                          {event.organizerEmail}
                        </a>
                      </div>
                      <button onClick={() => copyToClipboard(event.organizerEmail!, 'email')} className="nb-btn-sm bg-white text-black p-2 border-2 border-nb-black">
                        {copied === 'email' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  )}

                  {event.organizerPhone && (
                    <div className="flex items-center justify-between group">
                      <div>
                        <p className="text-[8px] font-black text-white/40 uppercase mb-1">DIRECT LINK</p>
                        <a href={`tel:${event.organizerPhone}`} className="text-[10px] font-black uppercase tracking-wider text-white hover:text-nb-yellow transition-colors block">
                          {event.organizerPhone}
                        </a>
                      </div>
                      <button onClick={() => copyToClipboard(event.organizerPhone!, 'phone')} className="nb-btn-sm bg-nb-yellow text-black p-2 border-2 border-nb-black">
                        {copied === 'phone' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 shrink-0 nb-sm bg-nb-yellow border-2 border-nb-black flex items-center justify-center">
                    <User className="w-5 h-5 text-nb-black" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[8px] font-black text-white/40 uppercase mb-1">CAMPUS LOGISTICS</p>
                    <p className="text-xs font-black uppercase truncate">
                      {organizer?.email || 'SYSTEM AUTOMATED'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="nb-sm bg-white p-6 border-2 border-nb-black italic">
            <div className="flex items-center gap-3 mb-4">
              <Share2 className="w-4 h-4 text-nb-black" />
              <span className="text-[10px] font-black uppercase tracking-widest">RELAY THIS SIGNAL</span>
            </div>
            <ShareButtons
              title={event.title}
              description={`Synchronize with ${event.title} on ${formatDate(event.date)}!`}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
