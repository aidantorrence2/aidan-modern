// Layers — jackets, blazers, coats. Worn open over a top or a dress, cut
// ~8px wider than a top's silhouette. See contract.ts.
//
// Every layer is TWO front panels with an open center gap (~x136–164) so the
// garment underneath stays visible. Sleeves follow the documented arm lines,
// a touch wider than a blouse sleeve; lapels and collars fold OVER the panels
// as their own shapes with a fold shadow.

import { type Piece, outline, seam } from './contract'

const PINSTRIPE = '#57534f'

/** Buttons that stay legible on both cream and black cloth. */
const btn = (x: number, y: number, r = 2) => (
  <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill="#211d1a" stroke="rgba(255,255,255,0.35)" strokeWidth="0.8" />
)

export const LAYERS: Piece[] = [
  // ── Single-breasted blazer — notch lapels, one button point, structured shoulders ──
  {
    id: 'sb-blazer',
    kind: 'layer',
    label: 'Single-breasted blazer',
    colorways: [
      { name: 'Black', hex: '#2a2521' },
      { name: 'Charcoal', hex: '#46423e' },
      { name: 'Camel', hex: '#b08a58' },
      { name: 'Pinstripe grey', hex: PINSTRIPE },
      { name: 'Cream', hex: '#e7ddca' },
    ],
    tileBox: '66 114 168 298',
    render: c => (
      <g>
        {/* Sleeves — set in at a structured shoulder, ending just above the wrist */}
        <path d="M99 147 C 85 190, 79 233, 81 270 C 78 316, 76 356, 77 390 L 102 392 C 101 352, 100 312, 101 272 C 104 234, 108 198, 111 158 Z" fill={c} {...outline} />
        <path d="M201 147 C 215 190, 221 233, 219 270 C 222 316, 224 356, 223 390 L 198 392 C 199 352, 200 312, 199 272 C 196 234, 192 198, 189 158 Z" fill={c} {...outline} />
        <path d="M88 200 C 84 254, 82 322, 81 378 M212 200 C 216 254, 218 322, 219 378" {...seam} opacity={0.28} />
        {/* Front panels — worn open, cutaway hem at ~y400 */}
        <path d="M142 132 L 99 146 C 97 185, 98 245, 101 295 C 100 335, 99 368, 100 396 C 111 400, 122 400, 133 395 C 132 340, 133 282, 139 232 C 140 196, 141 162, 142 132 Z" fill={c} {...outline} />
        <path d="M158 132 L 201 146 C 203 185, 202 245, 199 295 C 200 335, 201 368, 200 396 C 189 400, 178 400, 167 395 C 168 340, 167 282, 161 232 C 160 196, 159 162, 158 132 Z" fill={c} {...outline} />
        {/* Pinstripe — only on the striped cloth */}
        {c === PINSTRIPE && (
          <g stroke="rgba(255,255,255,0.30)" strokeWidth="0.9" strokeLinecap="round">
            <path d="M105 160 C 104 240, 104 320, 105 392" fill="none" />
            <path d="M112 154 C 111 238, 111 320, 112 394" fill="none" />
            <path d="M119 150 C 118 236, 118 320, 119 396" fill="none" />
            <path d="M126 149 C 125 234, 125 318, 126 396" fill="none" />
            <path d="M133 240 C 132 296, 132 348, 133 392" fill="none" />
            <path d="M195 160 C 196 240, 196 320, 195 392" fill="none" />
            <path d="M188 154 C 189 238, 189 320, 188 394" fill="none" />
            <path d="M181 150 C 182 236, 182 320, 181 396" fill="none" />
            <path d="M174 149 C 175 234, 175 318, 174 396" fill="none" />
            <path d="M167 240 C 168 296, 168 348, 167 392" fill="none" />
            <path d="M89 190 C 85 250, 84 320, 83 380 M211 190 C 215 250, 216 320, 217 380" fill="none" opacity={0.7} />
          </g>
        )}
        {/* Armhole seams */}
        <path d="M99 150 C 104 162, 106 176, 106 192 M201 150 C 196 162, 194 176, 194 192" {...seam} opacity={0.3} />
        {/* Chest welt + hip flap pockets */}
        <path d="M113 244 L 127 241 M113 248 L 127 245" {...seam} />
        <path d="M104 348 L 128 350 C 128 357, 127 361, 126 362 L 105 360 C 104 357, 104 352, 104 348 Z" fill={c} stroke="#2b2620" strokeWidth="1" opacity="0.9" strokeLinejoin="round" />
        <path d="M196 348 L 172 350 C 172 357, 173 361, 174 362 L 195 360 C 196 357, 196 352, 196 348 Z" fill={c} stroke="#2b2620" strokeWidth="1" opacity="0.9" strokeLinejoin="round" />
        <path d="M105 361 L 126 363 M195 361 L 174 363" stroke="rgba(0,0,0,0.14)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        {/* Notch lapels — collar point above, lapel rolling to the one button point */}
        <path d="M143 132 L 132 149 L 138 154 L 147 139 Z" fill={c} {...outline} strokeWidth={1.3} />
        <path d="M157 132 L 168 149 L 162 154 L 153 139 Z" fill={c} {...outline} strokeWidth={1.3} />
        <path d="M143 132 L 132 149 L 138 154 L 147 139 Z" fill="rgba(255,255,255,0.09)" stroke="none" />
        <path d="M157 132 L 168 149 L 162 154 L 153 139 Z" fill="rgba(255,255,255,0.09)" stroke="none" />
        <path d="M142 133 C 138 148, 132 159, 125 168 C 128 191, 134 212, 139 232 C 140 200, 141 165, 142 133 Z" fill={c} {...outline} strokeWidth={1.3} />
        <path d="M158 133 C 162 148, 168 159, 175 168 C 172 191, 166 212, 161 232 C 160 200, 159 165, 158 133 Z" fill={c} {...outline} strokeWidth={1.3} />
        <path d="M142 133 C 138 148, 132 159, 125 168 C 128 191, 134 212, 139 232 C 140 200, 141 165, 142 133 Z" fill="rgba(255,255,255,0.08)" stroke="none" />
        <path d="M158 133 C 162 148, 168 159, 175 168 C 172 191, 166 212, 161 232 C 160 200, 159 165, 158 133 Z" fill="rgba(255,255,255,0.08)" stroke="none" />
        <path d="M126 170 C 129 192, 134 212, 139 231 M174 170 C 171 192, 166 212, 161 231" stroke="rgba(0,0,0,0.15)" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* One button point — button on the right panel, bound hole on the left */}
        {btn(171, 301, 2.2)}
        <path d="M124 300 L 130 300" {...seam} opacity={0.5} />
        {/* Cuff buttons */}
        {btn(84, 374, 1.5)}
        {btn(85, 381, 1.5)}
        {btn(216, 374, 1.5)}
        {btn(215, 381, 1.5)}
        {/* Drape — front-edge falls, underarm shadows, hem weight */}
        <path d="M136 244 C 134 292, 134 344, 135 388 M164 244 C 166 292, 166 344, 165 388" fill="none" stroke="rgba(0,0,0,0.10)" strokeWidth="3" strokeLinecap="round" />
        <path d="M103 210 C 101 268, 101 330, 102 384 M197 210 C 199 268, 199 330, 198 384" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="3" strokeLinecap="round" />
        <path d="M100 388 C 111 393, 122 393, 133 388 L 133 395 C 122 400, 111 400, 100 396 Z" fill="rgba(0,0,0,0.08)" stroke="none" />
        <path d="M200 388 C 189 393, 178 393, 167 388 L 167 395 C 178 400, 189 400, 200 396 Z" fill="rgba(0,0,0,0.08)" stroke="none" />
        {/* Light — dry wool: soft chest planes, front-edge rim, crisp shoulder line */}
        <path d="M103 172 C 114 176, 125 172, 134 168 L 134 190 C 124 194, 113 198, 104 200 Z" fill="rgba(255,255,255,0.05)" stroke="none" />
        <path d="M197 172 C 186 176, 175 172, 166 168 L 166 190 C 176 194, 187 198, 196 200 Z" fill="rgba(255,255,255,0.05)" stroke="none" />
        <path d="M135 252 C 134 300, 134 350, 135 388 M165 252 C 166 300, 166 350, 165 388" stroke="rgba(255,255,255,0.09)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M102 147 L 136 136 M198 147 L 164 136" stroke="rgba(255,255,255,0.10)" strokeWidth="2" strokeLinecap="round" fill="none" />
      </g>
    ),
  },

  // ── Leather moto jacket — asymmetric zip, wide lapels snapped open, strong sheen ──
  {
    id: 'moto-jacket',
    kind: 'layer',
    label: 'Leather moto jacket',
    colorways: [
      { name: 'Black', hex: '#221f1d' },
      { name: 'Chocolate', hex: '#4e3526' },
      { name: 'Oxblood', hex: '#58242b' },
    ],
    tileBox: '65 114 170 292',
    render: c => (
      <g>
        {/* Sleeves */}
        <path d="M99 148 C 85 190, 78 233, 80 270 C 77 314, 75 354, 76 388 L 103 390 C 102 352, 101 312, 102 272 C 105 234, 109 198, 112 158 Z" fill={c} {...outline} />
        <path d="M201 148 C 215 190, 222 233, 220 270 C 223 314, 225 354, 224 388 L 197 390 C 198 352, 199 312, 198 272 C 195 234, 191 198, 188 158 Z" fill={c} {...outline} />
        {/* Sleeve zips at the cuff */}
        <path d="M86 362 L 91 380 M214 362 L 209 380" stroke="#2b2620" strokeWidth="1.2" opacity="0.5" fill="none" />
        <path d="M86 362 L 91 380 M214 362 L 209 380" stroke="rgba(255,255,255,0.35)" strokeWidth="1" strokeDasharray="1.2 2" fill="none" />
        {/* Elbow crush + leather sleeve sheen */}
        <path d="M95 258 Q 90 266 95 274 M205 258 Q 210 266 205 274" fill="none" stroke="rgba(0,0,0,0.14)" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M88 178 C 84 240, 83 308, 82 368 M212 178 C 216 240, 217 308, 218 368" fill="none" stroke="rgba(255,255,255,0.13)" strokeWidth="2.4" strokeLinecap="round" />
        {/* Front panels — boxy, hem at ~y330 */}
        <path d="M141 132 L 99 147 C 97 185, 98 240, 100 285 C 100 302, 101 318, 102 330 C 112 333, 123 333, 134 330 C 133 294, 134 252, 140 214 C 141 186, 141 158, 141 132 Z" fill={c} {...outline} />
        <path d="M159 132 L 201 147 C 203 185, 202 240, 200 285 C 200 302, 199 318, 198 330 C 188 333, 177 333, 166 330 C 167 294, 166 252, 160 214 C 159 186, 159 158, 159 132 Z" fill={c} {...outline} />
        {/* Panel seams + zip pockets */}
        <path d="M120 216 C 117 254, 116 292, 117 328 M180 216 C 183 254, 184 292, 183 328" {...seam} opacity={0.3} />
        <path d="M167 248 L 183 261 M108 294 L 122 303" stroke="#2b2620" strokeWidth="1.2" opacity="0.5" fill="none" />
        <path d="M167 248 L 183 261 M108 294 L 122 303" stroke="rgba(255,255,255,0.35)" strokeWidth="1" strokeDasharray="1.4 1.6" fill="none" />
        <circle cx="184.5" cy="262.5" r="1.3" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.9" />
        {/* Open zip halves along both front edges */}
        <path d="M137 220 C 135 256, 134 294, 135 328 M163 220 C 165 256, 166 294, 165 328" stroke="#2b2620" strokeWidth="1.1" opacity="0.5" fill="none" />
        <path d="M137 220 C 135 256, 134 294, 135 328 M163 220 C 165 256, 166 294, 165 328" stroke="rgba(255,255,255,0.35)" strokeWidth="1.1" strokeDasharray="1.4 1.6" fill="none" />
        <path d="M135 328 L 133 336" stroke="rgba(255,255,255,0.45)" strokeWidth="1.4" strokeLinecap="round" fill="none" />
        {/* Hem band with side buckle tabs */}
        <path d="M102 318 C 113 322, 124 321, 134 318 M198 318 C 187 322, 176 321, 166 318" {...seam} />
        <rect x="103" y="320" width="7" height="7" fill="none" stroke="#2b2620" strokeWidth="1.1" opacity="0.55" rx="1" />
        <rect x="190" y="320" width="7" height="7" fill="none" stroke="#2b2620" strokeWidth="1.1" opacity="0.55" rx="1" />
        {/* Wide lapels snapped open — the facing catches the light */}
        <path d="M142 133 C 134 148, 125 166, 117 184 C 124 194, 132 204, 140 214 C 141 186, 141 158, 142 133 Z" fill={c} {...outline} strokeWidth={1.4} />
        <path d="M158 133 C 166 148, 175 166, 183 184 C 176 194, 168 204, 160 214 C 159 186, 159 158, 158 133 Z" fill={c} {...outline} strokeWidth={1.4} />
        <path d="M142 133 C 134 148, 125 166, 117 184 C 124 194, 132 204, 140 214 C 141 186, 141 158, 142 133 Z" fill="rgba(255,255,255,0.09)" stroke="none" />
        <path d="M158 133 C 166 148, 175 166, 183 184 C 176 194, 168 204, 160 214 C 159 186, 159 158, 158 133 Z" fill="rgba(255,255,255,0.09)" stroke="none" />
        <path d="M119 187 C 126 196, 133 205, 139 213 M181 187 C 174 196, 167 205, 161 213" stroke="rgba(0,0,0,0.18)" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        <path d="M138 141 C 132 153, 126 166, 121 178 M162 141 C 168 153, 174 166, 179 178" fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="121" cy="184" r="1.7" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="1" />
        <circle cx="179" cy="184" r="1.7" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="1" />
        {/* Drape + hem shadow */}
        <path d="M104 212 C 102 252, 102 292, 103 326 M196 212 C 198 252, 198 292, 197 326" fill="none" stroke="rgba(0,0,0,0.11)" strokeWidth="3" strokeLinecap="round" />
        <path d="M102 322 C 113 326, 124 325, 134 322 L 134 330 C 123 333, 112 333, 102 330 Z" fill="rgba(0,0,0,0.13)" stroke="none" />
        <path d="M198 322 C 187 326, 176 325, 166 322 L 166 330 C 177 333, 188 333, 198 330 Z" fill="rgba(0,0,0,0.13)" stroke="none" />
        {/* Sheen — leather takes hard, narrow streaks of light */}
        <path d="M107 224 C 105 254, 105 288, 106 318 M193 224 C 195 254, 195 288, 194 318" fill="none" stroke="rgba(255,255,255,0.13)" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M113 232 L 128 224 M187 232 L 172 224 M112 262 L 124 256 M188 262 L 176 256" fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="2" strokeLinecap="round" />
        <path d="M136 226 C 135 260, 134 296, 135 324 M164 226 C 165 260, 166 296, 165 324" fill="none" stroke="rgba(255,255,255,0.11)" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M103 320 C 113 324, 124 323, 133 320 M197 320 C 187 324, 176 323, 167 320" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.4" strokeLinecap="round" />
      </g>
    ),
  },

  // ── Denim jacket — shirt collar, button placket, chest flap pockets ──
  {
    id: 'denim-jacket',
    kind: 'layer',
    label: 'Denim jacket',
    colorways: [
      { name: 'Mid wash', hex: '#64789a' },
      { name: 'Light wash', hex: '#93a7bd' },
      { name: 'Washed black', hex: '#2e2b28' },
      { name: 'Ecru', hex: '#cfc7b4' },
    ],
    tileBox: '68 114 164 292',
    render: c => (
      <g>
        {/* Sleeves with buttoned cuffs */}
        <path d="M100 148 C 87 190, 82 233, 84 270 C 81 310, 79 344, 80 364 L 103 366 C 102 336, 101 306, 102 272 C 105 234, 109 198, 112 158 Z" fill={c} {...outline} />
        <path d="M200 148 C 213 190, 218 233, 216 270 C 219 310, 221 344, 220 364 L 197 366 C 198 336, 199 306, 198 272 C 195 234, 191 198, 188 158 Z" fill={c} {...outline} />
        <path d="M80 364 L 103 366 L 102 388 L 79 386 Z" fill={c} {...outline} />
        <path d="M220 364 L 197 366 L 198 388 L 221 386 Z" fill={c} {...outline} />
        <path d="M80 370 L 102 372 M220 370 L 198 372" {...seam} />
        {btn(85, 379, 1.6)}
        {btn(215, 379, 1.6)}
        <path d="M90 200 C 86 248, 85 306, 83 358 M210 200 C 214 248, 215 306, 217 358" {...seam} opacity={0.3} />
        {/* Front panels — boxy, over a buttoned waistband at ~y320 */}
        <path d="M141 132 L 100 147 C 98 185, 99 240, 100 285 L 101 306 L 136 306 C 137 258, 138 208, 140 160 L 141 132 Z" fill={c} {...outline} />
        <path d="M159 132 L 200 147 C 202 185, 201 240, 200 285 L 199 306 L 164 306 C 163 258, 162 208, 160 160 L 159 132 Z" fill={c} {...outline} />
        <path d="M101 306 L 136 306 L 136 320 L 102 320 Z" fill={c} {...outline} />
        <path d="M199 306 L 164 306 L 164 320 L 198 320 Z" fill={c} {...outline} />
        <path d="M102 316 L 136 316 M198 316 L 164 316" {...seam} />
        {btn(132, 313, 1.8)}
        {btn(168, 313, 1.8)}
        {/* Vertical panel seams through the chest */}
        <path d="M112 170 C 111 190, 110 208, 109 226 M188 170 C 189 190, 190 208, 191 226 M114 252 C 113 272, 112 290, 112 306 M186 252 C 187 272, 188 290, 188 306" {...seam} opacity={0.35} />
        {/* Chest flap pockets — pointed flaps, buttoned */}
        <path d="M108 224 L 132 226 M192 224 L 168 226" {...seam} />
        <path d="M108 226 L 132 228 L 131 240 L 120 246 L 107 238 Z" fill={c} stroke="#2b2620" strokeWidth="1" opacity="0.9" strokeLinejoin="round" />
        <path d="M192 226 L 168 228 L 169 240 L 180 246 L 193 238 Z" fill={c} stroke="#2b2620" strokeWidth="1" opacity="0.9" strokeLinejoin="round" />
        <path d="M108 239 L 120 246 L 131 241 M192 239 L 180 246 L 169 241" stroke="rgba(0,0,0,0.13)" strokeWidth="1.4" strokeLinecap="round" fill="none" />
        {btn(119.5, 240, 1.5)}
        {btn(180.5, 240, 1.5)}
        {/* Button placket on the left front, holes on the right */}
        <path d="M145 163 C 143 214, 142 262, 142 305" {...seam} />
        {btn(139.5, 180, 1.7)}
        {btn(139, 218, 1.7)}
        {btn(138.5, 256, 1.7)}
        {btn(138, 294, 1.7)}
        <path d="M161 180 L 165 180 M161.5 218 L 165.5 218 M162 256 L 166 256 M162.5 294 L 166.5 294" {...seam} opacity={0.5} />
        {/* Shirt collar */}
        <path d="M141 132 L 129 152 L 140 157 L 148 143 Z" fill={c} {...outline} strokeWidth={1.3} />
        <path d="M159 132 L 171 152 L 160 157 L 152 143 Z" fill={c} {...outline} strokeWidth={1.3} />
        <path d="M131 153 L 139 156 M169 153 L 161 156" stroke="rgba(0,0,0,0.15)" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        {/* Drape + hem shadow */}
        <path d="M104 214 C 102 248, 102 280, 103 304 M196 214 C 198 248, 198 280, 197 304 M137 232 C 136 258, 136 284, 136 304 M163 232 C 164 258, 164 284, 164 304" fill="none" stroke="rgba(0,0,0,0.09)" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M102 314 L 136 314 L 136 320 L 102 320 Z M198 314 L 164 314 L 164 320 L 198 320 Z" fill="rgba(0,0,0,0.08)" stroke="none" />
        {/* Wash — lifted chest panels and sleeve, denim's faded planes */}
        <path d="M104 180 C 102 220, 102 258, 103 300 L 116 300 C 114 258, 114 220, 116 182 Z" fill="rgba(255,255,255,0.10)" stroke="none" />
        <path d="M196 180 C 198 220, 198 258, 197 300 L 184 300 C 186 258, 186 220, 184 182 Z" fill="rgba(255,255,255,0.10)" stroke="none" />
        <path d="M88 190 C 85 240, 84 300, 84 356 M212 190 C 215 240, 216 300, 216 356" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2.6" strokeLinecap="round" />
      </g>
    ),
  },

  // ── Trench coat — storm flap, undone belt, epaulets, knee-length ──
  {
    id: 'trench-coat',
    kind: 'layer',
    label: 'Trench coat',
    colorways: [
      { name: 'Classic tan', hex: '#c2a476' },
      { name: 'Black', hex: '#2a2622' },
      { name: 'Stone', hex: '#d8d0bd' },
      { name: 'Navy', hex: '#2e3a52' },
    ],
    tileBox: '65 112 170 462',
    render: c => (
      <g>
        {/* Sleeves with cuff straps */}
        <path d="M98 146 C 85 190, 79 233, 81 270 C 78 316, 75 356, 76 392 L 103 394 C 102 354, 101 312, 102 272 C 105 234, 109 198, 112 158 Z" fill={c} {...outline} />
        <path d="M202 146 C 215 190, 221 233, 219 270 C 222 316, 225 356, 224 392 L 197 394 C 198 354, 199 312, 198 272 C 195 234, 191 198, 188 158 Z" fill={c} {...outline} />
        <path d="M78 364 L 102 366 M78 372 L 102 374 M222 364 L 198 366 M222 372 L 198 374" {...seam} />
        <rect x="86" y="363" width="6" height="10" fill="none" stroke="#2b2620" strokeWidth="1" opacity="0.5" rx="1" />
        <rect x="208" y="363" width="6" height="10" fill="none" stroke="#2b2620" strokeWidth="1" opacity="0.5" rx="1" />
        <path d="M88 200 C 84 256, 82 324, 81 380 M212 200 C 216 256, 218 324, 219 380" {...seam} opacity={0.25} />
        {/* Front panels — falling open to the knee, ~y560 */}
        <path d="M142 132 L 98 146 C 96 185, 97 245, 100 298 C 100 380, 99 470, 101 556 C 112 561, 122 561, 132 557 C 131 460, 132 372, 134 300 C 135 282, 137 264, 139 248 C 140 208, 141 168, 142 132 Z" fill={c} {...outline} />
        <path d="M158 132 L 202 146 C 204 185, 203 245, 200 298 C 200 380, 201 470, 199 556 C 188 561, 178 561, 168 557 C 169 460, 168 372, 166 300 C 165 282, 163 264, 161 248 C 160 208, 159 168, 158 132 Z" fill={c} {...outline} />
        {/* Armhole seams */}
        <path d="M98 150 C 103 162, 105 176, 105 192 M202 150 C 197 162, 195 176, 195 192" {...seam} opacity={0.3} />
        {/* Storm flap over the left chest — tucks under the lapel */}
        <path d="M98 152 C 110 160, 124 166, 136 168 C 136 186, 136 202, 136 214 C 122 212, 108 202, 97 190 Z" fill={c} stroke="#2b2620" strokeWidth="1" opacity="0.9" strokeLinejoin="round" />
        <path d="M97 191 C 108 203, 122 212, 136 214" stroke="rgba(0,0,0,0.12)" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Epaulets */}
        <path d="M103 145 L 121 140 L 122 144 L 104 149 Z" fill={c} stroke="#2b2620" strokeWidth="1" opacity="0.9" strokeLinejoin="round" />
        <path d="M197 145 L 179 140 L 178 144 L 196 149 Z" fill={c} stroke="#2b2620" strokeWidth="1" opacity="0.9" strokeLinejoin="round" />
        {btn(118, 142.5, 1.4)}
        {btn(182, 142.5, 1.4)}
        {/* Double-breasted button columns */}
        {btn(127, 262)}
        {btn(126, 336)}
        {btn(173, 262)}
        {btn(174, 336)}
        {/* Belt — worn undone: buckled on the left, tail dropped through it */}
        <path d="M99 296 L 134 298 L 134 312 L 99 310 Z" fill={c} {...outline} strokeWidth={1.3} />
        <path d="M201 296 L 166 298 L 166 312 L 201 310 Z" fill={c} {...outline} strokeWidth={1.3} />
        <path d="M126 313 C 127 327, 129 340, 131 352 L 139 350 C 137 338, 136 326, 135 313 Z" fill={c} {...outline} strokeWidth={1.3} />
        <rect x="125" y="295" width="11" height="19" fill="none" stroke="#2b2620" strokeWidth="1.3" opacity="0.6" rx="1.5" />
        <path d="M130.5 297 L 130.5 312" stroke="#2b2620" strokeWidth="1" opacity="0.5" fill="none" />
        <path d="M104 293 L 105 314 M196 293 L 195 314" {...seam} opacity={0.35} />
        <path d="M100 312 L 134 314 M200 312 L 166 314" stroke="rgba(0,0,0,0.11)" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Trench lapels + collar */}
        <path d="M143 132 L 131 150 L 137 155 L 147 140 Z" fill={c} {...outline} strokeWidth={1.3} />
        <path d="M157 132 L 169 150 L 163 155 L 153 140 Z" fill={c} {...outline} strokeWidth={1.3} />
        <path d="M142 133 C 136 150, 129 162, 122 172 C 127 198, 133 224, 139 248 C 140 210, 141 170, 142 133 Z" fill={c} {...outline} strokeWidth={1.3} />
        <path d="M158 133 C 164 150, 171 162, 178 172 C 173 198, 167 224, 161 248 C 160 210, 159 170, 158 133 Z" fill={c} {...outline} strokeWidth={1.3} />
        <path d="M142 133 C 136 150, 129 162, 122 172 C 127 198, 133 224, 139 248 C 140 210, 141 170, 142 133 Z" fill="rgba(255,255,255,0.08)" stroke="none" />
        <path d="M158 133 C 164 150, 171 162, 178 172 C 173 198, 167 224, 161 248 C 160 210, 159 170, 158 133 Z" fill="rgba(255,255,255,0.08)" stroke="none" />
        <path d="M123 174 C 128 199, 133 224, 139 247 M177 174 C 172 199, 167 224, 161 247" stroke="rgba(0,0,0,0.14)" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Drape — long falls through the skirt, hem weight */}
        <path d="M112 330 C 110 402, 110 472, 112 542 M188 330 C 190 402, 190 472, 188 542" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="3.2" strokeLinecap="round" />
        <path d="M135 320 C 133 400, 132 476, 133 548 M165 320 C 167 400, 168 476, 167 548" fill="none" stroke="rgba(0,0,0,0.09)" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M101 546 C 112 551, 122 551, 132 548 L 132 557 C 122 561, 112 561, 101 556 Z" fill="rgba(0,0,0,0.07)" stroke="none" />
        <path d="M199 546 C 188 551, 178 551, 168 548 L 168 557 C 178 561, 188 561, 199 556 Z" fill="rgba(0,0,0,0.07)" stroke="none" />
        {/* Light — gabardine's dry, even sheen */}
        <path d="M104 210 C 102 320, 102 430, 104 534 L 116 536 C 113 430, 113 320, 116 214 Z" fill="rgba(255,255,255,0.07)" stroke="none" />
        <path d="M99 297 L 133 299 M201 297 L 167 299" stroke="rgba(255,255,255,0.12)" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      </g>
    ),
  },

  // ── Long wool coat — clean minimal, dropped shoulders, calf-length ──
  {
    id: 'wool-coat',
    kind: 'layer',
    label: 'Long wool coat',
    colorways: [
      { name: 'Camel', hex: '#b3865a' },
      { name: 'Black', hex: '#282420' },
      { name: 'Grey melange', hex: '#8e8a84' },
      { name: 'Burgundy', hex: '#5d2b33' },
      { name: 'Cream', hex: '#e9e0cf' },
    ],
    tileBox: '64 110 172 522',
    render: c => (
      <g>
        {/* Sleeves — set low off a dropped shoulder */}
        <path d="M92 153 C 83 195, 78 238, 80 272 C 77 318, 74 358, 75 392 L 103 394 C 102 354, 101 312, 102 272 C 103 240, 101 224, 99 212 Z" fill={c} {...outline} />
        <path d="M208 153 C 217 195, 222 238, 220 272 C 223 318, 226 358, 225 392 L 197 394 C 198 354, 199 312, 198 272 C 197 240, 199 224, 201 212 Z" fill={c} {...outline} />
        <path d="M87 210 C 83 268, 81 332, 80 384 M213 210 C 217 268, 219 332, 220 384" {...seam} opacity={0.25} />
        {/* Front panels — one clean column to ~y620 */}
        <path d="M143 131 L 92 153 C 94 184, 97 202, 99 212 C 98 280, 97 350, 98 420 C 98 500, 99 560, 101 614 C 111 619, 122 619, 132 616 C 131 500, 132 390, 134 302 C 136 284, 138 272, 141 262 C 142 218, 142 174, 143 131 Z" fill={c} {...outline} />
        <path d="M157 131 L 208 153 C 206 184, 203 202, 201 212 C 202 280, 203 350, 202 420 C 202 500, 201 560, 199 614 C 189 619, 178 619, 168 616 C 169 500, 168 390, 166 302 C 164 284, 162 272, 159 262 C 158 218, 158 174, 157 131 Z" fill={c} {...outline} />
        {/* Dropped-shoulder seam */}
        <path d="M93 155 C 96 182, 98 200, 99 211 M207 155 C 204 182, 202 200, 201 211" {...seam} opacity={0.35} />
        {/* Slim shawl-roll lapels */}
        <path d="M143 132 C 139 158, 136 180, 134 200 C 134 222, 137 244, 141 262 C 142 218, 142 174, 143 132 Z" fill={c} {...outline} strokeWidth={1.3} />
        <path d="M157 132 C 161 158, 164 180, 166 200 C 166 222, 163 244, 159 262 C 158 218, 158 174, 157 132 Z" fill={c} {...outline} strokeWidth={1.3} />
        <path d="M143 132 C 139 158, 136 180, 134 200 C 134 222, 137 244, 141 262 C 142 218, 142 174, 143 132 Z" fill="rgba(255,255,255,0.07)" stroke="none" />
        <path d="M157 132 C 161 158, 164 180, 166 200 C 166 222, 163 244, 159 262 C 158 218, 158 174, 157 132 Z" fill="rgba(255,255,255,0.07)" stroke="none" />
        <path d="M135 202 C 135 224, 138 244, 141 261 M165 202 C 165 224, 162 244, 159 261" stroke="rgba(0,0,0,0.13)" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Slanted welt pockets + princess seams */}
        <path d="M109 428 L 117 460 M111 427 L 119 459 M191 428 L 183 460 M189 427 L 181 459" {...seam} />
        <path d="M116 190 C 114 300, 114 440, 116 596 M184 190 C 186 300, 186 440, 184 596" {...seam} opacity={0.22} />
        {/* Drape — few, long, quiet */}
        <path d="M104 340 C 102 440, 103 540, 105 604 M196 340 C 198 440, 197 540, 195 604" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="3.4" strokeLinecap="round" />
        <path d="M134 312 C 132 420, 131 520, 132 608 M166 312 C 168 420, 169 520, 168 608" fill="none" stroke="rgba(0,0,0,0.09)" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M101 604 C 111 609, 122 609, 132 606 L 132 616 C 122 619, 111 619, 101 614 Z" fill="rgba(0,0,0,0.07)" stroke="none" />
        <path d="M199 604 C 189 609, 178 609, 168 606 L 168 616 C 178 619, 189 619, 199 614 Z" fill="rgba(0,0,0,0.07)" stroke="none" />
        {/* Light — broad matte pass, nothing shiny */}
        <path d="M108 230 C 106 350, 106 480, 108 598 L 123 600 C 120 480, 120 352, 122 234 Z" fill="rgba(255,255,255,0.05)" stroke="none" />
        <path d="M178 230 C 180 350, 180 470, 179 590" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="3" strokeLinecap="round" />
      </g>
    ),
  },

  // ── Knit duster cardigan — soft open drape, ribbed edges ──
  {
    id: 'duster-cardigan',
    kind: 'layer',
    label: 'Knit duster cardigan',
    colorways: [
      { name: 'Oatmeal', hex: '#d8ccb6' },
      { name: 'Charcoal', hex: '#45403b' },
      { name: 'Rust', hex: '#a55f38' },
      { name: 'Sage', hex: '#98a289' },
    ],
    tileBox: '65 114 170 480',
    render: c => (
      <g>
        {/* Sleeves — soft, roomy, ribbed cuffs */}
        <path d="M94 155 C 84 196, 80 238, 82 272 C 79 316, 76 356, 77 390 L 103 392 C 102 354, 101 312, 102 272 C 103 242, 102 226, 100 214 Z" fill={c} {...outline} />
        <path d="M206 155 C 216 196, 220 238, 218 272 C 221 316, 224 356, 223 390 L 197 392 C 198 354, 199 312, 198 272 C 197 242, 198 226, 200 214 Z" fill={c} {...outline} />
        <path d="M78 368 L 102 370 M222 368 L 198 370" {...seam} />
        <path d="M81 372 L 80 388 M86 373 L 85 389 M91 373.5 L 90 390 M96 374 L 95 390 M219 372 L 220 388 M214 373 L 215 389 M209 373.5 L 210 390 M204 374 L 205 390" stroke="#2b2620" strokeWidth="0.9" opacity="0.28" fill="none" />
        {/* Front panels — heavy knit falling straight open to ~y575 */}
        <path d="M142 133 L 94 155 C 96 187, 98 204, 100 214 C 98 280, 97 350, 98 420 C 98 490, 99 545, 101 574 C 111 579, 121 578, 131 574 C 129 520, 128 460, 128 400 C 128 300, 132 200, 142 133 Z" fill={c} {...outline} />
        <path d="M158 133 L 206 155 C 204 187, 202 204, 200 214 C 202 280, 203 350, 202 420 C 202 490, 201 545, 199 574 C 189 579, 179 578, 169 574 C 171 520, 172 460, 172 400 C 172 300, 168 200, 158 133 Z" fill={c} {...outline} />
        {/* Soft shoulder seam */}
        <path d="M95 157 C 97 185, 99 204, 100 213 M205 157 C 203 185, 201 204, 200 213" {...seam} opacity={0.3} />
        {/* Ribbed front bands — folded edges, grooves running with the band */}
        <path d="M146 139 C 137 208, 133 306, 134 402 C 134 470, 135 528, 137 570 M154 139 C 163 208, 167 306, 166 402 C 166 470, 165 528, 163 570" {...seam} opacity={0.35} />
        <path d="M137 172 C 132 264, 130 356, 130 440 C 130 490, 131 534, 132 570 M163 172 C 168 264, 170 356, 170 440 C 170 490, 169 534, 168 570" stroke="#2b2620" strokeWidth="1" opacity="0.3" strokeLinecap="round" fill="none" />
        <path d="M141 158 C 134 240, 132 330, 132 420 C 132 478, 133 528, 134 570 M159 158 C 166 240, 168 330, 168 420 C 168 478, 167 528, 166 570" stroke="#2b2620" strokeWidth="1" opacity="0.2" strokeLinecap="round" fill="none" />
        {/* Fold shadow inside the open drape */}
        <path d="M133 220 C 130 320, 129 430, 131 560 M167 220 C 170 320, 171 430, 169 560" fill="none" stroke="rgba(0,0,0,0.10)" strokeWidth="3" strokeLinecap="round" />
        {/* Patch pockets with ribbed tops */}
        <path d="M105 440 L 128 442 L 127 480 L 104 478 Z" fill={c} stroke="#2b2620" strokeWidth="1" opacity="0.85" strokeLinejoin="round" />
        <path d="M195 440 L 172 442 L 173 480 L 196 478 Z" fill={c} stroke="#2b2620" strokeWidth="1" opacity="0.85" strokeLinejoin="round" />
        <path d="M105 446 L 128 448 M195 446 L 172 448" {...seam} opacity={0.3} />
        {/* Knit texture — sparse vertical ribs */}
        <path d="M110 200 C 108 320, 108 440, 110 566 M120 190 C 118 320, 118 450, 120 570 M190 200 C 192 320, 192 440, 190 566 M180 190 C 182 320, 182 450, 180 570" fill="none" stroke="#2b2620" strokeWidth="1.4" opacity="0.07" strokeLinecap="round" />
        {/* Ribbed hem — vertical knit ticks below a seam */}
        <path d="M101 564 C 111 569, 121 568, 131 564 M199 564 C 189 569, 179 568, 169 564" {...seam} opacity={0.3} />
        <path d="M105 566.5 L 105 575 M110 568 L 110 576.5 M115 568.8 L 115 577 M120 569 L 120 577 M125 568 L 125 576 M195 566.5 L 195 575 M190 568 L 190 576.5 M185 568.8 L 185 577 M180 569 L 180 577 M175 568 L 175 576" stroke="#2b2620" strokeWidth="0.9" opacity="0.26" fill="none" />
        {/* Drape + hem shadow */}
        <path d="M102 230 C 100 330, 100 450, 102 556 M198 230 C 200 330, 200 450, 198 556 M116 480 C 115 515, 115 545, 116 570 M184 480 C 185 515, 185 545, 184 570" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="3" strokeLinecap="round" />
        <path d="M101 566 C 111 572, 121 571, 131 567 L 131 574 C 121 578, 111 579, 101 574 Z" fill="rgba(0,0,0,0.08)" stroke="none" />
        <path d="M199 566 C 189 572, 179 571, 169 567 L 169 574 C 179 578, 189 579, 199 574 Z" fill="rgba(0,0,0,0.08)" stroke="none" />
        {/* Light — soft matte wool */}
        <path d="M107 240 C 105 340, 105 460, 107 560 L 120 562 C 117 460, 117 344, 119 244 Z" fill="rgba(255,255,255,0.05)" stroke="none" />
      </g>
    ),
  },
]
