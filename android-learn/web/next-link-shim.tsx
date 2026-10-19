// Stand-in for next/link in the offline bundle (the app hides its only link when embedded).
import type { AnchorHTMLAttributes } from 'react'

export default function Link({ href, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: unknown }) {
  return <a href={String(href)} {...rest} />
}
