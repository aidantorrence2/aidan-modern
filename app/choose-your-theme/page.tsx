import { permanentRedirect } from 'next/navigation'

// The picker moved to /sign-up-collab on 2026-09-07; story slides still print this URL.
export default function ChooseYourThemeRedirect() { permanentRedirect('/sign-up-collab') }
