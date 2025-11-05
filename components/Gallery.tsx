"use client"
import Link from 'next/link'
import { useState } from 'react'
import { shoots } from '@/data/shoots'

type Orientation = 'landscape' | 'portrait' | 'square'

export default function Gallery(){
  const [orientations, setOrientations] = useState<Record<string, Orientation>>({})

  function registerOrientation(name: string, width: number, height: number){
    if(!width || !height) return
    const next: Orientation = width === height ? 'square' : width > height ? 'landscape' : 'portrait'
    setOrientations(prev => (prev[name] === next ? prev : { ...prev, [name]: next }))
  }

  return (
    <section id="work" className="mt-6 sm:mt-12">
      <div className="container">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {shoots.map(shoot => {
            const orientation = orientations[shoot.cover]
            const isLandscape = orientation === 'landscape'
            const cardClass = 'group block transition-colors'
            const imageSizes = isLandscape
              ? '(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw'
              : '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
            const mobileAspectClass = isLandscape ? 'aspect-[4/3]' : 'aspect-[3/4]'
            const desktopAspectClass = isLandscape ? 'sm:aspect-auto sm:h-auto' : 'sm:aspect-[4/5]'
            const wrapperClass = `relative overflow-hidden ${mobileAspectClass} ${desktopAspectClass}`
            const imageHeightClass = isLandscape ? 'h-full sm:h-auto' : 'h-full'
            const galleryImages = shoot.gallery
            const previewTiles = galleryImages.slice(0,4)
            const overflowCount = galleryImages.length - previewTiles.length
            const [locationCity, locationCountry] = shoot.location.split(',').map(part => part.trim())

            return (
              <Link key={shoot.slug} href={`/shoots/${shoot.slug}`} className={cardClass}>
                <div className={wrapperClass}>
                  <img
                    loading="lazy"
                    alt={`${shoot.title} photo by Aidan Torrence`}
                    src={`/images/thumbs/${shoot.cover}.jpg`}
                    className={`${imageHeightClass} w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]`}
                    srcSet={`/images/thumbs/${shoot.cover}.jpg 600w, /images/large/${shoot.cover}.jpg 1600w`}
                    sizes={imageSizes}
                    onLoad={(event) => {
                      const { naturalWidth, naturalHeight } = event.currentTarget
                      registerOrientation(shoot.cover, naturalWidth, naturalHeight)
                    }}
                  />

                  <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden flex-col justify-end bg-gradient-to-t from-ink/75 via-ink/20 to-transparent p-4 sm:flex sm:translate-y-1 sm:opacity-0 sm:transition-all sm:duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <div className="mt-2 flex items-center gap-2">
                      {previewTiles.map((img, idx) => {
                        const tileOrientation = orientations[img]
                        const sizeClass = tileOrientation === 'landscape' ? 'h-14 w-24' : 'h-14 w-14'
                        return (
                          <div
                            key={img}
                            className={`relative overflow-hidden border border-white/60 shadow-sm ${sizeClass}`}
                          >
                            <img
                              src={`/images/thumbs/${img}.jpg`}
                              alt="Preview"
                              className="h-full w-full object-cover"
                              loading="lazy"
                              onLoad={(event)=>{
                                const { naturalWidth, naturalHeight } = event.currentTarget
                                registerOrientation(img, naturalWidth, naturalHeight)
                              }}
                            />
                            {idx === previewTiles.length - 1 && overflowCount > 0 && (
                              <span className="absolute inset-0 flex items-center justify-center bg-black/60 text-xs font-semibold text-white">
                                +{overflowCount}
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
                <div className="px-4 pb-4 pt-3 sm:px-4 sm:pb-5">
                  <div className="flex items-start justify-between gap-4">
                    <span className="font-display text-left text-[1.55rem] leading-none text-[#4d5138] sm:text-[1.85rem]">{shoot.firstName}</span>
                    <span className="text-right text-[0.6rem] font-medium leading-tight text-neutral-600 sm:text-[0.58rem] sm:uppercase sm:tracking-[0.3em]">
                      <span className="block">{locationCity}</span>
                      {locationCountry && <span className="block">{locationCountry}</span>}
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
