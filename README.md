Modern Portfolio (Next.js + Tailwind)

Quick start

Requirements
- Node.js >= 18.17 (recommended: 20). If you use nvm: `nvm use` in this folder.

1) Install deps
   npm install

2) Import and clean your photos (auto-orient + trim borders)
   npm run images

   - Default source: /Users/aidantorrence/Documents/selected
   - Output: public/images/{large,thumbs} + manifest.json

3) Run dev server
   npm run dev
   Open http://localhost:5173

Branding

- Clean editorial layout, large type, strong primary CTA.
- Update copy and accent color in tailwind.config.ts if desired.
