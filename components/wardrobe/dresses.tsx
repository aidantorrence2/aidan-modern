// Dresses. A dress replaces top + bottom on the model. The slip dress is the
// exemplar: cowl drape, bias folds, a sheen pass, evening-fabric colorways.

import { type Piece, outline, seam } from './contract'

export const DRESSES: Piece[] = [
  {
    id: 'slip-dress',
    kind: 'dress',
    label: 'Slip dress',
    colorways: [
      { name: 'Champagne', hex: '#d8c3ad' },
      { name: 'Black', hex: '#26211d' },
      { name: 'Oxblood', hex: '#5c2430' },
      { name: 'Sage', hex: '#9aa48a' },
      { name: 'Ivory', hex: '#eae1d2' },
      { name: 'Gunmetal', hex: '#6b6f78' },
    ],
    tileBox: '62 130 176 540',
    render: c => (
      <g>
        {/* Straps */}
        <path d="M112 152 L 122 180 M188 152 L 178 180" fill="none" stroke="#2b2620" strokeWidth="2.6" strokeLinecap="round" />
        {/* Body — bias cut: fitted bust, skims the hip, eases to a midi hem */}
        <path d="M122 180 C 116 224, 118 262, 121 300 C 109 340, 105 380, 107 424 C 109 504, 113 584, 117 648 C 139 656, 161 656, 183 648 C 187 584, 191 504, 193 424 C 195 380, 191 340, 179 300 C 182 262, 184 224, 178 180 C 160 196, 140 196, 122 180 Z" fill={c} {...outline} />
        {/* Cowl neckline — nested drape arcs */}
        <path d="M122 180 C 136 194, 164 194, 178 180" fill="none" {...outline} strokeWidth={1.4} />
        <path d="M128 184 C 140 202, 160 202, 172 184 M135 188 C 143 208, 157 208, 165 188" {...seam} />
        {/* Bias drape — long soft folds */}
        <path d="M132 240 C 128 330, 127 440, 129 560 M150 250 C 149 340, 149 460, 150 580 M168 240 C 172 330, 173 440, 171 560" fill="none" stroke="rgba(0,0,0,0.09)" strokeWidth="3" strokeLinecap="round" />
        {/* Hip shadow + hem weight */}
        <path d="M110 380 C 112 430, 114 480, 116 520 L 126 520 C 123 478, 121 428, 121 384 Z" fill="rgba(0,0,0,0.08)" stroke="none" />
        <path d="M117 636 C 139 645, 161 645, 183 636 L 183 648 C 161 656, 139 656, 117 648 Z" fill="rgba(0,0,0,0.10)" stroke="none" />
        {/* Sheen — one vertical satin light pass */}
        <path d="M138 210 C 134 320, 134 460, 137 600 L 148 602 C 146 460, 146 320, 149 212 Z" fill="rgba(255,255,255,0.11)" stroke="none" />
      </g>
    ),
  },
  {
    id: 'sundress',
    kind: 'dress',
    label: 'Sundress',
    colorways: [
      { name: 'White', hex: '#f4efe5' },
      { name: 'Butter', hex: '#ecd9a2' },
      { name: 'Sky', hex: '#aec8da' },
      { name: 'Blush', hex: '#e8c8c1' },
      { name: 'Picnic', hex: '#c2d6d2' },
    ],
    tileBox: '75 140 150 445',
    render: c => (
      <g>
        {/* Straps — wide fabric straps, tops riding the shoulder contour */}
        <path d="M110 146 L 118 142 L 127 189 L 117 191 Z" fill={c} {...outline} strokeWidth={1.4} />
        <path d="M190 146 L 182 142 L 173 189 L 183 191 Z" fill={c} {...outline} strokeWidth={1.4} />
        {/* Fitted bodice — scooped neckline, darts, waist seam */}
        <path d="M119 188 C 114 220, 114 254, 118 300 L 182 300 C 186 254, 186 220, 181 188 C 162 200, 138 200, 119 188 Z" fill={c} {...outline} />
        <path d="M119 188 C 138 200, 162 200, 181 188" fill="none" {...outline} strokeWidth={1.3} />
        <path d="M137 230 L 135 296 M163 230 L 165 296" {...seam} />
        {/* Flared skirt, hem swings just above the knee */}
        <path d="M117 300 C 106 348, 96 412, 90 466 C 86 512, 85 542, 87 558 C 128 572, 172 572, 213 558 C 215 542, 214 512, 210 466 C 204 412, 194 348, 183 300 Z" fill={c} {...outline} />
        {/* Waist seam + gathers into the skirt */}
        <path d="M118 300 L 182 300 M119 305 L 181 305" {...seam} />
        <path d="M128 308 L 126 320 M139 309 L 138 321 M150 310 L 150 322 M161 309 L 162 321 M172 308 L 174 320" {...seam} opacity="0.32" />
        {/* Skirt volume — radiating folds */}
        <path d="M132 320 C 124 392, 116 470, 110 548 M150 322 C 149 400, 148 480, 149 562 M168 320 C 176 392, 184 470, 190 548" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="3" strokeLinecap="round" />
        {/* Bodice side folds + hem weight */}
        <path d="M126 210 C 123 244, 123 272, 125 296 M174 210 C 177 244, 177 272, 175 296" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M88 546 C 128 560, 172 560, 212 546 L 213 558 C 172 572, 128 572, 87 558 Z" fill="rgba(0,0,0,0.09)" stroke="none" />
        {/* Light pass — crisp cotton */}
        <path d="M124 330 C 116 400, 110 470, 106 540 L 122 544 C 124 474, 128 402, 134 334 Z" fill="rgba(255,255,255,0.10)" stroke="none" />
        <path d="M132 200 C 130 232, 130 264, 132 294 L 142 294 C 140 262, 140 230, 142 202 Z" fill="rgba(255,255,255,0.08)" stroke="none" />
      </g>
    ),
  },
  {
    id: 'wrap-dress',
    kind: 'dress',
    label: 'Wrap dress',
    colorways: [
      { name: 'Terracotta', hex: '#ae5a40' },
      { name: 'Navy', hex: '#2e3a51' },
      { name: 'Olive', hex: '#6f6a45' },
      { name: 'Black', hex: '#26221e' },
      { name: 'Wine', hex: '#5e2634' },
    ],
    tileBox: '86 140 128 480',
    render: c => (
      <g>
        {/* Body — deep V surplice, eased skirt to a below-knee hem */}
        <path d="M104 150 C 110 145, 116 142, 122 140 L 151 258 L 180 140 C 186 142, 192 145, 196 150 C 196 204, 190 256, 181 300 C 193 338, 199 366, 201 404 C 204 472, 202 542, 196 598 C 166 608, 134 608, 104 598 C 98 542, 96 472, 99 404 C 101 366, 107 338, 119 300 C 114 256, 104 204, 104 150 Z" fill={c} {...outline} />
        {/* V facings + crossover seam running to the tie */}
        <path d="M125 145 L 149 250 M177 145 L 153 250" {...seam} />
        <path d="M151 258 C 141 276, 132 290, 125 300" {...seam} opacity="0.5" />
        {/* Wrap overlap edge crossing the skirt */}
        <path d="M126 306 C 143 380, 158 478, 167 596" {...seam} opacity="0.45" />
        <path d="M129 310 C 146 384, 161 480, 170 594" fill="none" stroke="rgba(0,0,0,0.10)" strokeWidth="3" strokeLinecap="round" />
        {/* Folds radiating from the tie point */}
        <path d="M128 312 C 148 344, 164 386, 173 434 M127 320 C 143 358, 154 402, 160 452 M138 200 C 136 224, 133 244, 130 262" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="2.5" strokeLinecap="round" />
        {/* Hem weight */}
        <path d="M105 588 C 135 598, 165 598, 195 588 L 196 598 C 166 608, 134 608, 104 598 Z" fill="rgba(0,0,0,0.09)" stroke="none" />
        {/* Waist tie — knot at the left waist, two hanging ends */}
        <path d="M115 309 C 111 334, 110 360, 113 390 L 121 389 C 119 360, 119 336, 122 310 Z" fill={c} {...outline} strokeWidth={1.4} />
        <path d="M122 310 C 122 338, 125 366, 130 398 L 138 395 C 133 364, 130 338, 129 309 Z" fill={c} {...outline} strokeWidth={1.4} />
        <path d="M117 296 C 113 297, 111 302, 113 307 C 116 311, 122 311, 125 307 C 127 302, 125 297, 121 296 Z" fill={c} {...outline} strokeWidth={1.4} />
        <path d="M116 330 C 115 350, 115 368, 116 384 M126 332 C 128 352, 130 370, 133 390" fill="none" stroke="rgba(0,0,0,0.10)" strokeWidth="1.6" strokeLinecap="round" />
        {/* Light — matte jersey pass on the top wrap panel and skirt */}
        <path d="M116 196 C 121 214, 127 232, 132 250 L 139 246 C 133 228, 127 210, 121 192 Z" fill="rgba(255,255,255,0.07)" stroke="none" />
        <path d="M152 342 C 150 430, 150 510, 152 586 L 164 586 C 163 508, 163 428, 164 344 Z" fill="rgba(255,255,255,0.07)" stroke="none" />
      </g>
    ),
  },
  {
    id: 'bodycon-midi',
    kind: 'dress',
    label: 'Bodycon midi',
    colorways: [
      { name: 'Black', hex: '#221f1c' },
      { name: 'Chocolate', hex: '#4a352a' },
      { name: 'Bone', hex: '#ddd4c4' },
      { name: 'Rust', hex: '#a45237' },
    ],
    tileBox: '91 140 118 500',
    render: c => (
      <g>
        {/* Straps — slim, tops riding the shoulder contour */}
        <path d="M110 147 L 118 142 L 126 191 L 117 192 Z" fill={c} {...outline} strokeWidth={1.4} />
        <path d="M190 147 L 182 142 L 174 191 L 183 192 Z" fill={c} {...outline} strokeWidth={1.4} />
        {/* Body — square neck, follows every body curve to a mid-calf hem */}
        <path d="M112 190 L 126 190 L 126 208 L 174 208 L 174 190 L 188 190 C 194 226, 192 262, 183 300 C 193 336, 197 360, 197 382 C 199 452, 195 545, 189 618 C 164 626, 136 626, 111 618 C 105 545, 101 452, 103 382 C 103 360, 107 336, 117 300 C 108 262, 106 226, 112 190 Z" fill={c} {...outline} />
        {/* Ruching — horizontal gathers sagging slightly at center */}
        <path d="M110 227 Q 150 235 190 227 M110 253 Q 150 261 190 253 M112 279 Q 150 287 188 279 M119 301 Q 150 309 181 301 M109 327 Q 150 335 191 327 M105 355 Q 150 363 195 355 M105 383 Q 150 391 195 383 M104 411 Q 150 419 196 411 M105 443 Q 150 451 195 443 M106 477 Q 150 485 194 477 M107 511 Q 150 519 193 511 M108 545 Q 150 553 192 545 M110 579 Q 150 587 190 579" fill="none" stroke="rgba(0,0,0,0.11)" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M110 229 Q 150 237 190 229 M110 255 Q 150 263 190 255 M112 281 Q 150 289 188 281 M119 303 Q 150 311 181 303 M109 329 Q 150 337 191 329 M105 357 Q 150 365 195 357 M105 385 Q 150 393 195 385 M104 413 Q 150 421 196 413 M105 445 Q 150 453 195 445 M106 479 Q 150 487 194 479 M107 513 Q 150 521 193 513 M108 547 Q 150 555 192 547 M110 581 Q 150 589 190 581" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1.6" strokeLinecap="round" />
        {/* Bust crease + side shadows */}
        <path d="M128 216 Q 138 223 148 217 M152 217 Q 162 223 172 216" fill="none" stroke="rgba(0,0,0,0.10)" strokeWidth="2" strokeLinecap="round" />
        <path d="M107 320 C 103 420, 104 520, 109 610 L 118 612 C 112 520, 111 420, 114 324 Z" fill="rgba(0,0,0,0.08)" stroke="none" />
        <path d="M193 320 C 197 420, 196 520, 191 610 L 182 612 C 188 520, 189 420, 186 324 Z" fill="rgba(0,0,0,0.08)" stroke="none" />
        {/* Hem */}
        <path d="M113 611 Q 150 620 187 611" {...seam} />
        {/* Light — soft two-layer center pass so the stretch reads dimensional */}
        <path d="M138 230 C 136 360, 136 490, 139 604 L 157 604 C 154 488, 154 358, 156 230 Z" fill="rgba(255,255,255,0.04)" stroke="none" />
        <path d="M142 252 C 140 370, 140 490, 142 598 L 152 598 C 150 488, 150 368, 151 252 Z" fill="rgba(255,255,255,0.05)" stroke="none" />
      </g>
    ),
  },
  {
    id: 'cocktail-dress',
    kind: 'dress',
    label: 'Cocktail dress',
    colorways: [
      { name: 'Black', hex: '#211d1b' },
      { name: 'Emerald', hex: '#1e5a47' },
      { name: 'Ruby', hex: '#8f2338' },
      { name: 'Navy', hex: '#293750' },
    ],
    tileBox: '94 142 112 380',
    render: c => (
      <g>
        {/* Spaghetti straps */}
        <path d="M114 144 L 123 189 M186 144 L 177 189" fill="none" stroke="#2b2620" strokeWidth="2.4" strokeLinecap="round" />
        {/* Body — sweetheart bodice, fitted through the hip, above-knee hem */}
        <path d="M121 188 C 116 226, 116 260, 121 300 C 111 336, 106 360, 105 382 C 104 424, 106 464, 110 502 C 136 510, 164 510, 190 502 C 194 464, 196 424, 195 382 C 194 360, 189 336, 179 300 C 184 260, 184 226, 179 188 C 172 199, 160 203, 150 196 C 140 203, 128 199, 121 188 Z" fill={c} {...outline} />
        {/* Sweetheart edge + princess seams + waist seam */}
        <path d="M121 188 C 128 199, 140 203, 150 196 C 160 203, 172 199, 179 188" fill="none" {...outline} strokeWidth={1.3} />
        <path d="M123 192 C 129 202, 140 206, 150 199 C 160 206, 171 202, 177 192" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M135 197 C 132 232, 132 266, 134 298 M165 197 C 168 232, 168 266, 166 298" {...seam} />
        <path d="M137 199 C 134 233, 134 266, 136 297 M163 199 C 166 233, 166 266, 164 297" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M121 300 L 179 300" {...seam} />
        <path d="M122 303 L 178 303" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1.4" strokeLinecap="round" />
        {/* Bust crease + drape */}
        <path d="M128 202 Q 138 209 149 202 M151 202 Q 162 209 172 202" fill="none" stroke="rgba(0,0,0,0.10)" strokeWidth="2" strokeLinecap="round" />
        <path d="M108 390 C 106 428, 107 464, 110 498 L 118 498 C 115 464, 114 428, 115 392 Z" fill="rgba(0,0,0,0.08)" stroke="none" />
        <path d="M185 392 C 187 430, 187 466, 184 498 M150 320 C 149 380, 149 440, 150 496" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="2.5" strokeLinecap="round" />
        {/* Hem weight */}
        <path d="M110 492 C 136 500, 164 500, 190 492 L 190 502 C 164 510, 136 510, 110 502 Z" fill="rgba(0,0,0,0.10)" stroke="none" />
        {/* Sheen — structured satin, kept soft */}
        <path d="M130 212 C 142 207, 158 205, 170 210 L 168 222 C 156 217, 142 219, 134 224 Z" fill="rgba(255,255,255,0.05)" stroke="none" />
        <path d="M124 316 C 120 380, 120 444, 123 497 L 138 499 C 135 442, 135 380, 138 319 Z" fill="rgba(255,255,255,0.04)" stroke="none" />
        <path d="M127 331 C 124 390, 124 448, 126 495 L 134 496 C 132 444, 132 388, 134 333 Z" fill="rgba(255,255,255,0.05)" stroke="none" />
      </g>
    ),
  },
  {
    id: 'maxi-dress',
    kind: 'dress',
    label: 'Flowing maxi dress',
    colorways: [
      { name: 'Cream', hex: '#ebe1cd' },
      { name: 'Dusty rose', hex: '#c9a29e' },
      { name: 'Sage', hex: '#a4ad94' },
      { name: 'Cobalt', hex: '#35528f' },
    ],
    tileBox: '61 137 178 608',
    render: c => (
      <g>
        {/* Bodice — soft curved V, empire seam under the bust */}
        <path d="M104 150 C 111 144, 117 141, 123 139 C 132 170, 141 199, 150 228 C 159 199, 168 170, 177 139 C 183 141, 189 144, 196 150 C 195 188, 191 222, 187 252 L 113 252 C 109 222, 105 188, 104 150 Z" fill={c} {...outline} />
        <path d="M126 145 C 134 172, 142 198, 149 222 M174 145 C 166 172, 158 198, 151 222" {...seam} />
        {/* Skirt — big, soft, floor-skimming with a wavy hem */}
        <path d="M113 252 C 99 330, 87 430, 79 528 C 73 606, 71 668, 73 712 C 98 724, 124 718, 150 724 C 176 718, 202 724, 227 712 C 229 668, 227 606, 221 528 C 213 430, 201 330, 187 252 Z" fill={c} {...outline} />
        {/* Empire seam + gathers */}
        <path d="M113 252 L 187 252 M114 257 L 186 257" {...seam} />
        <path d="M124 261 L 122 275 M136 262 L 135 276 M150 263 L 150 277 M164 262 L 165 276 M176 261 L 178 275" {...seam} opacity="0.32" />
        {/* Long soft folds — the skirt's volume */}
        <path d="M126 272 C 116 380, 106 500, 98 700 M150 276 C 149 400, 148 540, 149 714 M174 272 C 184 380, 194 500, 202 700" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="3" strokeLinecap="round" />
        <path d="M136 300 C 130 420, 124 560, 120 706 M164 300 C 170 420, 176 560, 180 706" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="2.5" strokeLinecap="round" />
        {/* Hem weight + side shadow */}
        <path d="M75 700 C 100 712, 130 706, 150 712 C 170 706, 200 712, 225 700 L 227 712 C 202 724, 176 718, 150 724 C 124 718, 98 724, 73 712 Z" fill="rgba(0,0,0,0.08)" stroke="none" />
        <path d="M92 480 C 87 560, 83 640, 82 700 L 92 702 C 92 640, 95 560, 100 484 Z" fill="rgba(0,0,0,0.07)" stroke="none" />
        {/* Light — one wide airy pass, layered soft */}
        <path d="M130 290 C 124 420, 120 560, 119 702 L 140 704 C 139 560, 141 420, 146 292 Z" fill="rgba(255,255,255,0.05)" stroke="none" />
        <path d="M133 320 C 128 440, 125 570, 124 700 L 133 701 C 133 570, 135 445, 139 324 Z" fill="rgba(255,255,255,0.05)" stroke="none" />
        <path d="M130 162 C 128 188, 127 212, 128 240 L 137 242 C 136 214, 137 190, 139 168 Z" fill="rgba(255,255,255,0.06)" stroke="none" />
      </g>
    ),
  },
  {
    id: 'shirt-dress',
    kind: 'dress',
    label: 'Shirt dress',
    colorways: [
      { name: 'White', hex: '#f1ece2' },
      { name: 'Khaki', hex: '#b5a486' },
      { name: 'Black', hex: '#2a2621' },
      { name: 'Fine stripe', hex: '#c3ccd4' },
    ],
    tileBox: '78 124 144 452',
    render: c => (
      <g>
        {/* Short sleeves along the arm line */}
        <path d="M104 152 C 94 174, 89 202, 88 234 L 107 241 C 108 214, 111 188, 114 163 Z" fill={c} {...outline} />
        <path d="M196 152 C 206 174, 211 202, 212 234 L 193 241 C 192 214, 189 188, 186 163 Z" fill={c} {...outline} />
        <path d="M89 228 L 106 235 M211 228 L 194 235" {...seam} />
        <path d="M97 190 C 94 206, 93 220, 93 232 M203 190 C 206 206, 207 220, 207 232" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="2" strokeLinecap="round" />
        {/* Body — buttoned through, belted, A-line to the knee */}
        <path d="M104 150 C 118 143, 133 137, 141 134 L 150 190 L 159 134 C 167 137, 182 143, 196 150 C 197 202, 192 252, 187 296 C 194 330, 198 362, 200 398 C 203 456, 201 512, 196 554 C 166 564, 134 564, 104 554 C 99 512, 97 456, 100 398 C 102 362, 106 330, 113 296 C 108 252, 103 202, 104 150 Z" fill={c} {...outline} />
        {/* Collar — pointed flaps over a band */}
        <path d="M141 134 L 133 159 L 150 149 Z" fill={c} {...outline} strokeWidth={1.4} />
        <path d="M159 134 L 167 159 L 150 149 Z" fill={c} {...outline} strokeWidth={1.4} />
        <path d="M142 137 Q 150 142 158 137" {...seam} />
        <path d="M134 158 L 149 150 M166 158 L 151 150" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.4" strokeLinecap="round" />
        {/* Placket + buttons */}
        <path d="M146 190 L 146 552 M154 190 L 154 552" {...seam} />
        <path d="M148 192 L 148 550 M152 192 L 152 550" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="150" cy="204" r="1.8" fill="#2b2620" opacity="0.5" />
        <circle cx="150" cy="238" r="1.8" fill="#2b2620" opacity="0.5" />
        <circle cx="150" cy="272" r="1.8" fill="#2b2620" opacity="0.5" />
        <circle cx="150" cy="332" r="1.8" fill="#2b2620" opacity="0.5" />
        <circle cx="150" cy="374" r="1.8" fill="#2b2620" opacity="0.5" />
        <circle cx="150" cy="416" r="1.8" fill="#2b2620" opacity="0.5" />
        <circle cx="150" cy="458" r="1.8" fill="#2b2620" opacity="0.5" />
        <circle cx="150" cy="500" r="1.8" fill="#2b2620" opacity="0.5" />
        {/* Bodice + skirt drape */}
        <path d="M120 170 C 117 210, 116 248, 118 286 M180 170 C 183 210, 184 248, 182 286" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M124 322 C 120 396, 117 470, 116 546 M176 322 C 180 396, 183 470, 184 546 M136 332 C 134 402, 133 470, 133 548" fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth="2.5" strokeLinecap="round" />
        {/* Self belt — keepers, knot, hanging end */}
        <path d="M111 290 L 189 290 L 191 310 L 109 310 Z" fill={c} {...outline} strokeWidth={1.5} />
        <path d="M120 291 L 120 309 M180 291 L 180 309" {...seam} />
        <path d="M147 312 C 145 326, 145 338, 148 350 L 157 348 C 155 336, 154 326, 155 312 Z" fill={c} {...outline} strokeWidth={1.4} />
        <path d="M143 288 L 158 288 L 160 312 L 141 312 Z" fill={c} {...outline} strokeWidth={1.5} />
        <path d="M110 310 L 190 310 L 189 318 Q 150 325 111 318 Z" fill="rgba(0,0,0,0.08)" stroke="none" />
        <path d="M127 314 L 125 326 M138 315 L 137 327 M163 315 L 164 327 M174 314 L 176 326" {...seam} opacity="0.32" />
        {/* Hem weight */}
        <path d="M105 544 C 135 554, 165 554, 195 544 L 196 554 C 166 564, 134 564, 104 554 Z" fill="rgba(0,0,0,0.08)" stroke="none" />
        {/* Light — crisp poplin pass, kept faint */}
        <path d="M128 196 C 126 226, 125 256, 126 286 L 137 286 C 136 256, 136 226, 138 198 Z" fill="rgba(255,255,255,0.05)" stroke="none" />
        <path d="M160 322 C 162 396, 164 470, 165 546 L 176 544 C 174 470, 172 398, 170 324 Z" fill="rgba(255,255,255,0.04)" stroke="none" />
      </g>
    ),
  },
  {
    id: 'evening-gown',
    kind: 'dress',
    label: 'Evening gown',
    colorways: [
      { name: 'Black', hex: '#1f1c1a' },
      { name: 'Oxblood', hex: '#58222c' },
      { name: 'Emerald', hex: '#1d5244' },
      { name: 'Champagne', hex: '#d9c4a5' },
    ],
    tileBox: '74 166 138 590',
    render: c => (
      <g>
        {/* Body — structured sweetheart bodice, column skirt, high right slit */}
        <path d="M116 186 C 111 226, 112 262, 118 300 C 108 338, 104 364, 103 392 C 97 470, 91 590, 87 690 C 85 716, 85 732, 90 740 C 112 746, 134 746, 154 740 C 164 646, 174 552, 186 478 C 192 464, 197 452, 199 442 C 201 420, 199 402, 197 388 C 197 362, 192 338, 182 300 C 188 262, 189 226, 184 186 C 176 177, 161 176, 150 184 C 139 176, 124 177, 116 186 Z" fill={c} {...outline} />
        {/* Sweetheart edge + boning + waist seam */}
        <path d="M116 186 C 124 177, 139 176, 150 184 C 161 176, 176 177, 184 186" fill="none" {...outline} strokeWidth={1.3} />
        <path d="M132 192 C 130 228, 130 262, 132 298 M168 192 C 170 228, 170 262, 168 298 M150 187 L 150 298" {...seam} />
        <path d="M134 194 C 132 229, 132 262, 134 297 M166 194 C 168 229, 168 262, 166 297 M152 190 L 152 296" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M119 300 L 181 300" {...seam} />
        <path d="M120 303 L 180 303" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1.4" strokeLinecap="round" />
        {/* Slit — shadowed fold-back edge, croquis leg shows through */}
        <path d="M152 736 C 162 646, 172 554, 184 480" fill="none" stroke="rgba(0,0,0,0.13)" strokeWidth="3" strokeLinecap="round" />
        <path d="M155 734 C 165 648, 175 554, 187 482" fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="1.8" strokeLinecap="round" />
        {/* Hip drape — long falling folds */}
        <path d="M124 320 C 116 420, 108 540, 102 680 M138 330 C 133 440, 129 560, 127 700 M160 330 C 158 430, 156 530, 155 640" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="3" strokeLinecap="round" />
        <path d="M126 306 C 134 330, 140 356, 143 384" fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth="2.5" strokeLinecap="round" />
        {/* Pooling hem shadow */}
        <path d="M90 726 C 112 734, 134 733, 152 728 L 154 740 C 134 746, 112 746, 90 740 Z" fill="rgba(0,0,0,0.10)" stroke="none" />
        {/* Sheen — long satin pass falling from the waist, layered soft, + bodice light */}
        <path d="M127 315 C 120 450, 114 580, 111 696 L 130 698 C 131 570, 135 450, 141 320 Z" fill="rgba(255,255,255,0.04)" stroke="none" />
        <path d="M128 340 C 123 465, 118 580, 116 690 L 125 691 C 127 570, 130 460, 135 344 Z" fill="rgba(255,255,255,0.05)" stroke="none" />
        <path d="M128 198 C 140 192, 156 190, 168 196 L 165 210 C 154 204, 141 206, 132 212 Z" fill="rgba(255,255,255,0.05)" stroke="none" />
      </g>
    ),
  },
]
