"use client"

import { useState } from 'react'

type Orientation = 'landscape' | 'portrait' | 'square'

type Props = {
  title: string
  gallery: string[]
}

export default function ShootGallery({ title, gallery }: Props){
  const [orientations, setOrientations] = useState<Record<string, Orientation>>({})

  function registerOrientation(name: string, width: number, height: number){
    if(!width || !height || orientations[name]) return
    const next: Orientation = width === height ? 'square' : width > height ? 'landscape' : 'portrait'
    setOrientations(prev => ({ ...prev, [name]: next }))
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {gallery.map(image => {
        const orientation = orientations[image]
        const isLandscape = orientation === 'landscape'
        const itemClass = isLandscape ? 'sm:col-span-2' : ''

        return (
          <a key={image} href={`/images/large/${image}.jpg`} className={`group overflow-hidden border border-neutral-200 bg-white/60 ${itemClass}`}>
            <img
              loading="lazy"
              alt={`${title} photo by Aidan Torrence`}
              src={`/images/large/${image}.jpg`}
              className="w-full h-auto transition-transform duration-300 group-hover:scale-[1.01]"
              onLoad={(event) => {
                const { naturalWidth, naturalHeight } = event.currentTarget
                registerOrientation(image, naturalWidth, naturalHeight)
              }}
            />
          </a>
        )
      })}
    </div>
  )
}
