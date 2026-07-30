// The model. A fashion croquis — elongated editorial proportions, minimal
// face, relaxed pose — drawn to the anchor table in contract.ts. Garments
// stack over this figure; sleeved pieces draw their own sleeves along the
// documented arm lines, so the skin arms simply show wherever nothing covers
// them.

const SKIN = '#d3a181'
const SKIN_SHADE = 'rgba(43,38,32,0.10)'
const LINE = { stroke: '#2b2620', strokeWidth: 1.5, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const }
const HAIR = '#241d18'

export default function Croquis() {
  return (
    <g>
      {/* Legs */}
      <path
        d="M103 374 C 100 452, 106 560, 113 660 L 116 726 L 112 758 L 138 758 L 136 726 L 141 560 Q 146 470 150 400 Q 154 470 159 560 L 164 726 L 162 758 L 188 758 L 184 726 L 187 660 C 194 560, 200 452, 197 374 Z"
        fill={SKIN} {...LINE}
      />
      <path d="M141 560 Q 146 470 150 402 Q 154 470 159 560 L 156 690 L 144 690 Z" fill={SKIN_SHADE} stroke="none" />
      {/* Torso */}
      <path
        d="M150 130 C 136 133, 116 141, 104 150 C 101 198, 113 250, 118 300 C 106 334, 102 354, 103 376 L 197 376 C 198 354, 194 334, 182 300 C 187 250, 199 198, 196 150 C 184 141, 164 133, 150 130 Z"
        fill={SKIN} {...LINE}
      />
      <path d="M118 300 C 112 330, 106 352, 105 372 L 122 372 C 120 348, 121 322, 124 302 Z" fill={SKIN_SHADE} stroke="none" />
      {/* Arms — relaxed, slightly away from the body */}
      <path d="M104 152 C 92 190, 90 230, 92 268 C 90 310, 87 352, 88 390 L 97 392 C 99 354, 101 312, 102 270 C 106 232, 110 196, 112 162 Z" fill={SKIN} {...LINE} />
      <path d="M196 152 C 208 190, 210 230, 208 268 C 210 310, 213 352, 212 390 L 203 392 C 201 354, 199 312, 198 270 C 194 232, 190 196, 188 162 Z" fill={SKIN} {...LINE} />
      {/* Hands */}
      <path d="M87 391 C 84 402, 84 412, 88 420 C 93 424, 98 421, 99 413 L 98 392 Z" fill={SKIN} {...LINE} />
      <path d="M213 391 C 216 402, 216 412, 212 420 C 207 424, 202 421, 201 413 L 202 392 Z" fill={SKIN} {...LINE} />
      {/* Neck + head */}
      <path d="M141 96 L 141 133 Q 150 139 159 133 L 159 96 Z" fill={SKIN} {...LINE} />
      <path d="M150 26 C 130 26, 119 44, 120 68 C 121 92, 133 108, 150 108 C 167 108, 179 92, 180 68 C 181 44, 170 26, 150 26 Z" fill={SKIN} {...LINE} />
      <path d="M141 100 Q 150 106 159 100 L 159 96 Q 150 102 141 96 Z" fill={SKIN_SHADE} stroke="none" />
      {/* Hair — swept back into a low bun */}
      <path
        d="M150 22 C 127 22, 115 42, 117 66 C 118 54, 124 40, 133 36 C 144 31, 156 31, 167 36 C 176 40, 182 54, 183 66 C 185 42, 173 22, 150 22 Z"
        fill={HAIR} {...LINE}
      />
      <path d="M117 62 C 112 66, 110 76, 114 82 C 117 86, 122 85, 123 80 C 121 74, 119 68, 117 62 Z" fill={HAIR} {...LINE} />
      <circle cx="184" cy="38" r="12" fill={HAIR} {...LINE} />
      {/* Face — croquis minimal: brow line and lips only */}
      <path d="M137 64 Q 142 61 147 63 M153 63 Q 158 61 163 64" fill="none" stroke="#2b2620" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M144 90 Q 150 93 156 90" fill="none" stroke="#8c5a4a" strokeWidth="2" strokeLinecap="round" />
    </g>
  )
}
