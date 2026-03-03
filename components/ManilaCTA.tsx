'use client'

import { useState } from 'react'

const INSTAGRAM_HANDLE = 'madebyaidan'
const WHATSAPP_NUMBER = '491758966210'
const WHATSAPP_MESSAGE_BASE = 'Hi Aidan - I came from the Manila photo sessions page and want to check availability.'

const GOAL_OPTIONS = [
  { id: 'profile', label: 'Profile Upgrade', message: 'I want stronger profile photos.' },
  { id: 'creator', label: 'Creator Content', message: 'I need creator-style content I can post right away.' },
  { id: 'brand', label: 'Personal Brand', message: 'I need polished personal brand photos.' }
] as const

const TIMELINE_OPTIONS = [
  { id: 'week', label: 'This Week', message: 'I can shoot this week.' },
  { id: 'month', label: 'This Month', message: 'I can shoot this month.' },
  { id: 'later', label: 'Planning Ahead', message: 'I am planning ahead and checking options.' }
] as const

type GoalOption = (typeof GOAL_OPTIONS)[number]
type TimelineOption = (typeof TIMELINE_OPTIONS)[number]

export default function ManilaCTA(){
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<GoalOption['id']>('profile')
  const [selectedTimeline, setSelectedTimeline] = useState<TimelineOption['id']>('month')
  const [copiedMessage, setCopiedMessage] = useState(false)

  function trackLead(contentCategory: string, goal: string, timeline: string){
    if (typeof window !== 'undefined' && (window as any).fbq) {
      ;(window as any).fbq('track', 'Lead', {
        content_name: 'Manila Photo Sessions',
        content_category: contentCategory,
        goal,
        timeline
      })
    }
  }

  function trackQualifier(type: 'goal' | 'timeline', value: string){
    if (typeof window !== 'undefined' && (window as any).fbq) {
      ;(window as any).fbq('trackCustom', 'ManilaQualifierSelected', {
        qualifier_type: type,
        qualifier_value: value
      })
    }
  }

  function getLeadContext(){
    const goal = GOAL_OPTIONS.find(option => option.id === selectedGoal) || GOAL_OPTIONS[0]
    const timeline = TIMELINE_OPTIONS.find(option => option.id === selectedTimeline) || TIMELINE_OPTIONS[1]
    const message = `${WHATSAPP_MESSAGE_BASE}\n\n${goal.message}\n${timeline.message}\nPreferred location in Manila: `

    return { goal, timeline, message }
  }

  function openExternal(url: string){
    setIsSubmitting(true)
    window.open(url, '_blank')
    setTimeout(() => {
      setIsSubmitting(false)
    }, 800)
  }

  function handleInstagram(event: React.MouseEvent<HTMLButtonElement>){
    event.preventDefault()
    if (isSubmitting) return

    const { goal, timeline, message } = getLeadContext()
    trackLead('Instagram Lead', goal.id, timeline.id)
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(message).then(() => {
        setCopiedMessage(true)
      }).catch(() => {
        setCopiedMessage(false)
      })
    }
    openExternal(`https://ig.me/m/${INSTAGRAM_HANDLE}`)
  }

  function handleWhatsApp(event: React.MouseEvent<HTMLButtonElement>){
    event.preventDefault()
    if (isSubmitting) return

    const { goal, timeline, message } = getLeadContext()
    trackLead('WhatsApp Lead', goal.id, timeline.id)
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
    openExternal(whatsappUrl)
  }

  return (
    <div className="mt-6 space-y-3">
      <div className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4">
        <div>
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-neutral-500">What are you booking for?</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {GOAL_OPTIONS.map(option => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  setSelectedGoal(option.id)
                  trackQualifier('goal', option.id)
                }}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  selectedGoal === option.id
                    ? 'border-neutral-900 bg-neutral-900 text-white'
                    : 'border-neutral-300 bg-white text-neutral-700 hover:border-neutral-500'
                }`}
                data-cta={`manila-goal-${option.id}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-neutral-500">When do you want to shoot?</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {TIMELINE_OPTIONS.map(option => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  setSelectedTimeline(option.id)
                  trackQualifier('timeline', option.id)
                }}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  selectedTimeline === option.id
                    ? 'border-neutral-900 bg-neutral-900 text-white'
                    : 'border-neutral-300 bg-white text-neutral-700 hover:border-neutral-500'
                }`}
                data-cta={`manila-timeline-${option.id}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={handleInstagram}
        className="btn w-full gap-2 rounded-xl bg-neutral-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800 sm:text-base"
        data-cta="manila-instagram-primary"
        disabled={isSubmitting}
      >
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
        <span>{isSubmitting ? 'Opening...' : 'Check Manila Availability on Instagram'}</span>
      </button>

      <p className="text-xs text-neutral-600">
        {copiedMessage
          ? 'A ready message was copied. Paste it in Instagram DM so I can send matching slots faster.'
          : 'Tap once to open Instagram DM. I can usually send slot options within a few hours.'}
      </p>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-neutral-600">
        <button
          onClick={handleWhatsApp}
          className="font-semibold underline decoration-neutral-400 underline-offset-2 transition hover:text-neutral-800"
          data-cta="manila-whatsapp-secondary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Opening...' : 'Prefer WhatsApp?'}
        </button>
        <a
          href="mailto:aidan@aidantorrence.com?subject=Manila%20Session%20Inquiry"
          className="font-semibold underline decoration-neutral-400 underline-offset-2 transition hover:text-neutral-800"
          data-cta="manila-email-secondary"
        >
          Email instead
        </a>
        <span className="rounded-full border border-neutral-300/80 bg-white px-2.5 py-1 font-medium text-neutral-500">
          Fast response on active days
        </span>
      </div>
    </div>
  )
}
