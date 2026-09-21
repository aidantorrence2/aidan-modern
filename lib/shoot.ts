// The one place the collab sign-up flow knows which city it is in. Change
// these when the shoot moves; the picker, form, moodboard page and metadata
// all read from here.
export const SHOOT = {
  city: 'Istanbul',
  // Shown in the top-right corner of every picker screen.
  dates: 'September',
  // Local-format example for the WhatsApp field (Turkey is +90).
  phoneExample: '+90 532 123 4567',
} as const
