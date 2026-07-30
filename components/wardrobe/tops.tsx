// Tops. Drawn to the body anchors in contract.ts — see the silk blouse for
// the standard a piece has to meet: real construction (collar, placket,
// cuffs), color-agnostic drape, a light pass, curated colorways.

import { type Piece, outline, seam } from './contract'

export const TOPS: Piece[] = [
  {
    id: 'silk-blouse',
    kind: 'top',
    label: 'Silk blouse',
    colorways: [
      { name: 'Ivory', hex: '#ece3d3' },
      { name: 'Champagne', hex: '#d6bf9d' },
      { name: 'Emerald', hex: '#23684f' },
      { name: 'Burgundy', hex: '#6d2f38' },
      { name: 'Dusty blue', hex: '#8ea3b8' },
      { name: 'Black', hex: '#282420' },
    ],
    tileBox: '58 118 184 300',
    render: c => (
      <g>
        {/* Sleeves — full, gathered into a cuff just above the wrist */}
        <path d="M104 152 C 90 192, 85 234, 87 270 C 83 310, 79 348, 81 380 L 101 383 C 101 350, 103 312, 103 272 C 106 236, 110 198, 112 160 Z" fill={c} {...outline} />
        <path d="M196 152 C 210 192, 215 234, 213 270 C 217 310, 221 348, 219 380 L 199 383 C 199 350, 197 312, 197 272 C 194 236, 190 198, 188 160 Z" fill={c} {...outline} />
        <path d="M80 380 L 102 383 L 101 397 L 81 394 Z" fill={c} {...outline} />
        <path d="M220 380 L 198 383 L 199 397 L 219 394 Z" fill={c} {...outline} />
        {/* Sleeve drape */}
        <path d="M92 200 C 89 240, 88 300, 88 350 M206 210 C 209 250, 210 300, 211 345" {...seam} opacity="0.25" />
        <path d="M84 372 Q 90 376 99 377 M216 372 Q 210 376 201 377" fill="none" stroke="rgba(0,0,0,0.14)" strokeWidth="2" strokeLinecap="round" />
        {/* Body — eases past the waist, hem sits at the high hip */}
        <path d="M104 150 C 118 143, 134 137, 142 134 L 150 200 L 158 134 C 166 137, 182 143, 196 150 C 198 205, 194 262, 195 305 C 197 330, 196 342, 194 350 C 165 359, 135 359, 106 350 C 104 342, 103 330, 105 305 C 106 262, 102 205, 104 150 Z" fill={c} {...outline} />
        {/* Collar — soft camp lapels either side of the V */}
        <path d="M142 134 L 131 160 L 149 152 Z" fill={c} {...outline} />
        <path d="M158 134 L 169 160 L 151 152 Z" fill={c} {...outline} />
        {/* Placket + buttons */}
        <path d="M150 200 L 150 352" {...seam} />
        <circle cx="150" cy="216" r="1.8" fill="#2b2620" opacity="0.5" />
        <circle cx="150" cy="248" r="1.8" fill="#2b2620" opacity="0.5" />
        <circle cx="150" cy="280" r="1.8" fill="#2b2620" opacity="0.5" />
        <circle cx="150" cy="312" r="1.8" fill="#2b2620" opacity="0.5" />
        {/* Drape — folds falling from the bust and underarms */}
        <path d="M117 175 C 113 220, 112 270, 113 320 M183 175 C 187 220, 188 270, 187 320 M138 210 C 136 250, 136 292, 137 330" fill="none" stroke="rgba(0,0,0,0.10)" strokeWidth="3" strokeLinecap="round" />
        <path d="M106 340 C 130 350, 170 350, 194 340 L 194 350 C 165 359, 135 359, 106 350 Z" fill="rgba(0,0,0,0.08)" stroke="none" />
        {/* Sheen — one diagonal light pass, silk's signature */}
        <path d="M118 190 C 140 180, 168 178, 190 186 L 186 214 C 164 204, 140 206, 122 216 Z" fill="rgba(255,255,255,0.10)" stroke="none" />
      </g>
    ),
  },
  {
    id: 'tank-top',
    kind: 'top',
    label: 'Tank top',
    colorways: [
      { name: 'White', hex: '#f2efe9' },
      { name: 'Black', hex: '#26221f' },
      { name: 'Grey marle', hex: '#a8a49d' },
      { name: 'Navy', hex: '#2c3547' },
      { name: 'Sage', hex: '#9aa48a' },
      { name: 'Chocolate', hex: '#5c4534' },
    ],
    tileBox: '92 130 116 222',
    render: c => (
      <g>
        {/* Body — scoop neck, cut-in shoulders, hem at the high hip */}
        <path d="M111 147 C 109 172, 107 190, 105 207 C 110 248, 115 276, 117 300 C 116 316, 114 327, 114 336 C 138 342, 162 342, 186 336 C 186 327, 184 316, 183 300 C 185 276, 190 248, 195 207 C 193 190, 191 172, 189 147 L 177 141 C 175 163, 166 180, 150 182 C 134 180, 125 163, 123 141 Z" fill={c} {...outline} />
        {/* Neckline + armhole binding */}
        <path d="M127 146 C 129 166, 137 183, 150 186 C 163 183, 171 166, 173 146" {...seam} />
        <path d="M112 152 C 110 172, 108 190, 108 205 M188 152 C 190 172, 192 190, 192 205" {...seam} />
        {/* Drape — jersey falls from the bust */}
        <path d="M121 220 C 119 256, 119 292, 120 322 M179 220 C 181 256, 181 292, 180 322 M150 235 C 149 268, 149 300, 150 328" fill="none" stroke="rgba(0,0,0,0.09)" strokeWidth="2.6" strokeLinecap="round" />
        {/* Hem shadow + double stitch */}
        <path d="M114 327 C 138 333, 162 333, 186 327 L 186 336 C 162 342, 138 342, 114 336 Z" fill="rgba(0,0,0,0.07)" stroke="none" />
        <path d="M116 331 C 139 337, 161 337, 184 331" {...seam} />
        {/* Light pass */}
        <path d="M130 196 C 128 240, 128 284, 130 324 L 141 326 C 139 284, 139 240, 141 198 Z" fill="rgba(255,255,255,0.09)" stroke="none" />
      </g>
    ),
  },
  {
    id: 'cami',
    kind: 'top',
    label: 'Lace-trim cami',
    colorways: [
      { name: 'Black', hex: '#282420' },
      { name: 'Ivory', hex: '#ece3d3' },
      { name: 'Champagne', hex: '#d6bf9d' },
      { name: 'Blush', hex: '#d8afa9' },
      { name: 'Navy', hex: '#2e3850' },
      { name: 'Burgundy', hex: '#6d2f38' },
    ],
    tileBox: '98 138 104 210',
    render: c => (
      <g>
        {/* Thin straps */}
        <path d="M119 150 L 126 189 M181 150 L 174 189" fill="none" stroke="#2b2620" strokeWidth="2.4" strokeLinecap="round" />
        {/* Body — bias silk, skims the waist */}
        <path d="M121 190 C 113 196, 110 204, 109 213 C 112 252, 116 278, 117 300 C 116 314, 115 324, 115 332 C 138 339, 162 339, 185 332 C 185 324, 184 314, 183 300 C 184 278, 188 252, 191 213 C 190 204, 187 196, 179 190 C 165 200, 135 200, 121 190 Z" fill={c} {...outline} />
        {/* Lace edging — scalloped band along the neckline */}
        <path d="M121 190 C 135 200, 165 200, 179 190 L 176 197 Q 172 204 168 201 Q 164 209 160 204 Q 156 211 152 206 Q 148 211 144 206 Q 140 209 136 203 Q 132 206 128 199 Q 126 202 124 197 Z" fill="rgba(0,0,0,0.09)" stroke="#2b2620" strokeWidth="0.8" strokeLinejoin="round" opacity="0.55" />
        <circle cx="134" cy="198" r="0.8" fill="#2b2620" opacity="0.35" />
        <circle cx="146" cy="202" r="0.8" fill="#2b2620" opacity="0.35" />
        <circle cx="158" cy="201" r="0.8" fill="#2b2620" opacity="0.35" />
        <circle cx="170" cy="197" r="0.8" fill="#2b2620" opacity="0.35" />
        {/* Bias drape */}
        <path d="M128 220 C 126 258, 126 296, 127 326 M150 216 C 149 254, 149 292, 150 330 M172 220 C 174 258, 174 296, 173 326" fill="none" stroke="rgba(0,0,0,0.09)" strokeWidth="2.6" strokeLinecap="round" />
        {/* Hem weight */}
        <path d="M115 323 C 138 330, 162 330, 185 323 L 185 332 C 162 339, 138 339, 115 332 Z" fill="rgba(0,0,0,0.07)" stroke="none" />
        {/* Sheen */}
        <path d="M126 214 C 145 206, 168 205, 184 212 L 181 236 C 164 228, 143 229, 129 238 Z" fill="rgba(255,255,255,0.11)" stroke="none" />
      </g>
    ),
  },
  {
    id: 'crop-tee',
    kind: 'top',
    label: 'Fitted crop tee',
    colorways: [
      { name: 'White', hex: '#f2efe9' },
      { name: 'Black', hex: '#26221f' },
      { name: 'Grey marle', hex: '#a8a49d' },
      { name: 'Sage', hex: '#9aa48a' },
      { name: 'Butter', hex: '#e6d3a3' },
    ],
    tileBox: '80 126 140 150',
    render: c => (
      <g>
        {/* Cap sleeves — snug on the upper arm */}
        <path d="M104 151 C 96 168, 93 186, 92 204 L 108 209 C 109 193, 110 176, 112 161 Z" fill={c} {...outline} />
        <path d="M196 151 C 204 168, 207 186, 208 204 L 192 209 C 191 193, 190 176, 188 161 Z" fill={c} {...outline} />
        <path d="M94 199 L 107 203 M206 199 L 193 203" {...seam} />
        {/* Body — fitted, cropped above the waist */}
        <path d="M104 150 C 116 144, 130 139, 138 136 C 143 150, 157 150, 162 136 C 170 139, 184 144, 196 150 C 198 190, 194 226, 189 258 C 163 265, 137 265, 111 258 C 106 226, 102 190, 104 150 Z" fill={c} {...outline} />
        {/* Rib neck binding */}
        <path d="M141 140 C 145 151, 155 151, 159 140" {...seam} />
        {/* Underbust cling + side folds */}
        <path d="M122 200 Q 136 208 150 207 M178 200 Q 164 208 150 207" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M115 178 C 113 206, 112 232, 113 252 M185 178 C 187 206, 188 232, 187 252" fill="none" stroke="rgba(0,0,0,0.09)" strokeWidth="2.4" strokeLinecap="round" />
        {/* Hem — snug band, double stitch */}
        <path d="M111 250 C 137 257, 163 257, 189 250 L 189 258 C 163 265, 137 265, 111 258 Z" fill="rgba(0,0,0,0.07)" stroke="none" />
        <path d="M113 253 C 137 260, 163 260, 187 253" {...seam} />
        {/* Light pass */}
        <path d="M126 168 C 124 200, 124 228, 126 252 L 137 254 C 135 228, 135 200, 137 170 Z" fill="rgba(255,255,255,0.09)" stroke="none" />
      </g>
    ),
  },
  {
    id: 'crew-tee',
    kind: 'top',
    label: 'Crew-neck tee',
    colorways: [
      { name: 'White', hex: '#f2efe9' },
      { name: 'Black', hex: '#26221f' },
      { name: 'Grey marle', hex: '#a8a49d' },
      { name: 'Navy', hex: '#2c3547' },
      { name: 'Sage', hex: '#9aa48a' },
      { name: 'Bone', hex: '#e0dacc' },
    ],
    tileBox: '76 126 148 240',
    render: c => (
      <g>
        {/* Sleeves — relaxed, hitting mid-bicep */}
        <path d="M104 151 C 95 170, 90 192, 88 216 L 107 222 C 108 202, 110 180, 112 161 Z" fill={c} {...outline} />
        <path d="M196 151 C 205 170, 210 192, 212 216 L 193 222 C 192 202, 190 180, 188 161 Z" fill={c} {...outline} />
        <path d="M90 210 L 106 215 M210 210 L 194 215" {...seam} />
        {/* Body — easy through the waist, hem past the high hip */}
        <path d="M104 150 C 116 144, 130 139, 138 136 C 143 150, 157 150, 162 136 C 170 139, 184 144, 196 150 C 200 210, 200 270, 198 330 C 198 338, 197 344, 196 348 C 166 356, 134 356, 104 348 C 103 344, 102 338, 102 330 C 100 270, 100 210, 104 150 Z" fill={c} {...outline} />
        {/* Rib neck binding + armhole seams */}
        <path d="M141 140 C 145 151, 155 151, 159 140" {...seam} />
        <path d="M105 153 C 111 176, 111 200, 107 220 M195 153 C 189 176, 189 200, 193 220" {...seam} opacity="0.3" />
        {/* Drape */}
        <path d="M117 190 C 114 240, 113 290, 114 334 M183 190 C 186 240, 187 290, 186 334 M143 226 C 141 264, 141 302, 142 338" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="2.8" strokeLinecap="round" />
        {/* Hem */}
        <path d="M104 339 C 134 347, 166 347, 196 339 L 196 348 C 166 356, 134 356, 104 348 Z" fill="rgba(0,0,0,0.07)" stroke="none" />
        <path d="M106 343 C 135 351, 165 351, 194 343" {...seam} />
        {/* Light pass */}
        <path d="M126 176 C 123 230, 122 284, 124 336 L 136 338 C 134 284, 135 230, 138 178 Z" fill="rgba(255,255,255,0.08)" stroke="none" />
      </g>
    ),
  },
  {
    id: 'off-shoulder-top',
    kind: 'top',
    label: 'Off-shoulder top',
    colorways: [
      { name: 'White', hex: '#f2efe9' },
      { name: 'Black', hex: '#26221f' },
      { name: 'Scarlet', hex: '#a4292e' },
      { name: 'Blush', hex: '#d8afa9' },
      { name: 'Chambray', hex: '#8ea3b8' },
    ],
    tileBox: '80 157 140 172',
    render: c => (
      <g>
        {/* Sleeves — banding the upper arms below bare shoulders */}
        <path d="M96 167 C 94 184, 92 200, 90 216 L 107 220 C 108 202, 110 184, 111 168 Z" fill={c} {...outline} />
        <path d="M204 167 C 206 184, 208 200, 210 216 L 193 220 C 192 202, 190 184, 189 168 Z" fill={c} {...outline} />
        <path d="M92 211 L 106 215 M208 211 L 194 215" {...seam} />
        {/* Body — neckline cut straight across, below the shoulder line */}
        <path d="M104 171 C 120 179, 138 182, 150 182 C 162 182, 180 179, 196 171 C 195 208, 193 250, 192 280 C 192 296, 191 306, 190 312 C 164 319, 136 319, 110 312 C 109 306, 108 296, 108 280 C 107 250, 105 208, 104 171 Z" fill={c} {...outline} />
        {/* Elastic casing */}
        <path d="M95 176 L 110 178 M205 176 L 190 178" {...seam} />
        <path d="M106 180 C 122 188, 178 188, 194 180" {...seam} />
        {/* Gathers along the elastic edge */}
        <path d="M100 169 L 99 177 M116 176 L 115 184 M126 179 L 125 187 M138 181 L 137 189 M150 183 L 150 191 M162 181 L 163 189 M174 179 L 175 187 M184 176 L 185 184 M200 169 L 201 177" {...seam} opacity="0.3" />
        {/* Drape */}
        <path d="M122 210 C 119 246, 118 282, 119 308 M178 210 C 181 246, 182 282, 181 308 M150 224 C 149 254, 149 284, 150 312" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="2.6" strokeLinecap="round" />
        {/* Hem shadow */}
        <path d="M110 303 C 136 310, 164 310, 190 303 L 190 312 C 164 319, 136 319, 110 312 Z" fill="rgba(0,0,0,0.07)" stroke="none" />
        {/* Light pass */}
        <path d="M128 194 C 125 234, 124 272, 126 306 L 138 308 C 136 272, 136 236, 139 196 Z" fill="rgba(255,255,255,0.09)" stroke="none" />
      </g>
    ),
  },
  {
    id: 'corset-top',
    kind: 'top',
    label: 'Corset top',
    colorways: [
      { name: 'Black', hex: '#211d1a' },
      { name: 'Ivory', hex: '#eae0cf' },
      { name: 'Scarlet', hex: '#a4292e' },
      { name: 'Champagne', hex: '#d4bc98' },
    ],
    tileBox: '96 156 108 180',
    render: c => (
      <g>
        {/* Body — sweetheart neckline, boned to a pointed hem */}
        <path d="M106 180 C 112 169, 124 165, 133 171 C 140 176, 147 184, 150 191 C 153 184, 160 176, 167 171 C 176 165, 188 169, 194 180 C 193 220, 188 260, 184 300 C 182 308, 176 313, 168 317 C 160 320, 154 322, 150 326 C 146 322, 140 320, 132 317 C 124 313, 118 308, 116 300 C 112 260, 107 220, 106 180 Z" fill={c} {...outline} />
        {/* Top-edge trim */}
        <path d="M109 182 C 115 174, 125 171, 132 176 C 139 181, 146 187, 150 195 C 154 187, 161 181, 168 176 C 175 171, 185 174, 191 182" {...seam} />
        {/* Underbust seam + center front */}
        <path d="M108 214 C 122 222, 140 224, 150 217 C 160 224, 178 222, 192 214" {...seam} />
        <path d="M150 191 L 150 324" {...seam} />
        {/* Boning channels */}
        <path d="M122 180 C 122 222, 120 268, 122 310 M136 182 C 135 226, 134 272, 135 316 M164 182 C 165 226, 166 272, 165 316 M178 180 C 178 222, 180 268, 178 310" {...seam} opacity="0.3" />
        {/* Panel shading at the sides */}
        <path d="M107 190 C 109 232, 112 272, 116 302 L 124 306 C 120 270, 117 230, 116 186 Z" fill="rgba(0,0,0,0.08)" stroke="none" />
        <path d="M193 190 C 191 232, 188 272, 184 302 L 176 306 C 180 270, 183 230, 184 186 Z" fill="rgba(0,0,0,0.08)" stroke="none" />
        {/* Bust highlights + light pass */}
        <path d="M121 178 C 127 172, 134 172, 139 178 C 134 184, 126 184, 121 178 Z" fill="rgba(255,255,255,0.12)" stroke="none" />
        <path d="M161 178 C 166 172, 173 172, 179 178 C 173 184, 166 184, 161 178 Z" fill="rgba(255,255,255,0.12)" stroke="none" />
        <path d="M142 200 C 141 240, 141 276, 142 308 L 150 314 C 149 276, 149 240, 150 198 Z" fill="rgba(255,255,255,0.08)" stroke="none" />
      </g>
    ),
  },
  {
    id: 'bodysuit',
    kind: 'top',
    label: 'Bodysuit',
    colorways: [
      { name: 'Black', hex: '#26221f' },
      { name: 'Ivory', hex: '#eae2d4' },
      { name: 'Chocolate', hex: '#5c4534' },
      { name: 'Burgundy', hex: '#64303a' },
      { name: 'Olive', hex: '#6b6a4f' },
    ],
    tileBox: '94 131 112 267',
    render: c => (
      <g>
        {/* Body — square neck, cut-in shoulders, high-cut hem at the hip */}
        <path d="M110 147 C 108 170, 106 189, 105 207 C 110 250, 116 276, 118 300 C 108 332, 105 346, 105 355 C 117 367, 136 379, 150 385 C 164 379, 183 367, 195 355 C 195 346, 192 332, 182 300 C 184 276, 190 250, 195 207 C 194 189, 192 170, 190 147 L 176 141 L 176 179 L 124 179 L 124 141 Z" fill={c} {...outline} />
        {/* Neck + armhole binding */}
        <path d="M120 144 L 120 183 L 180 183 L 180 144" {...seam} />
        <path d="M111 152 C 109 172, 108 190, 108 205 M189 152 C 191 172, 192 190, 192 205" {...seam} />
        {/* Leg-line seams */}
        <path d="M108 352 C 120 362, 137 373, 150 379 C 163 373, 180 362, 192 352" {...seam} opacity="0.3" />
        {/* Cling folds */}
        <path d="M121 220 C 119 258, 120 296, 122 330 M179 220 C 181 258, 180 296, 178 330 M150 240 C 149 276, 149 312, 150 344" fill="none" stroke="rgba(0,0,0,0.09)" strokeWidth="2.6" strokeLinecap="round" />
        {/* Hem shadow at the hip */}
        <path d="M135 368 C 142 376, 158 376, 165 368 L 150 383 Z" fill="rgba(0,0,0,0.08)" stroke="none" />
        {/* Light pass */}
        <path d="M129 195 C 127 245, 127 295, 130 340 L 141 346 C 138 298, 138 248, 140 197 Z" fill="rgba(255,255,255,0.09)" stroke="none" />
      </g>
    ),
  },
  {
    id: 'oversized-shirt',
    kind: 'top',
    label: 'Oversized shirt',
    colorways: [
      { name: 'White', hex: '#f4f1ea' },
      { name: 'Pale blue', hex: '#cfdce8' },
      { name: 'Black', hex: '#2a2724' },
      { name: 'Striped', hex: '#f2efe8' },
    ],
    tileBox: '66 119 168 283',
    render: c => (
      <g>
        {/* Sleeves — full, from a dropped shoulder into barrel cuffs */}
        <path d="M103 153 C 84 196, 78 242, 82 284 C 79 320, 78 348, 80 371 L 101 375 C 101 348, 101 320, 102 286 C 104 244, 106 202, 108 160 Z" fill={c} {...outline} />
        <path d="M197 153 C 216 196, 222 242, 218 284 C 221 320, 222 348, 220 371 L 199 375 C 199 348, 199 320, 198 286 C 196 244, 194 202, 192 160 Z" fill={c} {...outline} />
        <path d="M79 371 L 102 375 L 101 391 L 80 388 Z" fill={c} {...outline} />
        <path d="M221 371 L 198 375 L 199 391 L 220 388 Z" fill={c} {...outline} />
        <circle cx="90" cy="382" r="1.6" fill="#2b2620" opacity="0.5" />
        <circle cx="210" cy="382" r="1.6" fill="#2b2620" opacity="0.5" />
        <path d="M90 220 C 87 260, 86 310, 87 355 M213 220 C 216 260, 217 310, 216 355" {...seam} opacity="0.25" />
        {/* Body — boyfriend cut, curved shirttail hem */}
        <path d="M101 152 C 114 144, 128 139, 137 136 C 145 141, 149 146, 150 153 C 151 146, 155 141, 163 136 C 172 139, 186 144, 199 152 C 203 210, 204 270, 203 330 C 203 344, 202 356, 200 366 C 180 376, 160 379, 150 379 C 140 379, 120 376, 100 366 C 98 356, 97 344, 97 330 C 96 270, 97 210, 101 152 Z" fill={c} {...outline} />
        {/* Stripe overlay — pale ground only */}
        {c === '#f2efe8' && (
          <g stroke="#7f97b0" strokeWidth="1.1" opacity="0.6" fill="none">
            <path d="M106 162 C 104 230, 104 300, 105 360" />
            <path d="M114 158 C 112 230, 112 302, 113 366" />
            <path d="M122 155 C 120 230, 120 304, 121 369" />
            <path d="M130 152 C 129 230, 129 306, 130 372" />
            <path d="M138 150 C 137 230, 137 308, 138 374" />
            <path d="M162 150 C 163 230, 163 308, 162 374" />
            <path d="M170 152 C 171 230, 171 306, 170 372" />
            <path d="M178 155 C 180 230, 180 304, 179 369" />
            <path d="M186 158 C 188 230, 188 302, 187 366" />
            <path d="M194 162 C 196 230, 196 300, 195 360" />
            <path d="M88 200 C 85 260, 84 320, 85 366" />
            <path d="M96 180 C 93 245, 92 310, 93 370" />
            <path d="M212 200 C 215 260, 216 320, 215 366" />
            <path d="M204 180 C 207 245, 208 310, 207 370" />
          </g>
        )}
        {/* Collar — back band + pointed flaps framing the top button */}
        <path d="M138 134 C 146 129, 154 129, 162 134 L 157 154 L 143 154 Z" fill={c} {...outline} strokeWidth={1.4} />
        <path d="M137 134 C 136 143, 137 152, 141 158 L 150 142 C 145 140, 140 137, 137 134 Z" fill={c} {...outline} />
        <path d="M163 134 C 164 143, 163 152, 159 158 L 150 142 C 155 140, 160 137, 163 134 Z" fill={c} {...outline} />
        <circle cx="150" cy="151" r="1.5" fill="#2b2620" opacity="0.5" />
        {/* Placket + buttons */}
        <path d="M147 156 C 146 230, 146 306, 147 375 M153 156 C 154 230, 154 306, 153 375" {...seam} />
        <circle cx="150" cy="168" r="1.7" fill="#2b2620" opacity="0.5" />
        <circle cx="150" cy="199" r="1.7" fill="#2b2620" opacity="0.5" />
        <circle cx="150" cy="230" r="1.7" fill="#2b2620" opacity="0.5" />
        <circle cx="150" cy="261" r="1.7" fill="#2b2620" opacity="0.5" />
        <circle cx="150" cy="292" r="1.7" fill="#2b2620" opacity="0.5" />
        <circle cx="150" cy="323" r="1.7" fill="#2b2620" opacity="0.5" />
        <circle cx="150" cy="354" r="1.7" fill="#2b2620" opacity="0.5" />
        {/* Chest pocket */}
        <path d="M113 202 L 133 204 L 132 227 L 112 225 Z M113 207 L 132 209" {...seam} />
        {/* Dropped-shoulder armhole seams */}
        <path d="M102 154 C 109 178, 109 204, 103 224 M198 154 C 191 178, 191 204, 197 224" {...seam} opacity="0.3" />
        {/* Drape + shirttail shadow */}
        <path d="M112 180 C 109 240, 108 300, 109 352 M188 180 C 191 240, 192 300, 191 352 M138 200 C 136 260, 136 320, 137 368" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="2.8" strokeLinecap="round" />
        <path d="M100 357 C 122 368, 143 372, 150 372 C 157 372, 178 368, 200 357 L 200 366 C 178 376, 158 379, 150 379 C 142 379, 122 376, 100 366 Z" fill="rgba(0,0,0,0.07)" stroke="none" />
        {/* Light pass */}
        <path d="M122 176 C 119 240, 118 304, 120 362 L 133 366 C 131 304, 131 240, 134 178 Z" fill="rgba(255,255,255,0.08)" stroke="none" />
      </g>
    ),
  },
  {
    id: 'turtleneck',
    kind: 'top',
    label: 'Turtleneck',
    colorways: [
      { name: 'Black', hex: '#262220' },
      { name: 'Cream', hex: '#e8e0cf' },
      { name: 'Charcoal', hex: '#3a3733' },
      { name: 'Camel', hex: '#b08a55' },
      { name: 'Forest', hex: '#35523f' },
      { name: 'Burgundy', hex: '#64303a' },
    ],
    tileBox: '76 99 148 304',
    render: c => (
      <g>
        {/* Sleeves — fitted to the wrist, ribbed cuffs */}
        <path d="M104 151 C 91 190, 89 231, 91 268 C 89 308, 86 348, 87 376 L 100 379 C 101 348, 102 310, 103 270 C 107 232, 111 196, 113 161 Z" fill={c} {...outline} />
        <path d="M196 151 C 209 190, 211 231, 209 268 C 211 308, 214 348, 213 376 L 200 379 C 199 348, 198 310, 197 270 C 193 232, 189 196, 187 161 Z" fill={c} {...outline} />
        <path d="M86 375 L 101 378 L 100 392 L 87 389 Z" fill={c} {...outline} />
        <path d="M214 375 L 199 378 L 200 392 L 213 389 Z" fill={c} {...outline} />
        <path d="M90 378 L 90 390 M94 379 L 94 391 M97 379 L 97 391 M210 378 L 210 390 M206 379 L 206 391 M203 379 L 203 391" {...seam} />
        {/* Body — fitted through the waist */}
        <path d="M104 150 C 116 143, 128 138, 136 135 C 145 141, 155 141, 164 135 C 172 138, 184 143, 196 150 C 200 198, 188 250, 183 300 C 190 328, 194 340, 194 348 C 165 356, 135 356, 106 348 C 106 340, 110 328, 117 300 C 112 250, 100 198, 104 150 Z" fill={c} {...outline} />
        {/* Folded collar */}
        <path d="M137 112 C 145 108, 155 108, 163 112 L 164 136 C 155 142, 145 142, 136 136 Z" fill={c} {...outline} />
        <path d="M136 123 C 145 127, 155 127, 164 123" {...seam} />
        <path d="M141 113 L 141 124 M146 111 L 146 126 M150 111 L 150 126 M154 111 L 154 126 M159 113 L 159 124" {...seam} opacity="0.25" />
        {/* Fine rib */}
        <path d="M150 142 L 150 353 M134 142 C 135 220, 139 285, 135 352 M166 142 C 165 220, 161 285, 165 352 M126 146 C 128 225, 133 290, 127 351 M174 146 C 172 225, 167 290, 173 351 M118 152 C 121 228, 127 293, 119 349 M182 152 C 179 228, 173 293, 181 349" fill="none" stroke="#2b2620" strokeWidth="0.7" opacity="0.12" />
        {/* Underbust cling + side shadows */}
        <path d="M128 202 Q 140 209 150 208 M172 202 Q 160 209 150 208" fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M115 190 C 112 240, 118 290, 114 335 M185 190 C 188 240, 182 290, 186 335" fill="none" stroke="rgba(0,0,0,0.09)" strokeWidth="2.6" strokeLinecap="round" />
        {/* Hem stitch */}
        <path d="M108 342 C 136 350, 164 350, 192 342" {...seam} />
        {/* Light pass */}
        <path d="M130 170 C 127 230, 130 290, 128 344 L 139 346 C 137 292, 135 232, 139 172 Z" fill="rgba(255,255,255,0.08)" stroke="none" />
      </g>
    ),
  },
  {
    id: 'knit-sweater',
    kind: 'top',
    label: 'Fine-knit sweater',
    colorways: [
      { name: 'Oatmeal', hex: '#cfc4ad' },
      { name: 'Cream', hex: '#e8e0cf' },
      { name: 'Charcoal', hex: '#3a3733' },
      { name: 'Camel', hex: '#b08a55' },
      { name: 'Forest', hex: '#35523f' },
      { name: 'Burgundy', hex: '#64303a' },
    ],
    tileBox: '69 126 162 275',
    render: c => (
      <g>
        {/* Sleeves — relaxed, ribbed cuffs */}
        <path d="M104 151 C 87 192, 82 236, 84 274 C 81 312, 80 344, 81 370 L 100 374 C 101 344, 102 314, 102 276 C 106 238, 110 198, 113 161 Z" fill={c} {...outline} />
        <path d="M196 151 C 213 192, 218 236, 216 274 C 219 312, 220 344, 219 370 L 200 374 C 199 344, 198 314, 198 276 C 194 238, 190 198, 187 161 Z" fill={c} {...outline} />
        <path d="M80 369 L 101 373 L 100 390 L 81 386 Z" fill={c} {...outline} />
        <path d="M220 369 L 199 373 L 200 390 L 219 386 Z" fill={c} {...outline} />
        <path d="M85 372 L 85 386 M90 373 L 90 387 M95 374 L 95 388 M215 372 L 215 386 M210 373 L 210 387 M205 374 L 205 388" {...seam} />
        <path d="M92 210 C 88 250, 87 300, 88 350 M208 210 C 212 250, 213 300, 212 350" {...seam} opacity="0.2" />
        {/* Body — relaxed crew, ribbed hem band */}
        <path d="M104 150 C 116 144, 129 139, 137 136 C 144 144, 156 144, 163 136 C 171 139, 184 144, 196 150 C 200 200, 201 252, 200 300 C 200 316, 199 330, 198 340 C 166 347, 134 347, 102 340 C 101 330, 100 316, 100 300 C 99 252, 100 200, 104 150 Z" fill={c} {...outline} />
        {/* Rib neckband */}
        <path d="M139 139 C 144 147, 156 147, 161 139" {...seam} />
        <path d="M141 142 C 145 149, 155 149, 159 142" {...seam} opacity="0.25" />
        {/* Ribbed hem band */}
        <path d="M102 340 C 134 347, 166 347, 198 340 L 197 357 C 166 364, 134 364, 103 357 Z" fill={c} {...outline} />
        <path d="M110 344 L 110 359 M120 346 L 120 361 M130 347 L 130 362 M140 348 L 140 363 M150 348 L 150 363 M160 348 L 160 363 M170 347 L 170 362 M180 346 L 180 361 M190 344 L 190 359" {...seam} opacity="0.3" />
        {/* Drape */}
        <path d="M118 190 C 115 240, 114 290, 115 332 M182 190 C 185 240, 186 290, 185 332 M150 230 C 149 268, 149 304, 150 336" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="3" strokeLinecap="round" />
        {/* Light pass */}
        <path d="M128 172 C 125 230, 124 288, 126 336 L 138 338 C 136 288, 136 232, 139 174 Z" fill="rgba(255,255,255,0.08)" stroke="none" />
      </g>
    ),
  },
  {
    id: 'wrap-top',
    kind: 'top',
    label: 'Wrap top',
    colorways: [
      { name: 'Black', hex: '#26221f' },
      { name: 'Ivory', hex: '#eae1d2' },
      { name: 'Terracotta', hex: '#b0603f' },
      { name: 'Olive', hex: '#6b6a4f' },
      { name: 'Dusty rose', hex: '#c49898' },
    ],
    tileBox: '81 126 138 222',
    render: c => (
      <g>
        {/* Sleeves — fitted to the elbow */}
        <path d="M104 151 C 93 186, 91 220, 91 251 L 104 256 C 105 230, 108 199, 112 161 Z" fill={c} {...outline} />
        <path d="M196 151 C 207 186, 209 220, 209 251 L 196 256 C 195 230, 192 199, 188 161 Z" fill={c} {...outline} />
        <path d="M93 246 L 103 250 M207 246 L 197 250" {...seam} />
        {/* Body — surplice crossover */}
        <path d="M104 150 C 116 144, 128 139, 137 136 C 142 154, 147 170, 150 181 C 153 170, 158 154, 163 136 C 172 139, 184 144, 196 150 C 197 200, 191 250, 188 300 C 188 304, 187 307, 187 309 C 162 316, 138 316, 113 309 C 113 307, 112 304, 112 300 C 109 250, 103 200, 104 150 Z" fill={c} {...outline} />
        {/* Crossover edge sweeping to the tie */}
        <path d="M150 181 C 161 216, 172 258, 186 300" fill="none" stroke="#2b2620" strokeWidth="1.4" strokeLinecap="round" opacity="0.85" />
        {/* Gathers into the side tie */}
        <path d="M184 296 C 168 288, 152 284, 138 284 M185 301 C 168 298, 150 297, 134 298 M184 291 C 170 279, 156 272, 145 269" {...seam} opacity="0.3" />
        {/* Tie — knot + falling tails */}
        <path d="M185 296 C 190 295, 193 298, 192 303 C 188 306, 184 304, 183 300 Z" fill={c} {...outline} strokeWidth={1.4} />
        <path d="M187 304 C 191 314, 191 326, 187 336 L 182 334 C 185 325, 185 314, 183 305 Z" fill={c} {...outline} strokeWidth={1.4} />
        <path d="M190 303 C 197 310, 200 320, 199 330 L 194 330 C 194 321, 191 312, 186 306 Z" fill={c} {...outline} strokeWidth={1.4} />
        {/* Drape falling from the crossover */}
        <path d="M128 190 C 125 230, 124 268, 125 300 M160 210 C 158 240, 156 270, 155 300 M172 230 C 172 256, 171 282, 170 304" fill="none" stroke="rgba(0,0,0,0.09)" strokeWidth="2.6" strokeLinecap="round" />
        {/* Hem shadow + light pass */}
        <path d="M113 301 C 138 308, 162 308, 187 301 L 187 309 C 162 316, 138 316, 113 309 Z" fill="rgba(0,0,0,0.07)" stroke="none" />
        <path d="M124 170 C 129 210, 134 250, 136 292 L 146 294 C 143 252, 138 210, 133 168 Z" fill="rgba(255,255,255,0.09)" stroke="none" />
      </g>
    ),
  },
  {
    id: 'halter-top',
    kind: 'top',
    label: 'Halter top',
    colorways: [
      { name: 'Black', hex: '#26221f' },
      { name: 'Ivory', hex: '#eae1d2' },
      { name: 'Scarlet', hex: '#a4292e' },
      { name: 'Chocolate', hex: '#5c4534' },
      { name: 'Sage', hex: '#9aa48a' },
    ],
    tileBox: '96 98 108 222',
    render: c => (
      <g>
        {/* Neck ties — straps up and around, tails at the knot */}
        <path d="M140 113 C 133 132, 129 151, 127 170 L 137 174 C 139 155, 142 136, 147 119 Z" fill={c} {...outline} strokeWidth={1.5} />
        <path d="M160 113 C 167 132, 171 151, 173 170 L 163 174 C 161 155, 158 136, 153 119 Z" fill={c} {...outline} strokeWidth={1.5} />
        <path d="M142 110 C 147 107, 153 107, 158 110" fill="none" stroke="#2b2620" strokeWidth="1.4" strokeLinecap="round" opacity="0.8" />
        <path d="M159 111 C 165 114, 168 121, 166 129 L 162 127 C 163 121, 161 116, 157 113 Z" fill={c} {...outline} strokeWidth={1.3} />
        <path d="M160 110 C 168 110, 173 115, 174 122 L 170 123 C 168 117, 164 113, 158 112 Z" fill={c} {...outline} strokeWidth={1.3} />
        {/* Bodice — open shoulders, fitted to the waist */}
        <path d="M127 170 C 136 180, 164 180, 173 170 C 182 182, 189 194, 193 208 C 189 252, 184 278, 183 302 C 161 309, 139 309, 117 302 C 116 278, 111 252, 107 208 C 111 194, 118 182, 127 170 Z" fill={c} {...outline} />
        {/* Edge binding + bust darts */}
        <path d="M129 174 C 137 183, 163 183, 171 174" {...seam} />
        <path d="M132 226 C 134 214, 137 206, 141 200 M168 226 C 166 214, 163 206, 159 200" {...seam} opacity="0.35" />
        {/* Drape */}
        <path d="M122 226 C 120 254, 120 280, 121 298 M178 226 C 180 254, 180 280, 179 298 M150 200 C 149 234, 149 268, 150 300" fill="none" stroke="rgba(0,0,0,0.09)" strokeWidth="2.6" strokeLinecap="round" />
        {/* Hem shadow + stitch */}
        <path d="M117 294 C 139 301, 161 301, 183 294 L 183 302 C 161 309, 139 309, 117 302 Z" fill="rgba(0,0,0,0.07)" stroke="none" />
        <path d="M119 297 C 140 304, 160 304, 181 297" {...seam} />
        {/* Light pass */}
        <path d="M132 190 C 129 226, 128 262, 130 296 L 141 298 C 139 262, 139 226, 142 192 Z" fill="rgba(255,255,255,0.09)" stroke="none" />
      </g>
    ),
  },
  {
    id: 'tube-top',
    kind: 'top',
    label: 'Tube top',
    colorways: [
      { name: 'Black', hex: '#26221f' },
      { name: 'White', hex: '#f2efe9' },
      { name: 'Cocoa', hex: '#6b503c' },
      { name: 'Scarlet', hex: '#a4292e' },
    ],
    tileBox: '96 168 108 148',
    render: c => (
      <g>
        {/* Band — strapless, fitted to the waist */}
        <path d="M107 180 C 122 188, 178 188, 193 180 C 192 220, 187 258, 184 298 C 162 305, 138 305, 116 298 C 113 258, 108 220, 107 180 Z" fill={c} {...outline} />
        {/* Elastic top edge — double stitch */}
        <path d="M109 184 C 123 192, 177 192, 191 184 M110 189 C 124 196, 176 196, 190 189" {...seam} />
        {/* Side seams */}
        <path d="M112 196 C 114 232, 117 264, 119 294 M188 196 C 186 232, 183 264, 181 294" {...seam} opacity="0.3" />
        {/* Cling folds */}
        <path d="M116 214 C 134 220, 166 220, 184 214 M118 244 C 136 250, 164 250, 182 244 M120 272 C 137 277, 163 277, 180 272" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="2.6" strokeLinecap="round" />
        {/* Hem shadow */}
        <path d="M116 290 C 138 297, 162 297, 184 290 L 184 298 C 162 305, 138 305, 116 298 Z" fill="rgba(0,0,0,0.07)" stroke="none" />
        {/* Light pass */}
        <path d="M128 194 C 126 228, 126 262, 128 294 L 140 296 C 138 262, 138 228, 140 196 Z" fill="rgba(255,255,255,0.09)" stroke="none" />
      </g>
    ),
  },
  {
    id: 'puff-blouse',
    kind: 'top',
    label: 'Puff-sleeve blouse',
    colorways: [
      { name: 'White', hex: '#f4f1ea' },
      { name: 'Ivory', hex: '#ece3d3' },
      { name: 'Blush', hex: '#d8afa9' },
      { name: 'Sky', hex: '#b9cbdd' },
      { name: 'Black', hex: '#2a2724' },
    ],
    tileBox: '64 130 172 200',
    render: c => (
      <g>
        {/* Body — square neck */}
        <path d="M104 150 C 112 146, 122 142, 129 140 L 130 176 L 170 176 L 171 140 C 178 142, 188 146, 196 150 C 195 200, 190 252, 188 300 C 188 304, 187 307, 187 310 C 162 317, 138 317, 113 310 C 113 307, 112 304, 112 300 C 110 252, 105 200, 104 150 Z" fill={c} {...outline} />
        {/* Neckline facing */}
        <path d="M126 142 L 127 180 L 173 180 L 174 142" {...seam} />
        {/* Puff sleeves — gathered at cap and cuff */}
        <path d="M106 148 C 90 146, 77 158, 74 177 C 71 197, 80 213, 92 216 L 107 211 C 110 196, 112 178, 113 158 C 111 152, 109 149, 106 148 Z" fill={c} {...outline} />
        <path d="M194 148 C 210 146, 223 158, 226 177 C 229 197, 220 213, 208 216 L 193 211 C 190 196, 188 178, 187 158 C 189 152, 191 149, 194 148 Z" fill={c} {...outline} />
        {/* Cuff bands */}
        <path d="M91 216 L 107 211 L 109 219 L 93 224 Z" fill={c} {...outline} strokeWidth={1.4} />
        <path d="M209 216 L 193 211 L 191 219 L 207 224 Z" fill={c} {...outline} strokeWidth={1.4} />
        {/* Gathers at cap and above the cuff */}
        <path d="M96 154 C 92 168, 90 184, 90 200 M103 151 C 99 168, 97 186, 96 204 M95 206 L 94 213 M100 204 L 100 211 M105 202 L 105 209" {...seam} opacity="0.3" />
        <path d="M204 154 C 208 168, 210 184, 210 200 M197 151 C 201 168, 203 186, 204 204 M205 206 L 206 213 M200 204 L 200 211 M195 202 L 195 209" {...seam} opacity="0.3" />
        {/* Puff shading — shadow underside, light on top */}
        <path d="M78 190 C 80 203, 88 212, 97 213 L 96 217 C 85 216, 76 205, 75 191 Z" fill="rgba(0,0,0,0.08)" stroke="none" />
        <path d="M222 190 C 220 203, 212 212, 203 213 L 204 217 C 215 216, 224 205, 225 191 Z" fill="rgba(0,0,0,0.08)" stroke="none" />
        <path d="M80 160 C 86 152, 96 149, 105 151 L 104 156 C 96 154, 87 157, 82 164 Z" fill="rgba(255,255,255,0.11)" stroke="none" />
        <path d="M220 160 C 214 152, 204 149, 195 151 L 196 156 C 204 154, 213 157, 218 164 Z" fill="rgba(255,255,255,0.11)" stroke="none" />
        {/* Body drape + hem */}
        <path d="M120 195 C 117 235, 116 272, 117 302 M180 195 C 183 235, 184 272, 183 302 M150 200 C 149 238, 149 272, 150 306" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M113 302 C 138 309, 162 309, 187 302 L 187 310 C 162 317, 138 317, 113 310 Z" fill="rgba(0,0,0,0.07)" stroke="none" />
        {/* Light pass */}
        <path d="M128 186 C 125 226, 124 266, 126 304 L 137 306 C 135 266, 135 228, 138 188 Z" fill="rgba(255,255,255,0.08)" stroke="none" />
      </g>
    ),
  },
  {
    id: 'cardigan',
    kind: 'top',
    label: 'Cardigan',
    colorways: [
      { name: 'Oatmeal', hex: '#cfc4ad' },
      { name: 'Cream', hex: '#e8e0cf' },
      { name: 'Camel', hex: '#b08a55' },
      { name: 'Charcoal', hex: '#3a3733' },
      { name: 'Forest', hex: '#35523f' },
      { name: 'Black', hex: '#262220' },
    ],
    tileBox: '69 126 162 275',
    render: c => (
      <g>
        {/* Sleeves — relaxed, ribbed cuffs */}
        <path d="M104 151 C 88 192, 83 236, 85 274 C 82 312, 81 344, 82 370 L 101 374 C 102 344, 102 314, 103 276 C 106 238, 110 198, 113 161 Z" fill={c} {...outline} />
        <path d="M196 151 C 212 192, 217 236, 215 274 C 218 312, 219 344, 218 370 L 199 374 C 198 344, 198 314, 197 276 C 194 238, 190 198, 187 161 Z" fill={c} {...outline} />
        <path d="M81 369 L 102 373 L 101 390 L 82 386 Z" fill={c} {...outline} />
        <path d="M219 369 L 198 373 L 199 390 L 218 386 Z" fill={c} {...outline} />
        <path d="M86 372 L 86 386 M91 373 L 91 387 M96 374 L 96 388 M214 372 L 214 386 M209 373 L 209 387 M204 374 L 204 388" {...seam} />
        <path d="M93 210 C 89 250, 88 300, 89 350 M207 210 C 211 250, 212 300, 211 350" {...seam} opacity="0.2" />
        {/* Body — V-neck, buttoned through, ribbed hem */}
        <path d="M104 150 C 116 144, 128 139, 136 136 C 142 158, 147 176, 150 190 C 153 176, 158 158, 164 136 C 172 139, 184 144, 196 150 C 200 200, 201 250, 200 298 C 200 314, 199 328, 198 338 C 166 345, 134 345, 102 338 C 101 328, 100 314, 100 298 C 99 250, 100 200, 104 150 Z" fill={c} {...outline} />
        {/* Rib band along the V + placket */}
        <path d="M141 138 C 146 156, 150 170, 153 182 M159 138 C 154 156, 150 170, 147 182" {...seam} />
        <path d="M147 182 C 146 234, 146 288, 147 336 M153 182 C 154 234, 154 288, 153 336" {...seam} />
        <circle cx="150" cy="200" r="1.8" fill="#2b2620" opacity="0.5" />
        <circle cx="150" cy="228" r="1.8" fill="#2b2620" opacity="0.5" />
        <circle cx="150" cy="256" r="1.8" fill="#2b2620" opacity="0.5" />
        <circle cx="150" cy="284" r="1.8" fill="#2b2620" opacity="0.5" />
        <circle cx="150" cy="312" r="1.8" fill="#2b2620" opacity="0.5" />
        {/* Ribbed hem band */}
        <path d="M102 338 C 134 345, 166 345, 198 338 L 197 356 C 166 363, 134 363, 103 356 Z" fill={c} {...outline} />
        <path d="M110 342 L 110 358 M120 344 L 120 360 M130 345 L 130 361 M140 346 L 140 362 M160 346 L 160 362 M170 345 L 170 361 M180 344 L 180 360 M190 342 L 190 358" {...seam} opacity="0.3" />
        {/* Drape */}
        <path d="M116 190 C 113 240, 112 288, 113 330 M184 190 C 187 240, 188 288, 187 330 M132 210 C 130 252, 130 294, 131 332" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="2.8" strokeLinecap="round" />
        {/* Light pass */}
        <path d="M124 176 C 121 230, 120 284, 122 332 L 133 334 C 131 284, 131 232, 134 178 Z" fill="rgba(255,255,255,0.08)" stroke="none" />
      </g>
    ),
  },
]
