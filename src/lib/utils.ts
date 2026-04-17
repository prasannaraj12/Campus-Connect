import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function getDaysUntilEvent(dateString: string): number {
  const eventDate = new Date(dateString)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  eventDate.setHours(0, 0, 0, 0)
  const diffTime = eventDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    Workshop: 'bg-yellow-400',
    Seminar: 'bg-blue-400',
    Sports: 'bg-green-400',
    Cultural: 'bg-pink-400',
    Technical: 'bg-purple-400',
    Social: 'bg-orange-400',
    Hackathon: 'bg-cyan-400',
  }
  return colors[category] || 'bg-gray-400'
}

export function exportToCSV(data: any[], filename: string) {
  if (!data || data.length === 0) {
    console.warn('exportToCSV: no data to export')
    return
  }

  // Generate CSV content
  const headers = [
    'Name',
    'Email',
    'Department',
    'Year',
    'Event Name',
    'Registration Date'
  ]

  const rows = data.map((reg: any) => [
    reg.participantName,
    reg.participantEmail,
    reg.college,
    reg.year,
    reg.eventName || 'N/A', // Handle potentially missing event name
    new Date(reg._creationTime).toLocaleDateString()
  ])

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename.replace(/[^a-z0-9]/gi, '_')}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
