import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/use-auth'

/**
 * Protected route wrapper for organizer-only pages
 * Redirects non-organizers to dashboard
 */
export function OrganizerRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      // Not logged in - redirect to role selection
      navigate('/role-selection')
    } else if (user.role !== 'organizer') {
      // Logged in but not an organizer - redirect to dashboard
      console.warn('Access denied: Organizer role required')
      navigate('/dashboard')
    }
  }, [user, navigate])

  // Don't render anything until we verify the user
  if (!user || user.role !== 'organizer') {
    return null
  }

  return <>{children}</>
}

/**
 * Protected route wrapper for participant-only pages
 * Redirects non-participants to dashboard
 */
export function ParticipantRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      // Not logged in - redirect to role selection
      navigate('/role-selection')
    } else if (user.role !== 'participant') {
      // Logged in but not a participant - redirect to dashboard
      console.warn('Access denied: Participant role required')
      navigate('/dashboard')
    }
  }, [user, navigate])

  // Don't render anything until we verify the user
  if (!user || user.role !== 'participant') {
    return null
  }

  return <>{children}</>
}

/**
 * Protected route wrapper for authenticated users (any role)
 * Redirects unauthenticated users to role selection
 */
export function AuthenticatedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      navigate('/role-selection')
    }
  }, [user, navigate])

  if (!user) {
    return null
  }

  return <>{children}</>
}
