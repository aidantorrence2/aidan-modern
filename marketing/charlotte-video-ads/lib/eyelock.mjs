// Eye-locked cuts with FULL-FRAME photos (Aidan, 20 Oct: "like the eyes one, except full frame photos").
// d-eyes scales every face to the same size, which crops to tight faces. Here each photo stays cover-fit (whole frame,
// minimal crop) and only shifts — zooming in just enough, up to maxZ — so the midpoint between the eyes lands on the
// same screen point (X0, Y0) on every cut. Where even maxZ can't reach, the photo is clamped (eyes land close by).
export function eyeLock(a, { W = 1080, H = 1920, X0 = W / 2, Y0 = H * 0.4, maxZ = 1.4 } = {}) {
  const f = a.face
  if (!f?.le || !f?.re) return { k: Math.max(W / a.w, H / a.h), x: 0, y: 0, ex: a.w / 2, ey: a.h / 2, z: 1 }
  const ex = (f.le[0] + f.re[0]) / 2, ey = (f.le[1] + f.re[1]) / 2
  const k0 = Math.max(W / a.w, H / a.h)
  const fits = k => { const x = X0 - ex * k, y = Y0 - ey * k; return x <= 0 && x >= W - a.w * k && y <= 0 && y >= H - a.h * k }
  let z = 1
  while (z < maxZ && !fits(k0 * z)) z += 0.01
  const k = k0 * z
  const x = Math.min(0, Math.max(W - a.w * k, X0 - ex * k)), y = Math.min(0, Math.max(H - a.h * k, Y0 - ey * k))
  return { k, x, y, ex, ey, z: +z.toFixed(2) }
}

// Motor-drive timing: n cuts whose lengths shrink from `first` to `last` seconds (ease-in), returns start times from t0.
export function motorDrive(n, t0, { first = 0.55, last = 0.13 } = {}) {
  const starts = []; let t = t0
  for (let i = 0; i < n; i++) { starts.push(+t.toFixed(4)); const p = n > 1 ? i / (n - 1) : 1; t += first + (last - first) * (p * p) }
  return { starts, end: +t.toFixed(4) }
}

// page-side: place a layer for an eyeLock result, with a gentle push about the locked eye point (eyes never move)
export const EYE_PUT = `function eyePut(el,L,push,W=${1080},H=${1920}){
  const k=L.k*push, x=Math.min(0,Math.max(W-L.w*k, L.X0-L.ex*k)), y=Math.min(0,Math.max(H-L.h*k, L.Y0-L.ey*k));
  el.style.transform='translate('+x+'px,'+y+'px) scale('+k+')'}`
