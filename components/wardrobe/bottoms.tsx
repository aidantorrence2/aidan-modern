// Bottoms — skirts and pants. Drawn to the body anchors in contract.ts; the
// straight jeans are the exemplar: waistband, fly, pockets, topstitching,
// wash shading. Colorways stay inside what the fabric really comes in.

import { type Piece, outline, seam } from './contract'

export const BOTTOMS: Piece[] = [
  {
    id: 'straight-jeans',
    kind: 'bottom',
    label: 'Straight jeans',
    colorways: [
      { name: 'Indigo', hex: '#37455e' },
      { name: 'Mid wash', hex: '#64789a' },
      { name: 'Light wash', hex: '#93a7bd' },
      { name: 'Washed black', hex: '#2e2b28' },
      { name: 'Ecru', hex: '#cfc7b4' },
    ],
    tileBox: '68 316 164 452',
    render: c => (
      <g>
        {/* Legs + hips */}
        <path d="M105 346 C 103 356, 102 366, 102 374 C 99 452, 103 560, 107 660 L 109 728 L 141 728 L 145 560 L 150 430 L 155 560 L 159 728 L 191 728 L 193 660 C 197 560, 201 452, 198 374 C 198 366, 197 356, 195 346 Z" fill={c} {...outline} />
        {/* Waistband */}
        <path d="M106 330 L 194 330 L 195 346 L 105 346 Z" fill={c} {...outline} />
        <path d="M106 334 L 194 334 M107 342 L 193 342" {...seam} />
        <circle cx="150" cy="338" r="2.4" fill="none" stroke="#2b2620" strokeWidth="1" opacity="0.55" />
        {/* Fly */}
        <path d="M150 346 L 150 398 M150 350 C 144 356, 142 374, 145 394" {...seam} />
        {/* Front pockets */}
        <path d="M108 350 C 118 366, 128 372, 136 374 M192 350 C 182 366, 172 372, 164 374" {...seam} />
        {/* Side seams + inseam shadow */}
        <path d="M103 380 C 101 470, 104 580, 108 690 M197 380 C 199 470, 196 580, 192 690" {...seam} opacity="0.3" />
        <path d="M150 430 L 145 560 L 141 720 L 148 720 L 152 560 Z M150 430 L 155 560 L 159 720 L 152 720 Z" fill="rgba(0,0,0,0.12)" stroke="none" />
        {/* Wash — thigh light pass and hip whiskers */}
        <path d="M112 390 C 110 470, 112 560, 115 650 L 128 650 C 126 560, 125 470, 126 392 Z" fill="rgba(255,255,255,0.09)" stroke="none" />
        <path d="M172 392 C 173 470, 173 560, 171 650 L 184 650 C 187 560, 188 470, 186 392 Z" fill="rgba(255,255,255,0.09)" stroke="none" />
        <path d="M118 362 Q 134 368 148 366 M120 376 Q 134 382 147 380 M182 362 Q 168 368 153 366" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="2" strokeLinecap="round" />
        {/* Hems */}
        <path d="M109 720 L 141 720 M159 720 L 191 720" {...seam} />
      </g>
    ),
  },
  {
    id: 'mini-a-line-skirt',
    kind: 'bottom',
    label: 'Mini A-line skirt',
    colorways: [
      { name: 'Black', hex: '#26221f' },
      { name: 'Camel', hex: '#b3906a' },
      { name: 'Charcoal', hex: '#48443f' },
      { name: 'Oxblood', hex: '#5c2430' },
      { name: 'Cream', hex: '#e8e0cd' },
    ],
    tileBox: '83 320 134 156',
    render: c => (
      <g>
        {/* Body — clean A-line flare from the high hip to a mini hem */}
        <path d="M105 346 C 100 372, 96 415, 93 456 C 131 466, 169 466, 207 456 C 204 415, 200 372, 195 346 Z" fill={c} {...outline} />
        {/* Waistband */}
        <path d="M106 330 L 194 330 L 195 346 L 105 346 Z" fill={c} {...outline} />
        <path d="M107 342 L 193 342" {...seam} />
        {/* Side zip (left) */}
        <path d="M106 348 L 104 378" {...seam} opacity="0.5" />
        <circle cx="104" cy="380.5" r="1.3" fill="#2b2620" opacity="0.4" />
        {/* Front darts */}
        <path d="M129 347 L 127 376 M171 347 L 173 376" {...seam} />
        {/* Side seams */}
        <path d="M103 356 C 99 390, 96 424, 94 450 M197 356 C 201 390, 204 424, 206 450" {...seam} opacity="0.3" />
        {/* Drape — panel shadow off the left hip + two soft folds */}
        <path d="M104 352 C 100 388, 97 422, 95 452 L 105 454 C 106 420, 108 386, 110 354 Z" fill="rgba(0,0,0,0.09)" stroke="none" />
        <path d="M162 358 C 165 390, 167 422, 169 452 M140 362 C 139 392, 138 424, 138 454" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="3" strokeLinecap="round" />
        {/* Light pass — soft wool front */}
        <path d="M118 356 C 116 390, 114 422, 113 450 L 131 452 C 131 422, 131 390, 132 358 Z" fill="rgba(255,255,255,0.07)" stroke="none" />
        {/* Hem weight */}
        <path d="M94 448 C 131 458, 169 458, 206 448 L 207 456 C 169 466, 131 466, 93 456 Z" fill="rgba(0,0,0,0.08)" stroke="none" />
      </g>
    ),
  },
  {
    id: 'pencil-midi-skirt',
    kind: 'bottom',
    label: 'Pencil midi skirt',
    colorways: [
      { name: 'Black', hex: '#26221f' },
      { name: 'Charcoal', hex: '#48443f' },
      { name: 'Camel', hex: '#b3906a' },
      { name: 'Navy', hex: '#2b3550' },
      { name: 'Cream', hex: '#e8e0cd' },
    ],
    tileBox: '91 320 118 337',
    render: c => (
      <g>
        {/* Body — fitted over the hip, tapering to a midi hem */}
        <path d="M105 346 C 102 356, 101 366, 101 374 C 103 456, 107 540, 110 606 L 111 638 C 137 646, 163 646, 189 638 L 190 606 C 193 540, 197 456, 199 374 C 199 366, 198 356, 195 346 Z" fill={c} {...outline} />
        {/* Waistband */}
        <path d="M106 330 L 194 330 L 195 346 L 105 346 Z" fill={c} {...outline} />
        <path d="M107 342 L 193 342" {...seam} />
        {/* Front darts */}
        <path d="M131 347 L 129 384 M169 347 L 171 384" {...seam} />
        {/* Back-vent line + notch at the hem */}
        <path d="M150 568 L 150 641" {...seam} opacity="0.45" />
        <path d="M146 641 L 150 630 L 154 641 Z" fill="rgba(0,0,0,0.14)" stroke="none" />
        {/* Side seams */}
        <path d="M104 386 C 106 460, 109 540, 112 602 M196 386 C 194 460, 191 540, 188 602" {...seam} opacity="0.3" />
        {/* Fit — horizontal tension folds across the thigh */}
        <path d="M117 462 Q 150 470 183 462 M120 500 Q 150 507 180 500" fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth="2.5" strokeLinecap="round" />
        {/* Drape — hip shadow left, long fold right */}
        <path d="M103 384 C 104 450, 107 520, 110 580 L 118 580 C 114 520, 111 450, 110 386 Z" fill="rgba(0,0,0,0.08)" stroke="none" />
        <path d="M196 390 C 194 460, 191 530, 188 596" fill="none" stroke="rgba(0,0,0,0.09)" strokeWidth="3" strokeLinecap="round" />
        {/* Light pass */}
        <path d="M126 390 C 124 470, 124 550, 125 620 L 140 622 C 138 550, 137 470, 138 392 Z" fill="rgba(255,255,255,0.07)" stroke="none" />
        {/* Hem weight */}
        <path d="M112 630 C 137 638, 163 638, 188 630 L 189 638 C 163 646, 137 646, 111 638 Z" fill="rgba(0,0,0,0.08)" stroke="none" />
      </g>
    ),
  },
  {
    id: 'pleated-midi-skirt',
    kind: 'bottom',
    label: 'Pleated midi skirt',
    colorways: [
      { name: 'Black', hex: '#24211e' },
      { name: 'Navy', hex: '#2b3550' },
      { name: 'Champagne', hex: '#d3bd9c' },
      { name: 'Forest', hex: '#2e4a3a' },
      { name: 'Dove grey', hex: '#b7b2a9' },
      { name: 'Oxblood', hex: '#5c2430' },
    ],
    tileBox: '76 320 148 344',
    render: c => (
      <g>
        {/* Body — flares from the waist, hem swings in soft waves */}
        <path d="M105 346 C 97 385, 92 470, 88 560 C 87 590, 86 618, 86 638 C 98 648, 111 643, 124 649 C 137 654, 163 654, 176 649 C 189 643, 202 648, 214 638 C 214 618, 213 590, 212 560 C 208 470, 202 385, 195 346 Z" fill={c} {...outline} />
        {/* Waistband */}
        <path d="M106 330 L 194 330 L 195 346 L 105 346 Z" fill={c} {...outline} />
        <path d="M107 342 L 193 342" {...seam} />
        {/* Side zip (left) */}
        <path d="M106 348 L 104 380" {...seam} opacity="0.5" />
        {/* Pleat facets — alternating shadow and light wedges */}
        <path d="M105 346 C 98 390, 92 470, 88 560 C 87 590, 86 618, 86 638 L 99 641 C 103 550, 108 440, 113 348 Z" fill="rgba(0,0,0,0.08)" stroke="none" />
        <path d="M187 348 C 192 440, 197 550, 201 641 L 214 638 C 213 618, 212 590, 212 560 C 208 470, 202 390, 195 346 Z" fill="rgba(0,0,0,0.08)" stroke="none" />
        <path d="M150 348 C 150 440, 150 550, 150 650 L 169 648 C 167 550, 164 440, 162 348 Z" fill="rgba(0,0,0,0.05)" stroke="none" />
        <path d="M126 348 C 122 440, 118 550, 115 645 L 131 648 C 133 550, 136 440, 138 348 Z" fill="rgba(255,255,255,0.07)" stroke="none" />
        <path d="M162 348 C 164 440, 167 550, 169 648 L 185 645 C 182 550, 178 440, 174 348 Z" fill="rgba(255,255,255,0.07)" stroke="none" />
        {/* Pleat lines — regular, fanning to the hem */}
        <path d="M113 348 C 108 440, 103 550, 99 641 M126 348 C 122 440, 118 550, 115 645 M138 348 C 136 440, 133 550, 131 648 M150 348 C 150 440, 150 550, 150 650 M162 348 C 164 440, 167 550, 169 648 M174 348 C 178 440, 182 550, 185 645 M187 348 C 192 440, 197 550, 201 641" {...seam} opacity="0.3" />
      </g>
    ),
  },
  {
    id: 'satin-slip-skirt',
    kind: 'bottom',
    label: 'Satin slip skirt',
    colorways: [
      { name: 'Champagne', hex: '#d8c3ad' },
      { name: 'Black', hex: '#26211d' },
      { name: 'Sage', hex: '#9aa48a' },
      { name: 'Oxblood', hex: '#5c2430' },
      { name: 'Ivory', hex: '#eae1d2' },
    ],
    tileBox: '91 321 118 339',
    render: c => (
      <g>
        {/* Body — bias cut: skims the hip, kicks out gently at the midi hem */}
        <path d="M107 342 C 103 358, 101 371, 102 386 C 104 462, 107 540, 109 600 C 109 618, 108 632, 107 643 C 136 652, 164 652, 193 643 C 192 632, 191 618, 191 600 C 193 540, 196 462, 198 386 C 199 371, 197 358, 193 342 Z" fill={c} {...outline} />
        {/* Narrow bias waistband */}
        <path d="M108 331 L 192 331 L 193 342 L 107 342 Z" fill={c} {...outline} strokeWidth={1.4} />
        {/* Side zip (left) */}
        <path d="M107 344 L 105 374" {...seam} opacity="0.5" />
        <circle cx="105" cy="376.5" r="1.3" fill="#2b2620" opacity="0.4" />
        {/* Bias drape — long soft folds */}
        <path d="M133 400 C 130 480, 129 560, 131 630 M150 410 C 149 490, 149 570, 150 638 M167 400 C 170 480, 171 560, 169 630" fill="none" stroke="rgba(0,0,0,0.09)" strokeWidth="3" strokeLinecap="round" />
        {/* Hip shadow */}
        <path d="M104 420 C 105 470, 107 520, 109 566 L 118 566 C 115 520, 113 470, 112 424 Z" fill="rgba(0,0,0,0.08)" stroke="none" />
        {/* Sheen — satin's vertical light pass, plus a slim echo */}
        <path d="M138 396 C 135 480, 135 564, 137 634 L 149 635 C 147 564, 147 480, 149 398 Z" fill="rgba(255,255,255,0.12)" stroke="none" />
        <path d="M165 410 C 167 480, 167 556, 166 626 L 172 624 C 174 556, 174 484, 172 414 Z" fill="rgba(255,255,255,0.07)" stroke="none" />
        {/* Hem weight */}
        <path d="M108 632 C 136 642, 164 642, 192 632 L 193 643 C 164 652, 136 652, 107 643 Z" fill="rgba(0,0,0,0.10)" stroke="none" />
      </g>
    ),
  },
  {
    id: 'tiered-maxi-skirt',
    kind: 'bottom',
    label: 'Tiered maxi skirt',
    colorways: [
      { name: 'White', hex: '#f0ece2' },
      { name: 'Natural', hex: '#dcd2bd' },
      { name: 'Black', hex: '#272321' },
      { name: 'Terracotta', hex: '#b96b4d' },
      { name: 'Dusty blue', hex: '#8ea3b8' },
    ],
    tileBox: '69 320 162 413',
    render: c => (
      <g>
        {/* Body — three tiers, each stepping a little wider */}
        <path d="M105 346 C 100 388, 97 432, 96 474 L 91 479 C 89 520, 88 562, 87 604 L 81 610 C 80 645, 79 680, 79 712 C 125 723, 175 723, 221 712 C 221 680, 220 645, 219 610 L 213 604 C 212 562, 211 520, 209 479 L 204 474 C 203 432, 200 388, 195 346 Z" fill={c} {...outline} />
        {/* Waistband — elastic channels */}
        <path d="M106 330 L 194 330 L 195 346 L 105 346 Z" fill={c} {...outline} />
        <path d="M107 335 L 193 335 M107 341 L 193 341" {...seam} />
        {/* Tier seams */}
        <path d="M96 476 C 132 484, 168 484, 204 476 M87 606 C 129 615, 171 615, 213 606" {...seam} />
        {/* Gathers — short ticks under the waist and each seam */}
        <path d="M113 349 L 112 362 M125 350 L 124 363 M137 350 L 136 364 M150 351 L 150 364 M163 350 L 164 364 M175 350 L 176 363 M187 349 L 188 362" {...seam} opacity="0.3" />
        <path d="M104 481 L 103 496 M118 483 L 117 498 M134 485 L 133 500 M150 486 L 150 501 M166 485 L 167 500 M182 483 L 183 498 M196 481 L 197 496" {...seam} opacity="0.3" />
        <path d="M96 611 L 95 628 M112 614 L 111 631 M130 616 L 129 633 M150 617 L 150 634 M170 616 L 171 633 M188 614 L 189 631 M204 611 L 205 628" {...seam} opacity="0.3" />
        {/* Drape — soft folds through each tier */}
        <path d="M122 366 C 121 400, 120 436, 119 470 M178 366 C 179 400, 180 436, 181 470" fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M120 486 C 118 520, 117 560, 116 600 M180 486 C 182 520, 183 560, 184 600" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="3" strokeLinecap="round" />
        <path d="M108 616 C 106 648, 105 680, 104 706 M150 638 L 150 708 M192 616 C 194 648, 195 680, 196 706" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="3" strokeLinecap="round" />
        {/* Light pass — soft cotton front */}
        <path d="M132 486 C 131 524, 130 564, 130 602 L 146 602 C 145 564, 145 524, 145 488 Z" fill="rgba(255,255,255,0.06)" stroke="none" />
        <path d="M128 618 C 126 650, 125 680, 124 705 L 142 706 C 142 680, 143 650, 144 619 Z" fill="rgba(255,255,255,0.06)" stroke="none" />
        {/* Hem weight */}
        <path d="M80 704 C 126 715, 174 715, 220 704 L 221 712 C 175 723, 125 723, 79 712 Z" fill="rgba(0,0,0,0.08)" stroke="none" />
      </g>
    ),
  },
  {
    id: 'denim-mini-skirt',
    kind: 'bottom',
    label: 'Denim mini skirt',
    colorways: [
      { name: 'Indigo', hex: '#37455e' },
      { name: 'Mid wash', hex: '#64789a' },
      { name: 'Light wash', hex: '#93a7bd' },
      { name: 'Washed black', hex: '#2e2b28' },
      { name: 'Ecru', hex: '#cfc7b4' },
    ],
    tileBox: '86 320 128 153',
    render: c => (
      <g>
        {/* Body — slight A-line to a mini hem */}
        <path d="M105 346 C 101 374, 98 414, 96 454 C 132 463, 168 463, 204 454 C 202 414, 199 374, 195 346 Z" fill={c} {...outline} />
        {/* Waistband */}
        <path d="M106 330 L 194 330 L 195 346 L 105 346 Z" fill={c} {...outline} />
        <path d="M106 334 L 194 334 M107 342 L 193 342" {...seam} />
        <circle cx="150" cy="338" r="2.4" fill="none" stroke="#2b2620" strokeWidth="1" opacity="0.55" />
        {/* Fly */}
        <path d="M150 346 L 150 400 M150 350 C 144 356, 142 374, 145 396" {...seam} />
        {/* Front pockets */}
        <path d="M108 350 C 118 366, 128 372, 136 374 M192 350 C 182 366, 172 372, 164 374" {...seam} />
        {/* Side seams */}
        <path d="M104 356 C 101 390, 99 424, 98 448 M196 356 C 199 390, 201 424, 202 448" {...seam} opacity="0.3" />
        {/* Wash — front panels and hip whiskers */}
        <path d="M112 360 C 109 392, 107 422, 106 448 L 122 450 C 122 424, 123 394, 125 362 Z" fill="rgba(255,255,255,0.09)" stroke="none" />
        <path d="M175 362 C 177 394, 178 424, 178 450 L 194 448 C 193 422, 191 392, 188 360 Z" fill="rgba(255,255,255,0.09)" stroke="none" />
        <path d="M118 362 Q 134 368 148 366 M120 378 Q 135 384 148 382 M182 362 Q 168 368 153 366" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="2" strokeLinecap="round" />
        {/* Drape — fold shadows off the pockets */}
        <path d="M132 380 C 131 404, 130 426, 130 448 M168 380 C 169 404, 170 426, 170 448" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="2.5" strokeLinecap="round" />
        {/* Hem — double topstitch + weight */}
        <path d="M97 444 C 132 453, 168 453, 203 444 M97 448 C 132 457, 168 457, 203 448" {...seam} />
        <path d="M96 446 C 132 456, 168 456, 204 446 L 204 454 C 168 463, 132 463, 96 454 Z" fill="rgba(0,0,0,0.07)" stroke="none" />
      </g>
    ),
  },
  {
    id: 'wide-leg-trousers',
    kind: 'bottom',
    label: 'Wide-leg trousers',
    colorways: [
      { name: 'Black', hex: '#26221f' },
      { name: 'Charcoal', hex: '#48443f' },
      { name: 'Camel', hex: '#b3906a' },
      { name: 'Navy', hex: '#2b3550' },
      { name: 'Cream', hex: '#e8e0cd' },
    ],
    tileBox: '85 320 130 406',
    render: c => (
      <g>
        {/* Legs + hips — falls straight and wide from the hip */}
        <path d="M105 346 C 102 356, 101 366, 101 374 C 99 424, 97 484, 96 560 L 95 716 L 146 716 L 148 560 L 150 424 L 152 560 L 154 716 L 205 716 L 204 560 C 203 484, 201 424, 199 374 C 199 366, 198 356, 195 346 Z" fill={c} {...outline} />
        {/* Waistband + hook-and-bar */}
        <path d="M106 330 L 194 330 L 195 346 L 105 346 Z" fill={c} {...outline} />
        <path d="M107 342 L 193 342" {...seam} />
        <path d="M146 338 L 154 338" {...seam} opacity="0.5" />
        {/* Fly */}
        <path d="M150 346 L 150 400 M150 350 C 145 356, 143 374, 146 396" {...seam} />
        {/* Slash pockets */}
        <path d="M111 352 L 123 388 M189 352 L 177 388" {...seam} />
        {/* Creases — pressed line down each leg */}
        <path d="M121 404 C 120 500, 119 610, 119 712 M179 404 C 180 500, 181 610, 181 712" {...seam} opacity="0.35" />
        {/* Side seams */}
        <path d="M100 380 C 98 470, 97 580, 96 700 M200 380 C 202 470, 203 580, 204 700" {...seam} opacity="0.25" />
        {/* Drape — inseam shadow bands + outer folds + hip shadow */}
        <path d="M149 432 C 147 530, 146 630, 145 708 L 139 708 C 140 630, 141 530, 143 440 Z" fill="rgba(0,0,0,0.12)" stroke="none" />
        <path d="M151 432 C 153 530, 154 630, 155 708 L 161 708 C 160 630, 159 530, 157 440 Z" fill="rgba(0,0,0,0.12)" stroke="none" />
        <path d="M103 400 C 101 500, 100 610, 99 706 M197 400 C 199 500, 200 610, 201 706" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="3" strokeLinecap="round" />
        <path d="M104 356 C 102 400, 101 450, 100 500 L 108 500 C 108 452, 108 402, 109 358 Z" fill="rgba(0,0,0,0.08)" stroke="none" />
        {/* Light pass — front of each crease */}
        <path d="M123 410 C 122 520, 121 620, 121 710 L 133 710 C 133 620, 133 520, 133 412 Z" fill="rgba(255,255,255,0.08)" stroke="none" />
        <path d="M167 412 C 167 520, 167 620, 167 710 L 177 710 C 179 620, 179 520, 177 410 Z" fill="rgba(255,255,255,0.08)" stroke="none" />
        {/* Hems */}
        <path d="M96 710 L 145 710 M155 710 L 204 710" {...seam} />
      </g>
    ),
  },
  {
    id: 'tailored-slim-trousers',
    kind: 'bottom',
    label: 'Tailored slim trousers',
    colorways: [
      { name: 'Black', hex: '#26221f' },
      { name: 'Charcoal', hex: '#48443f' },
      { name: 'Camel', hex: '#b3906a' },
      { name: 'Navy', hex: '#2b3550' },
      { name: 'Cream', hex: '#e8e0cd' },
    ],
    tileBox: '89 320 122 388',
    render: c => (
      <g>
        {/* Legs + hips — fitted, cropped at the ankle */}
        <path d="M105 346 C 102 356, 101 366, 101 374 C 99 452, 103 556, 108 648 L 110 698 L 139 698 L 143 560 L 150 428 L 157 560 L 161 698 L 190 698 L 192 648 C 197 556, 201 452, 199 374 C 199 366, 198 356, 195 346 Z" fill={c} {...outline} />
        {/* Waistband + hook-and-bar */}
        <path d="M106 330 L 194 330 L 195 346 L 105 346 Z" fill={c} {...outline} />
        <path d="M107 342 L 193 342" {...seam} />
        <path d="M146 338 L 154 338" {...seam} opacity="0.5" />
        {/* Fly */}
        <path d="M150 346 L 150 396 M150 350 C 145 355, 143 372, 146 392" {...seam} />
        {/* Slash pockets */}
        <path d="M110 351 L 121 384 M190 351 L 179 384" {...seam} />
        {/* Front creases */}
        <path d="M125 404 C 123 500, 123 600, 124 694 M175 404 C 177 500, 177 600, 176 694" {...seam} opacity="0.35" />
        {/* Side seams */}
        <path d="M104 390 C 103 480, 106 580, 111 688 M196 390 C 197 480, 194 580, 189 688" {...seam} opacity="0.25" />
        {/* Drape — inseam shadow bands + hip shadow */}
        <path d="M148 436 L 142 560 L 138 692 L 132 692 L 137 560 L 143 442 Z" fill="rgba(0,0,0,0.11)" stroke="none" />
        <path d="M152 436 L 158 560 L 162 692 L 168 692 L 163 560 L 157 442 Z" fill="rgba(0,0,0,0.11)" stroke="none" />
        <path d="M105 358 C 103 400, 103 444, 103 488 L 110 488 C 109 446, 109 400, 110 360 Z" fill="rgba(0,0,0,0.08)" stroke="none" />
        <path d="M188 480 C 189 540, 188 600, 186 660" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="2.5" strokeLinecap="round" />
        {/* Light pass — front of each crease */}
        <path d="M127 412 C 126 500, 126 600, 127 690 L 135 690 C 135 600, 134 500, 135 414 Z" fill="rgba(255,255,255,0.08)" stroke="none" />
        <path d="M165 414 C 166 500, 166 600, 165 690 L 173 690 C 174 600, 174 500, 173 412 Z" fill="rgba(255,255,255,0.08)" stroke="none" />
        {/* Ankle hems */}
        <path d="M110 692 L 139 692 M161 692 L 190 692" {...seam} />
      </g>
    ),
  },
  {
    id: 'leather-pants',
    kind: 'bottom',
    label: 'Leather pants',
    colorways: [
      { name: 'Black', hex: '#211e1c' },
      { name: 'Chocolate', hex: '#442f24' },
      { name: 'Oxblood', hex: '#58242c' },
      { name: 'Cognac', hex: '#8a5a35' },
    ],
    tileBox: '89 320 122 406',
    render: c => (
      <g>
        {/* Legs + hips — fitted through the whole leg */}
        <path d="M105 346 C 102 356, 101 366, 101 374 C 99 455, 103 560, 108 660 L 110 716 L 141 716 L 145 560 L 150 430 L 155 560 L 159 716 L 190 716 L 192 660 C 197 560, 201 455, 199 374 C 199 366, 198 356, 195 346 Z" fill={c} {...outline} />
        {/* Waistband */}
        <path d="M106 330 L 194 330 L 195 346 L 105 346 Z" fill={c} {...outline} />
        <path d="M107 342 L 193 342" {...seam} />
        <circle cx="150" cy="338" r="2.4" fill="none" stroke="#2b2620" strokeWidth="1" opacity="0.55" />
        {/* Fly */}
        <path d="M150 346 L 150 398 M150 350 C 144 356, 142 374, 145 394" {...seam} />
        {/* Front pockets */}
        <path d="M108 350 C 118 366, 128 372, 136 374 M192 350 C 182 366, 172 372, 164 374" {...seam} />
        {/* Side seams */}
        <path d="M104 384 C 102 470, 105 580, 110 686 M196 384 C 198 470, 195 580, 190 686" {...seam} opacity="0.3" />
        {/* Drape — deep inseam shadow bands + knee-crease arcs */}
        <path d="M148 438 L 144 560 L 140 708 L 134 708 L 139 560 L 143 444 Z" fill="rgba(0,0,0,0.14)" stroke="none" />
        <path d="M152 438 L 156 560 L 160 708 L 166 708 L 161 560 L 157 444 Z" fill="rgba(0,0,0,0.14)" stroke="none" />
        <path d="M116 566 Q 128 572 142 568 M158 568 Q 172 572 184 566" fill="none" stroke="rgba(0,0,0,0.10)" strokeWidth="2" strokeLinecap="round" />
        {/* Sheen — tapered thigh streaks, leather's signature */}
        <path d="M113 398 C 111 452, 112 508, 115 562 Q 120 570 125 562 C 122 508, 121 452, 123 400 Q 118 390 113 398 Z" fill="rgba(255,255,255,0.12)" stroke="none" />
        <path d="M116 408 C 114 452, 115 500, 117 548 Q 120 553 123 548 C 121 500, 120 454, 121 410 Q 119 403 116 408 Z" fill="rgba(255,255,255,0.10)" stroke="none" />
        <path d="M187 398 C 189 452, 188 508, 185 562 Q 180 570 175 562 C 178 508, 179 452, 177 400 Q 182 390 187 398 Z" fill="rgba(255,255,255,0.12)" stroke="none" />
        <path d="M184 408 C 186 452, 185 500, 183 548 Q 180 553 177 548 C 179 500, 180 454, 179 410 Q 181 403 184 408 Z" fill="rgba(255,255,255,0.10)" stroke="none" />
        {/* Sheen — shin catch-lights */}
        <path d="M116 590 C 117 632, 119 672, 121 704 Q 125 709 128 703 C 127 670, 126 632, 125 592 Q 120 584 116 590 Z" fill="rgba(255,255,255,0.10)" stroke="none" />
        <path d="M184 590 C 183 632, 181 672, 179 704 Q 175 709 172 703 C 173 670, 174 632, 175 592 Q 180 584 184 590 Z" fill="rgba(255,255,255,0.10)" stroke="none" />
        {/* Hems */}
        <path d="M110 708 L 141 708 M159 708 L 190 708" {...seam} />
      </g>
    ),
  },
  {
    id: 'cargo-pants',
    kind: 'bottom',
    label: 'Cargo pants',
    colorways: [
      { name: 'Olive', hex: '#5b5a41' },
      { name: 'Sand', hex: '#c7b493' },
      { name: 'Black', hex: '#2a2622' },
      { name: 'Stone', hex: '#a9a396' },
    ],
    tileBox: '86 320 128 410',
    render: c => (
      <g>
        {/* Legs + hips — relaxed straight fit */}
        <path d="M105 346 C 102 356, 101 366, 101 374 C 98 440, 96 505, 97 575 L 100 720 L 146 720 L 148 560 L 150 432 L 152 560 L 154 720 L 200 720 L 203 575 C 204 505, 202 440, 199 374 C 199 366, 198 356, 195 346 Z" fill={c} {...outline} />
        {/* Waistband */}
        <path d="M106 330 L 194 330 L 195 346 L 105 346 Z" fill={c} {...outline} />
        <path d="M106 334 L 194 334 M107 342 L 193 342" {...seam} />
        <circle cx="150" cy="338" r="2.4" fill="none" stroke="#2b2620" strokeWidth="1" opacity="0.55" />
        {/* Fly */}
        <path d="M150 346 L 150 400 M150 350 C 144 356, 142 374, 145 396" {...seam} />
        {/* Front pockets */}
        <path d="M108 350 C 118 366, 128 372, 136 374 M192 350 C 182 366, 172 372, 164 374" {...seam} />
        {/* Side seams */}
        <path d="M100 390 C 98 480, 97 590, 99 700 M200 390 C 202 480, 203 590, 201 700" {...seam} opacity="0.25" />
        {/* Thigh flap pockets — flap, bellows pouch, button */}
        <path d="M101 464 L 128 466 L 127 479 L 100 477 Z" fill={c} {...outline} strokeWidth={1.2} />
        <path d="M101 480 L 127 482 L 126 517 L 100 515 Z" fill={c} {...outline} strokeWidth={1.2} />
        <path d="M113.5 483 L 113 515" {...seam} />
        <circle cx="114" cy="473" r="1.5" fill="#2b2620" opacity="0.45" />
        <path d="M172 466 L 199 464 L 200 477 L 173 479 Z" fill={c} {...outline} strokeWidth={1.2} />
        <path d="M173 482 L 199 480 L 200 515 L 174 517 Z" fill={c} {...outline} strokeWidth={1.2} />
        <path d="M186.5 483 L 187 515" {...seam} />
        <circle cx="186" cy="473" r="1.5" fill="#2b2620" opacity="0.45" />
        {/* Drape — inseam shadow bands, knee crumple, pocket-weight fold */}
        <path d="M149 438 C 147 540, 146 640, 145 712 L 139 712 C 140 640, 141 540, 143 446 Z" fill="rgba(0,0,0,0.11)" stroke="none" />
        <path d="M151 438 C 153 540, 154 640, 155 712 L 161 712 C 160 640, 159 540, 157 446 Z" fill="rgba(0,0,0,0.11)" stroke="none" />
        <path d="M102 592 Q 122 599 146 594 M154 594 Q 178 599 199 592" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="2" strokeLinecap="round" />
        <path d="M108 524 C 106 560, 105 600, 104 640 M192 524 C 194 560, 195 600, 196 640" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="2.5" strokeLinecap="round" />
        {/* Light pass — matte cotton, subtle */}
        <path d="M132 400 C 130 480, 129 570, 129 660 L 142 662 C 141 570, 141 480, 142 402 Z" fill="rgba(255,255,255,0.07)" stroke="none" />
        {/* Hems */}
        <path d="M100 714 L 146 714 M154 714 L 200 714" {...seam} />
      </g>
    ),
  },
  {
    id: 'linen-wide-pants',
    kind: 'bottom',
    label: 'Linen wide pants',
    colorways: [
      { name: 'Natural', hex: '#d9cfb8' },
      { name: 'White', hex: '#f0ebe1' },
      { name: 'Sage', hex: '#9aa48a' },
      { name: 'Terracotta', hex: '#b96b4d' },
    ],
    tileBox: '86 320 128 404',
    render: c => (
      <g>
        {/* Legs + hips — soft wide fall */}
        <path d="M105 346 C 102 356, 101 366, 101 374 C 99 428, 97 492, 96 570 L 96 714 L 147 714 L 149 560 L 150 426 L 151 560 L 153 714 L 204 714 L 204 570 C 203 492, 201 428, 199 374 C 199 366, 198 356, 195 346 Z" fill={c} {...outline} />
        {/* Waistband */}
        <path d="M106 330 L 194 330 L 195 346 L 105 346 Z" fill={c} {...outline} />
        <path d="M107 342 L 193 342" {...seam} />
        {/* Fly — soft, low-contrast */}
        <path d="M150 346 L 150 396" {...seam} opacity="0.3" />
        {/* Side-seam pockets */}
        <path d="M104 356 L 106 396 M196 356 L 194 396" {...seam} opacity="0.35" />
        {/* Crumple — short irregular creases down each leg */}
        <path d="M108 462 Q 120 466 134 463 M112 530 Q 124 527 140 531 M106 600 Q 120 605 138 601 M111 664 Q 124 661 141 665" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M166 463 Q 180 466 192 462 M160 531 Q 176 527 188 530 M162 601 Q 180 605 194 600 M159 665 Q 176 661 189 664" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="1.8" strokeLinecap="round" />
        {/* Drape — long outer folds + inseam shadow bands */}
        <path d="M104 420 C 102 520, 101 620, 100 704 M196 420 C 198 520, 199 620, 200 704" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="3" strokeLinecap="round" />
        <path d="M149 432 C 148 540, 147 640, 146 706 L 140 706 C 141 640, 142 540, 143 440 Z" fill="rgba(0,0,0,0.10)" stroke="none" />
        <path d="M151 432 C 152 540, 153 640, 154 706 L 160 706 C 159 640, 158 540, 157 440 Z" fill="rgba(0,0,0,0.10)" stroke="none" />
        {/* Light pass — washed linen, gentle */}
        <path d="M118 420 C 116 520, 115 620, 115 706 L 130 706 C 130 620, 130 520, 131 422 Z" fill="rgba(255,255,255,0.06)" stroke="none" />
        {/* Hems */}
        <path d="M97 708 L 146 708 M154 708 L 203 708" {...seam} />
      </g>
    ),
  },
]
