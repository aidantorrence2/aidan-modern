'use client';

import React, { useState } from 'react';

interface ReelData {
  id: string;
  createdAt: string;
  strategy: string;
  files: { name: string; type: 'video' | 'image' }[];
}

const reels: ReelData[] = [
  {
    id: 'output-10a',
    createdAt: '2026-03-12T23:35:38.906Z',
    strategy: 'v30 — Pinterest Moodboard aesthetic, warm curated look, animated pin drop on slide 2',
    files: [
      { name: '01_moodboard_hook.png', type: 'image' },
      { name: '02_moodboard_build.mp4', type: 'video' },
      { name: '03_moodboard_process.png', type: 'image' },
      { name: '04_moodboard_cta.png', type: 'image' },
    ],
  },
  {
    id: 'output-5a',
    createdAt: '2026-03-12T23:35:25.351Z',
    strategy: 'v19b — dark bg, DM CTA, single continuous animated MP4',
    files: [{ name: 'v19b_manila_model_search.mp4', type: 'video' }],
  },
  {
    id: 'output-15a',
    createdAt: '2026-03-12T23:35:25.141Z',
    strategy: 'v19 — v18 white-bg bold design with animated proof slide (MP4)',
    files: [
      { name: '01_hook_story.png', type: 'image' },
      { name: '02_proof_story.mp4', type: 'video' },
      { name: '03_process_story.png', type: 'image' },
      { name: '04_cta_story.png', type: 'image' },
    ],
  },
  {
    id: 'output-14a',
    createdAt: '2026-03-12T23:34:43.831Z',
    strategy: 'v21 — warm editorial magazine aesthetic, all 4 slides animated MP4, terracotta MANILA accent',
    files: [
      { name: '01_hook_story.mp4', type: 'video' },
      { name: '02_proof_story.mp4', type: 'video' },
      { name: '03_process_story.mp4', type: 'video' },
      { name: '04_cta_story.mp4', type: 'video' },
    ],
  },
  {
    id: 'output-9a',
    createdAt: '2026-03-12T23:34:41.202Z',
    strategy: 'v66 — Animated zine/collage video, cut & paste punk aesthetic',
    files: [{ name: '01_manila_zine_video.mp4', type: 'video' }],
  },
  {
    id: 'output-4a',
    createdAt: '2026-03-12T23:34:39.958Z',
    strategy: 'v54 — Film camera viewfinder POV with integrated CTA overlay',
    files: [{ name: '01_viewfinder_manila_ad.mp4', type: 'video' }],
  },
  {
    id: 'output-13a',
    createdAt: '2026-03-12T23:34:19.286Z',
    strategy: 'v32 — Swiss/International Typographic Style, ultra minimal grid, red MANILA accent',
    files: [
      { name: '01_hook_story.png', type: 'image' },
      { name: '02_grid_story.mp4', type: 'video' },
      { name: '03_process_story.png', type: 'image' },
      { name: '04_cta_story.png', type: 'image' },
    ],
  },
  {
    id: 'output-8a',
    createdAt: '2026-03-12T23:34:12.853Z',
    strategy: 'v39 — Enhanced 35mm film strip, full uncropped images, deeper analog aesthetic',
    files: [
      { name: '01_hook_story.png', type: 'image' },
      { name: '02_filmstrip_story.mp4', type: 'video' },
      { name: '03_process_story.png', type: 'image' },
      { name: '04_cta_story.png', type: 'image' },
    ],
  },
  {
    id: 'output-12a',
    createdAt: '2026-03-12T23:34:01.170Z',
    strategy: 'v28 — Scattered Polaroids nostalgic instant film aesthetic, animated MP4 slide 2',
    files: [
      { name: '01_polaroid_hook.png', type: 'image' },
      { name: '02_polaroid_scatter.mp4', type: 'video' },
      { name: '03_polaroid_process.png', type: 'image' },
      { name: '04_polaroid_cta.png', type: 'image' },
    ],
  },
  {
    id: 'output-3a',
    createdAt: '2026-03-12T23:33:45.000Z',
    strategy: 'v43d — ChatGPT UI animated conversation (are you in manila copy)',
    files: [{ name: '01_dm_full_story.mp4', type: 'video' }],
  },
  {
    id: 'output-11a',
    createdAt: '2026-03-12T23:33:43.221Z',
    strategy: 'v31 — Neon / Club Poster nightlife energy concept with animated proof slide MP4',
    files: [
      { name: '01_neon_hook_story.png', type: 'image' },
      { name: '02_neon_proof_story.mp4', type: 'video' },
      { name: '03_neon_process_story.png', type: 'image' },
      { name: '04_neon_cta_story.png', type: 'image' },
    ],
  },
  {
    id: 'output-7a',
    createdAt: '2026-03-12T23:33:33.827Z',
    strategy: 'v44b — Improved iMessage group chat, natural DM CTA, more photos',
    files: [{ name: '01_imessage_group_chat.mp4', type: 'video' }],
  },
  {
    id: 'output-6a',
    createdAt: '2026-03-12T23:33:02.935Z',
    strategy: 'v20b — dark cinematic continuous MP4 with DM-based CTA, MANILA_COLOR accent',
    files: [{ name: 'manila-model-search-v20b.mp4', type: 'video' }],
  },
  {
    id: 'output-2a',
    createdAt: '2026-03-12T23:33:00.650Z',
    strategy: 'v29b — Magazine editorial continuous animation, serif/gold aesthetic, DM-based CTA',
    files: [{ name: '01_magazine_editorial.mp4', type: 'video' }],
  },
  {
    id: 'output-20a',
    createdAt: '2026-03-12T23:32:52.839Z',
    strategy: 'v53b — Polaroid developing animation with MANILA FREE PHOTO SHOOT header',
    files: [{ name: '01_polaroid_developing.mp4', type: 'video' }],
  },
  {
    id: 'output-1a',
    createdAt: '2026-03-12T23:32:25.347Z',
    strategy: 'v17b — single continuous animated MP4, message-based CTA',
    files: [{ name: 'manila-model-search-v17b.mp4', type: 'video' }],
  },
  {
    id: 'output-25a',
    createdAt: '2026-03-12T23:32:24.785Z',
    strategy: 'v71c — 4-grid story image + reply flood + extended conversation',
    files: [{ name: '01_story_replies_convo.mp4', type: 'video' }],
  },
  {
    id: 'output-19a',
    createdAt: '2026-03-12T23:32:11.283Z',
    strategy: 'v75 — glass floating bubbles with narrative: Manila free shoot → proof → how it works → DM CTA',
    files: [{ name: '01_bubble_pop_manila.mp4', type: 'video' }],
  },
  {
    id: 'output-24a',
    createdAt: '2026-03-12T23:31:34.097Z',
    strategy: 'v68e — 7 hey messages flood in at once, madebyaidan responds naturally',
    files: [{ name: '01_hey_flood_dm.mp4', type: 'video' }],
  },
  {
    id: 'output-18a',
    createdAt: '2026-03-12T23:31:30.267Z',
    strategy: 'v76 — skeleton loading UI that progressively resolves to reveal Manila free photo shoot content',
    files: [{ name: '01_skeleton_loading_manila.mp4', type: 'video' }],
  },
  {
    id: 'output-17a',
    createdAt: '2026-03-12T23:31:23.030Z',
    strategy: 'v18 — high-contrast bold white-bg design, thick borders, massive type',
    files: [
      { name: '01_hook_story.png', type: 'image' },
      { name: '02_proof_story.png', type: 'image' },
      { name: '03_process_story.png', type: 'image' },
      { name: '04_cta_story.png', type: 'image' },
    ],
  },
  {
    id: 'output-16a',
    createdAt: '2026-03-12T23:31:15.690Z',
    strategy: 'v16 — full-bleed DR creative, manually selected manila files',
    files: [
      { name: '01_hook_story.png', type: 'image' },
      { name: '02_proof_story.png', type: 'image' },
      { name: '03_how_easy_story.png', type: 'image' },
      { name: '04_sign_up_story.png', type: 'image' },
    ],
  },
  {
    id: 'output-23a',
    createdAt: '2026-03-12T23:30:46.631Z',
    strategy: 'v71b — story reply flood + extended back-and-forth conversation',
    files: [{ name: '01_story_replies_convo.mp4', type: 'video' }],
  },
  {
    id: 'output-22a',
    createdAt: '2026-03-12T23:30:06.735Z',
    strategy: 'v70 — story views exploding animation',
    files: [{ name: '01_story_views.mp4', type: 'video' }],
  },
  {
    id: 'output-21a',
    createdAt: '2026-03-12T23:29:20.694Z',
    strategy: 'v51b — iPhone lock screen notification story, single continuous animation, DM CTA',
    files: [{ name: '01_lockscreen_notifications.mp4', type: 'video' }],
  },
];

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export default function ReelsPage() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
      <h1
        style={{
          fontSize: 32,
          fontWeight: 700,
          marginBottom: 8,
          letterSpacing: '-0.02em',
        }}
      >
        Latest Reels
      </h1>
      <p style={{ color: '#666', marginBottom: 40, fontSize: 15 }}>
        {reels.length} reels — sorted newest first — all created March 12, 2026
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: 24,
        }}
      >
        {reels.map((reel, i) => (
          <div
            key={reel.id}
            style={{
              border: '1px solid #e5e5e5',
              borderRadius: 12,
              overflow: 'hidden',
              background: '#fafafa',
            }}
          >
            {/* Preview: show first video or first image */}
            <div
              style={{
                position: 'relative',
                background: '#000',
                aspectRatio: '9/16',
                maxHeight: expanded === reel.id ? 'none' : 500,
                overflow: 'hidden',
              }}
            >
              {reel.files[0].type === 'video' ? (
                <video
                  src={`/reels/${reel.id}/${reel.files[0].name}`}
                  controls
                  playsInline
                  muted
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                />
              ) : (
                <img
                  src={`/reels/${reel.id}/${reel.files[0].name}`}
                  alt={reel.strategy}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                />
              )}
              <span
                style={{
                  position: 'absolute',
                  top: 10,
                  left: 10,
                  background: 'rgba(0,0,0,0.7)',
                  color: '#fff',
                  padding: '4px 10px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                #{i + 1}
              </span>
            </div>

            <div style={{ padding: '16px 18px' }}>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  marginBottom: 6,
                  lineHeight: 1.4,
                }}
              >
                {reel.strategy}
              </p>
              <p style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>
                {formatDate(reel.createdAt)} · {reel.id}
              </p>

              {reel.files.length > 1 && (
                <div>
                  <button
                    onClick={() =>
                      setExpanded(expanded === reel.id ? null : reel.id)
                    }
                    style={{
                      fontSize: 12,
                      color: '#2563eb',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      marginBottom: 8,
                    }}
                  >
                    {expanded === reel.id
                      ? 'Hide all slides'
                      : `Show all ${reel.files.length} slides`}
                  </button>

                  {expanded === reel.id && (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: 8,
                        marginTop: 8,
                      }}
                    >
                      {reel.files.map((f) => (
                        <div
                          key={f.name}
                          style={{
                            background: '#000',
                            borderRadius: 6,
                            overflow: 'hidden',
                            aspectRatio: '9/16',
                          }}
                        >
                          {f.type === 'video' ? (
                            <video
                              src={`/reels/${reel.id}/${f.name}`}
                              controls
                              playsInline
                              muted
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                              }}
                            />
                          ) : (
                            <img
                              src={`/reels/${reel.id}/${f.name}`}
                              alt={f.name}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                              }}
                            />
                          )}
                          <p
                            style={{
                              fontSize: 10,
                              color: '#aaa',
                              padding: '4px 6px',
                              background: '#111',
                              textAlign: 'center',
                            }}
                          >
                            {f.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
