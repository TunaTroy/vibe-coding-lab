import { useId } from "react";

/** Original academy guardian, drawn as layered SVG so poses stay light and responsive. */
export default function BossCharacter({ pose = "idle", className = "" }) {
  const uid = useId().replace(/:/g, "");
  const stone = `url(#${uid}-stone)`;
  const face = `url(#${uid}-face)`;
  const gold = `url(#${uid}-gold)`;
  const scarf = `url(#${uid}-scarf)`;

  return (
    <svg
      className={`guardian guardian--${pose} ${className}`}
      viewBox="0 0 400 440"
      role="img"
      aria-label="Người Gác Ngữ Pháp, vị Boss đá thân thiện của học viện bóng đá"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`${uid}-stone`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#f6dfaa" />
          <stop offset=".36" stopColor="#a6a38c" />
          <stop offset=".72" stopColor="#707c70" />
          <stop offset="1" stopColor="#3a5550" />
        </linearGradient>
        <linearGradient id={`${uid}-face`} x1="0" y1="0" x2=".7" y2="1">
          <stop stopColor="#fff0bd" />
          <stop offset=".5" stopColor="#c8bf9b" />
          <stop offset="1" stopColor="#738677" />
        </linearGradient>
        <linearGradient id={`${uid}-gold`} x1="0" y1="0" x2=".8" y2="1">
          <stop stopColor="#fff2a0" />
          <stop offset=".48" stopColor="#e0a82e" />
          <stop offset="1" stopColor="#895b17" />
        </linearGradient>
        <linearGradient id={`${uid}-scarf`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#fa6545" />
          <stop offset=".48" stopColor="#c7192d" />
          <stop offset="1" stopColor="#701020" />
        </linearGradient>
        <filter id={`${uid}-shadow`} x="-30%" y="-30%" width="160%" height="170%">
          <feDropShadow dx="0" dy="12" stdDeviation="11" floodColor="#050a0b" floodOpacity=".55" />
        </filter>
      </defs>

      <ellipse cx="200" cy="414" rx="143" ry="17" fill="#041713" opacity=".55" className="guardian-ground-shadow" />
      <g className="guardian-body" filter={`url(#${uid}-shadow)`}>
        <g className="guardian-leg guardian-leg--left">
          <path d="M124 324 176 324 174 382 153 397 114 389Z" fill={stone} stroke="#34423d" strokeWidth="7" strokeLinejoin="round" />
          <path d="M112 379 159 387 170 406 95 406 93 395Z" fill="#40554c" stroke="#263a36" strokeWidth="6" strokeLinejoin="round" />
          <path d="M106 393h53" stroke="#e2ae42" strokeWidth="5" strokeLinecap="round" />
        </g>
        <g className="guardian-leg guardian-leg--right">
          <path d="M221 324 275 316 288 379 261 397 225 383Z" fill={stone} stroke="#34423d" strokeWidth="7" strokeLinejoin="round" />
          <path d="M238 383 284 378 311 396 306 407 230 407Z" fill="#40554c" stroke="#263a36" strokeWidth="6" strokeLinejoin="round" />
          <path d="M239 394h58" stroke="#e2ae42" strokeWidth="5" strokeLinecap="round" />
        </g>

        <g className="guardian-arm guardian-arm--left">
          <path d="M111 222 73 218 46 251 56 304 87 310 117 278Z" fill={stone} stroke="#354940" strokeWidth="8" strokeLinejoin="round" />
          <path d="M68 242 43 248 34 280 48 305 77 307 92 282Z" fill={face} stroke="#344b41" strokeWidth="7" strokeLinejoin="round" />
          <path d="m50 263 29 6m-32 15 31 3" stroke="#677f6a" strokeWidth="5" strokeLinecap="round" />
          <path d="M83 231 58 232 49 248 88 252Z" fill={gold} stroke="#81551a" strokeWidth="4" />
        </g>
        <g className="guardian-arm guardian-arm--right">
          <path d="M284 217 324 219 352 254 344 306 310 311 281 274Z" fill={stone} stroke="#354940" strokeWidth="8" strokeLinejoin="round" />
          <path d="M330 242 357 249 368 278 355 306 326 309 308 282Z" fill={face} stroke="#344b41" strokeWidth="7" strokeLinejoin="round" />
          <path d="m321 266 31-5m-29 24 31-3" stroke="#677f6a" strokeWidth="5" strokeLinecap="round" />
          <path d="M315 229 341 234 350 250 309 251Z" fill={gold} stroke="#81551a" strokeWidth="4" />
        </g>

        <path d="M117 212q35-30 83-29 52-2 84 30l13 107q-40 39-98 43-60-3-99-43Z" fill={stone} stroke="#34483e" strokeWidth="9" strokeLinejoin="round" />
        <path d="M132 238q62 22 136 0l10 75q-30 30-79 35-46-4-78-35Z" fill="#55685d" stroke="#32483e" strokeWidth="5" />
        <path d="m122 273 27-15 18 9m114 8-24-16-17 9" fill="none" stroke="#f3dd9e" strokeOpacity=".55" strokeWidth="5" strokeLinecap="round" />
        <path d="m116 309 22-12 16 14-7 28m143-30-21-11-18 12 7 28" fill="none" stroke="#34453d" strokeWidth="5" strokeLinecap="round" />

        <g className="guardian-crest">
          <path d="M200 239 248 255 243 304q-12 31-43 44-31-13-43-44l-5-49Z" fill="#8c1428" stroke={gold} strokeWidth="7" />
          <path d="M174 273q12-3 26 4 14-7 27-4v35q-14-4-27 4-13-8-26-4Z" fill="#fff0bc" stroke="#e3b443" strokeWidth="3" strokeLinejoin="round" />
          <path d="M200 277v35m-18-31 12 3m12 0 12-3" stroke="#8e1726" strokeWidth="3" strokeLinecap="round" />
          <circle cx="200" cy="252" r="7" fill="#fff3bc" />
        </g>

        <g className="guardian-scarf">
          <path d="M124 209q73-28 152 0l-14 39q-66 23-124-1Z" fill={scarf} stroke="#7a1523" strokeWidth="6" />
          <path d="M254 219q22-11 37-8l42 32-26 18-34-13Z" fill={scarf} stroke="#7a1523" strokeWidth="5" strokeLinejoin="round" />
          <path d="m301 234 14 13" stroke="#f7c466" strokeWidth="5" strokeLinecap="round" />
          <path d="M142 225q61 18 112 0" fill="none" stroke="#ff9a70" strokeOpacity=".75" strokeWidth="5" strokeLinecap="round" />
        </g>

        <g className="guardian-head">
          <path d="M90 85 118 65 142 70 157 46 196 52 216 41 247 57 270 55 297 82 310 141 294 203q-39 39-93 43-55-3-96-43L88 141Z" fill={face} stroke="#344a41" strokeWidth="10" strokeLinejoin="round" />
          <path d="M91 87 119 67 142 72 157 49 196 55 216 44 247 60 270 58 297 84l10 45q-52-14-108-12-54-2-106 12Z" fill={stone} stroke="#344a41" strokeWidth="7" strokeLinejoin="round" />
          <path d="M111 85q42 8 83 8 48 2 88-9" fill="none" stroke="#ffedba" strokeOpacity=".7" strokeWidth="6" strokeLinecap="round" />
          <path d="m121 75 16 12m26-28 13 25m42-29-7 29m55-20-18 22" stroke="#587369" strokeWidth="5" strokeLinecap="round" />
          <path d="M89 125 72 141 79 183 101 188m210-63 17 15-8 43-22 5" fill={stone} stroke="#344a41" strokeWidth="7" strokeLinejoin="round" />
          <path d="m106 179 14 17 25 2m150-18-17 18-25 3" fill="none" stroke="#e8ce91" strokeOpacity=".7" strokeWidth="5" strokeLinecap="round" />
          <path d="M119 214q81 32 163 0" fill="none" stroke="#465d50" strokeWidth="6" strokeLinecap="round" />

          <g className="guardian-face-idle">
            <path d="M135 135q21-13 42 0m47 0q23-13 43 0" fill="none" stroke="#3d5246" strokeWidth="10" strokeLinecap="round" />
            <ellipse cx="157" cy="159" rx="21" ry="22" fill="#fff7d8" />
            <ellipse cx="246" cy="159" rx="21" ry="22" fill="#fff7d8" />
            <ellipse cx="161" cy="163" rx="9" ry="12" fill="#244e49" />
            <ellipse cx="243" cy="163" rx="9" ry="12" fill="#244e49" />
            <circle cx="165" cy="158" r="4" fill="#fff" /><circle cx="247" cy="158" r="4" fill="#fff" />
            <path d="M174 201q28 22 56 0" fill="none" stroke="#435245" strokeWidth="7" strokeLinecap="round" />
          </g>
          <g className="guardian-face-attack">
            <path d="m133 134 45 16m92-16-45 16" stroke="#3d5246" strokeWidth="10" strokeLinecap="round" />
            <ellipse cx="157" cy="168" rx="16" ry="18" fill="#fff7d8" /><ellipse cx="245" cy="168" rx="16" ry="18" fill="#fff7d8" />
            <circle cx="161" cy="171" r="9" fill="#244e49" /><circle cx="242" cy="171" r="9" fill="#244e49" />
            <path d="M181 213q20-15 40 0" fill="none" stroke="#435245" strokeWidth="7" strokeLinecap="round" />
          </g>
          <g className="guardian-face-low">
            <path d="M139 151q19-8 36 0m53 0q18-8 37 0" fill="none" stroke="#3d5246" strokeWidth="9" strokeLinecap="round" />
            <path d="M140 166q17 11 35 0m53 0q18 11 36 0" fill="none" stroke="#f8edcc" strokeWidth="12" strokeLinecap="round" />
            <path d="M181 209q20-7 39 0" fill="none" stroke="#435245" strokeWidth="6" strokeLinecap="round" />
          </g>
          <g className="guardian-face-defeated">
            <path d="M137 161q18 20 39 0m51 0q18 20 39 0" fill="none" stroke="#40564a" strokeWidth="8" strokeLinecap="round" />
            <path d="M171 201q30 28 61 0" fill="none" stroke="#40564a" strokeWidth="7" strokeLinecap="round" />
          </g>

          <path d="m111 102-16 20 12 12m183-30 16 20-12 12" fill={gold} stroke="#805b25" strokeWidth="4" strokeLinejoin="round" />
          <path d="M187 76h26l-4 19h-18Z" fill="#a8182a" stroke={gold} strokeWidth="4" />
          <path d="m195 81 5 8 5-8" fill="none" stroke="#fff0b2" strokeWidth="3" strokeLinecap="round" />
          <path d="m114 185 17-9 13 5m148 4-18-9-12 5" fill="none" stroke="#537167" strokeWidth="4" strokeLinecap="round" />
          <path className="guardian-crack" d="m272 97-11 13 9 11-14 12m-142 36 12-9-5-13" fill="none" stroke="#493f35" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </g>
    </svg>
  );
}
