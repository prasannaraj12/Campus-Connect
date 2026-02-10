import { useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'
import TeamTicketsDialog from './TeamTicketsDialog'

interface Props {
  event: any
  userId: Id<"users">
  onSuccess: () => void
  onCancel?: () => void
  onDirtyChange?: (isDirty: boolean) => void
}

// Validation helpers
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validatePhone = (phone: string): boolean => {
  const digitsOnly = phone.replace(/\s/g, '')
  return /^\d{10}$/.test(digitsOnly)
}

const formatPhoneNumber = (value: string): string => {
  // Remove all non-digits
  const digitsOnly = value.replace(/\D/g, '')
  // Limit to 10 digits
  const limited = digitsOnly.slice(0, 10)
  // Format as XXXXX XXXXX
  if (limited.length > 5) {
    return `${limited.slice(0, 5)} ${limited.slice(5)}`
  }
  return limited
}

export default function RegistrationForm({ event, userId, onSuccess, onCancel, onDirtyChange }: Props) {
  const register = useMutation(api.registrations.register)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showTeamTickets, setShowTeamTickets] = useState(false)
  const [registrationResult, setRegistrationResult] = useState<any>(null)

  // Track touched fields for validation display
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const isTeamEvent = event.isTeamEvent === true
  const teamSize = event.teamSize || 0
  const requiredTeamMembers = isTeamEvent ? teamSize - 1 : 0

  const [formData, setFormData] = useState({
    participantName: '',
    participantEmail: '',
    participantPhone: '',
    college: '',
    year: '',
    teamName: '',
    teamMembers: Array.from({ length: requiredTeamMembers }, () => ({ name: '', email: '' })),
  })

  // Check if form is dirty (has any data)
  /* const isDirty = useMemo(() => {
    return (
      formData.participantName.trim() !== '' ||
      formData.participantEmail.trim() !== '' ||
      formData.participantPhone.trim() !== '' ||
      formData.college.trim() !== '' ||
      formData.year !== '' ||
      formData.teamName.trim() !== '' ||
      formData.teamMembers.some(m => m.name.trim() !== '' || m.email.trim() !== '')
    )
  }, [formData]) */

  // Notify parent of dirty state changes
  const updateDirtyState = useCallback((newFormData: typeof formData) => {
    const newIsDirty = (
      newFormData.participantName.trim() !== '' ||
      newFormData.participantEmail.trim() !== '' ||
      newFormData.participantPhone.trim() !== '' ||
      newFormData.college.trim() !== '' ||
      newFormData.year !== '' ||
      newFormData.teamName.trim() !== '' ||
      newFormData.teamMembers.some(m => m.name.trim() !== '' || m.email.trim() !== '')
    )
    onDirtyChange?.(newIsDirty)
  }, [onDirtyChange])

  // Real-time validation states
  const validation = useMemo(() => {
    const phoneDigits = formData.participantPhone.replace(/\s/g, '')
    return {
      email: {
        isValid: validateEmail(formData.participantEmail),
        message: formData.participantEmail && !validateEmail(formData.participantEmail)
          ? 'Enter a valid email address'
          : ''
      },
      phone: {
        isValid: validatePhone(formData.participantPhone),
        message: phoneDigits.length > 0 && !validatePhone(formData.participantPhone)
          ? 'Phone number must be 10 digits'
          : ''
      },
      name: {
        isValid: formData.participantName.trim().length > 0,
        message: ''
      },
      college: {
        isValid: formData.college.trim().length > 0,
        message: ''
      },
      year: {
        isValid: formData.year !== '',
        message: ''
      },
      teamName: {
        isValid: !isTeamEvent || formData.teamName.trim().length > 0,
        message: ''
      }
    }
  }, [formData, isTeamEvent])

  // Check if all required fields are valid
  const isFormValid = useMemo(() => {
    const basicValid = (
      validation.name.isValid &&
      validation.email.isValid &&
      validation.phone.isValid &&
      validation.college.isValid &&
      validation.year.isValid
    )

    if (!basicValid) return false

    if (isTeamEvent) {
      if (!validation.teamName.isValid) return false
      for (const member of formData.teamMembers) {
        if (!member.name.trim() || !validateEmail(member.email)) {
          return false
        }
      }
    }

    return true
  }, [validation, isTeamEvent, formData.teamMembers])

  // Count filled team members
  const filledMembersCount = formData.teamMembers.filter(
    m => m.name.trim() !== '' && m.email.trim() !== ''
  ).length

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }

  const getInputClassName = (field: keyof typeof validation, baseClass: string = '') => {
    const isTouched = touched[field]
    const fieldValidation = validation[field]

    let validationClass = ''
    if (isTouched && fieldValidation) {
      if (fieldValidation.isValid) {
        validationClass = 'input-valid'
      } else if (fieldValidation.message || (field !== 'email' && field !== 'phone')) {
        validationClass = 'input-invalid'
      }
    }

    return `neo-brutal w-full px-4 py-3 font-semibold focus:outline-none focus:ring-2 focus:ring-black transition-all ${validationClass} ${baseClass}`
  }

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value)
    const newFormData = { ...formData, participantPhone: formatted }
    setFormData(newFormData)
    updateDirtyState(newFormData)
  }

  const updateFormField = (field: string, value: string) => {
    const newFormData = { ...formData, [field]: value }
    setFormData(newFormData)
    updateDirtyState(newFormData)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate team data if team event
    if (isTeamEvent) {
      if (!formData.teamName.trim()) {
        setError('Team name is required for team events')
        setLoading(false)
        return
      }

      for (const member of formData.teamMembers) {
        if (!member.name.trim() || !member.email.trim()) {
          setError('All team member details are required')
          setLoading(false)
          return
        }
      }
    }

    try {
      // Remove spaces from phone before sending
      const phoneForSubmit = formData.participantPhone.replace(/\s/g, '')

      const result = await register({
        eventId: event._id,
        userId,
        participantName: formData.participantName,
        participantEmail: formData.participantEmail,
        participantPhone: phoneForSubmit,
        college: formData.college,
        year: formData.year,
        teamName: isTeamEvent ? formData.teamName : undefined,
        teamMembers: isTeamEvent ? formData.teamMembers : undefined,
      })

      setRegistrationResult(result)

      // Show team tickets dialog if team event
      if (isTeamEvent && result.allRegistrationCodes && result.allRegistrationCodes.length > 1) {
        setShowTeamTickets(true)
      } else {
        // Solo event - redirect to ticket page with code
        window.location.href = `/ticket/${result.leaderRegistrationCode}`
      }
    } catch (err: any) {
      setError(err.message || 'Failed to register')
    } finally {
      setLoading(false)
    }
  }

  const updateTeamMember = (index: number, field: 'name' | 'email', value: string) => {
    const updated = [...formData.teamMembers]
    updated[index][field] = value
    const newFormData = { ...formData, teamMembers: updated }
    setFormData(newFormData)
    updateDirtyState(newFormData)
  }

  if (showTeamTickets && registrationResult) {
    return (
      <TeamTicketsDialog
        isOpen={showTeamTickets}
        registration={registrationResult}
        onClose={() => {
          setShowTeamTickets(false)
          onSuccess()
        }}
      />
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="neo-brutal bg-red-100 p-4">
          <p className="font-bold text-red-800">{error}</p>
        </div>
      )}

      {/* Section 1: Personal Details */}
      <div>
        <h3 className="section-heading">Personal Details</h3>

        <div className="space-y-4">
          <div>
            <label className="block font-bold mb-2">Your Name *</label>
            <input
              type="text"
              required
              autoComplete="name"
              value={formData.participantName}
              onChange={(e) => updateFormField('participantName', e.target.value)}
              onBlur={() => handleBlur('name')}
              className={getInputClassName('name')}
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block font-bold mb-2">Email *</label>
            <input
              type="email"
              required
              autoComplete="email"
              value={formData.participantEmail}
              onChange={(e) => updateFormField('participantEmail', e.target.value)}
              onBlur={() => handleBlur('email')}
              className={getInputClassName('email')}
              placeholder="john@example.com"
            />
            {touched.email && validation.email.message && (
              <p className="validation-message error">{validation.email.message}</p>
            )}
          </div>

          <div>
            <label className="block font-bold mb-2">Phone *</label>
            <div className="phone-input-container">
              <span className="phone-prefix">+91</span>
              <input
                type="tel"
                required
                autoComplete="tel"
                value={formData.participantPhone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                onBlur={() => handleBlur('phone')}
                className={`${getInputClassName('phone')} flex-1`}
                placeholder="98765 43210"
                inputMode="numeric"
              />
            </div>
            {touched.phone && validation.phone.message && (
              <p className="validation-message error">{validation.phone.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Section Divider */}
      <div className="section-divider" />

      {/* Section 2: Academic Details */}
      <div>
        <h3 className="section-heading">Academic Details</h3>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block font-bold mb-2">College / Department *</label>
            <input
              type="text"
              required
              value={formData.college}
              onChange={(e) => updateFormField('college', e.target.value)}
              onBlur={() => handleBlur('college')}
              className={getInputClassName('college')}
              placeholder="Computer Science"
            />
            <p className="helper-text">Example: AIML – Sri Sairam Engineering College</p>
          </div>

          <div>
            <label className="block font-bold mb-2">Year *</label>
            <select
              required
              value={formData.year}
              onChange={(e) => updateFormField('year', e.target.value)}
              onBlur={() => handleBlur('year')}
              className={getInputClassName('year')}
            >
              <option value="">Select Year</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
              <option value="PG">PG</option>
              <option value="Graduate">Graduate</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section 3: Team Details - Only if team event */}
      {isTeamEvent && (
        <>
          <div className="section-divider" />

          <div className="neo-brutal bg-blue-50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-heading mb-0">Team Details</h3>
              <span className="member-counter">
                {filledMembersCount} / {requiredTeamMembers} members filled
              </span>
            </div>

            <div className="neo-brutal-sm bg-blue-100 p-3 mb-4">
              <p className="font-semibold text-sm">
                Team size: {teamSize} members<br />
                You are the team leader
              </p>
            </div>

            <div className="mb-4">
              <label className="block font-bold mb-2">Team Name *</label>
              <input
                type="text"
                required
                value={formData.teamName}
                onChange={(e) => updateFormField('teamName', e.target.value)}
                onBlur={() => handleBlur('teamName')}
                className={`${getInputClassName('teamName')} bg-white`}
                placeholder="Team Awesome"
              />
            </div>

            <div className="space-y-4">
              <p className="font-bold">Add {requiredTeamMembers} Team Member{requiredTeamMembers !== 1 ? 's' : ''}:</p>
              {formData.teamMembers.map((member, index) => (
                <div key={index} className="neo-brutal bg-white p-4">
                  <p className="font-bold mb-3">Team Member {index + 1}</p>
                  <div className="space-y-3">
                    <input
                      type="text"
                      required
                      value={member.name}
                      onChange={(e) => updateTeamMember(index, 'name', e.target.value)}
                      className="neo-brutal-sm w-full px-3 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="Member Name"
                    />
                    <input
                      type="email"
                      required
                      value={member.email}
                      onChange={(e) => updateTeamMember(index, 'email', e.target.value)}
                      className="neo-brutal-sm w-full px-3 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="member@example.com"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="neo-brutal bg-gray-200 flex-1 py-4 font-bold text-lg hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
          >
            Cancel
          </button>
        )}
        <motion.button
          whileHover={{ scale: isFormValid && !loading ? 1.02 : 1 }}
          whileTap={{ scale: isFormValid && !loading ? 0.98 : 1 }}
          type="submit"
          disabled={loading || !isFormValid}
          className={`neo-brutal ${onCancel ? 'flex-1' : 'w-full'} py-4 font-black text-xl transition-all ${isFormValid && !loading
            ? 'bg-green-400 hover:translate-x-1 hover:translate-y-1 hover:shadow-none'
            : 'bg-gray-300 cursor-not-allowed opacity-60'
            }`}
        >
          {loading ? 'Registering...' : 'Register'}
        </motion.button>
      </div>

      {/* Privacy Notice */}
      <p className="privacy-notice">
        Your details will be shared only with the event organizer.
      </p>
    </form>
  )
}
