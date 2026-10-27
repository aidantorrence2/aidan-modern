// The one place the collab sign-up flow knows which city it is in. Change
// these when the shoot moves; the picker, form, moodboard page and metadata
// all read from here.
export const SHOOT = {
  city: 'Charlotte',
  // Shown in the top-right corner of every picker screen.
  dates: 'November',
  // Local-format example for the WhatsApp field (Charlotte, NC is +1 704).
  phoneExample: '+1 704 555 0123',
} as const
