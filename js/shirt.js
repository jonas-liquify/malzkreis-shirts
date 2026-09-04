/* SVG-Vorschau des Shirts (Vorder-/Rückseite). Wird ersetzt, sobald echte Fotos in assets/ liegen. */
window.shirtSVG = function (side) {
  // Boxy Oversize-Schnitt
  const body = `
    <defs>
      <linearGradient id="shirtShade-${side}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#fff" stop-opacity=".35"/>
        <stop offset=".5" stop-color="#fff" stop-opacity="0"/>
        <stop offset="1" stop-color="#000" stop-opacity=".10"/>
      </linearGradient>
    </defs>
    <path class="shirt-body" d="M138 40 L182 28 C186 52 214 52 218 28 L262 40 L358 92 L340 156 L306 142 L308 362 L92 362 L94 142 L60 156 L42 92 Z"/>
    <path fill="url(#shirtShade-${side})" d="M138 40 L182 28 C186 52 214 52 218 28 L262 40 L358 92 L340 156 L306 142 L308 362 L92 362 L94 142 L60 156 L42 92 Z"/>
    <path class="shirt-seam" d="M182 28 C186 52 214 52 218 28"/>
    <path class="shirt-seam" d="M176 34 C182 62 218 62 224 34" ${side === "back" ? 'opacity=".5"' : ""}/>
    <path class="shirt-seam" d="M94 142 L306 142" opacity=".5"/>
    <path class="shirt-seam" d="M94 348 L306 348" opacity=".6"/>
    <path class="shirt-seam" d="M64 150 L94 136 M336 150 L306 136" opacity=".6"/>`;

  const front = `
    <g class="shirt-print">
      <text x="250" y="152" text-anchor="middle" class="print-text" font-size="16" textLength="54" lengthAdjust="spacingAndGlyphs">ULMER</text>
    </g>`;

  // Rückseite: Text-Stack, Münster-Linienzeichnung, Spatz, 1890
  const back = `
    <g class="shirt-print">
      <text x="136" y="128" class="print-text pop" font-size="9.5" font-weight="600" textLength="66" lengthAdjust="spacingAndGlyphs">Dear Barcelona,</text>
      <text x="136" y="156" class="print-text" font-size="27" textLength="126" lengthAdjust="spacingAndGlyphs">YOU CAN'T</text>
      <text x="136" y="184" class="print-text" font-size="27" textLength="66" lengthAdjust="spacingAndGlyphs">WIN</text>
      <text x="244" y="184" class="print-text" font-size="27" textLength="20" lengthAdjust="spacingAndGlyphs">A</text>
      <text x="136" y="212" class="print-text" font-size="27" textLength="70" lengthAdjust="spacingAndGlyphs">RACE</text>
      <text x="136" y="228" class="print-text" font-size="11.5" textLength="68" lengthAdjust="spacingAndGlyphs">THAT ENDED</text>
      <text x="248" y="228" class="print-text" font-size="11.5" textLength="14" lengthAdjust="spacingAndGlyphs">IN</text>

      <!-- Hauptturm -->
      <g class="print-stroke">
        <path d="M226 168 L226 160 M222 164 L230 164"/>                     <!-- Kreuz -->
        <path d="M226 168 L214 204 M226 168 L238 204"/>                     <!-- Spitze -->
        <path d="M217 196 L235 196 M219 188 L233 188 M221 180 L231 180"/>   <!-- Ringe -->
        <path d="M211 204 L241 204 L241 288 L211 288 Z"/>                    <!-- Turmschaft -->
        <path d="M211 204 L207 210 L207 288 M241 204 L245 210 L245 288"/>    <!-- Strebepfeiler -->
        <path d="M219 214 v18 a7 7 0 0 1 14 0 v-18 M219 232 h14"/>          <!-- Fenster -->
        <path d="M219 248 v16 a7 7 0 0 1 14 0 v-16"/>
        <path d="M222 272 v16 M230 272 v16"/>
        <path d="M207 214 L213 204 M245 214 L239 204"/>
      </g>
      <!-- Spatz -->
      <g class="print-stroke" stroke-width="1.8">
        <path d="M254 210 c-6 -6 -2 -14 6 -12 c2 -5 9 -4 10 1 c5 0 6 3 4 4 l-4 1 c1 6 -5 11 -12 9 c-3 3 -6 2 -6 0 Z"/>
        <path d="M272 201 l5 -1"/>
        <circle cx="267" cy="201" r=".9" class="print-fill"/>
        <path d="M258 213 l-4 4 M260 213 l-1 5"/>
      </g>
      <!-- Zwei kleine Türme -->
      <g class="print-stroke">
        <path d="M150 226 L150 219 M147 222 L153 222 M150 226 L142 250 M150 226 L158 250 M141 250 L159 250 L159 288 L141 288 Z M146 262 v10 a4 4 0 0 1 8 0 v-10"/>
        <path d="M176 230 L176 223 M173 226 L179 226 M176 230 L169 252 M176 230 L183 252 M168 252 L184 252 L184 288 L168 288 Z M172 264 v10 a4 4 0 0 1 8 0 v-10"/>
      </g>
      <!-- Langhaus mit Dach & Spitzbogenfenstern -->
      <g class="print-stroke">
        <path d="M159 262 L207 256 M159 268 L207 262"/>
        <path d="M184 262 L184 288 M159 288 L207 288"/>
        <path d="M163 288 v-12 a3 3 0 0 1 6 0 v12 M172 288 v-12 a3 3 0 0 1 6 0 v12 M189 288 v-12 a3 3 0 0 1 6 0 v12 M198 288 v-12 a3 3 0 0 1 6 0 v12"/>
        <path d="M134 288 L262 288"/>
        <path d="M134 284 L141 270 M262 284 L250 270"/>
      </g>
      <text x="200" y="326" text-anchor="middle" class="print-text" font-size="41" textLength="124" lengthAdjust="spacingAndGlyphs">1890</text>
    </g>`;

  return `<svg class="shirt-svg" viewBox="0 0 400 440" role="img" aria-label="${side === "back" ? "Rückseite" : "Vorderseite"} des Shirts">${body}${side === "back" ? back : front}</svg>`;
};
