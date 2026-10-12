export default function SvgSymbols() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <symbol id="cl" viewBox="0 0 200 80">
        <g fill="currentColor">
          <circle cx="60" cy="50" r="28" />
          <circle cx="98" cy="34" r="34" />
          <circle cx="138" cy="48" r="30" />
          <rect x="40" y="48" width="125" height="30" rx="15" />
        </g>
      </symbol>
      <symbol id="fish" viewBox="0 0 120 60">
        <g fill="currentColor">
          <path d="M34 30L3 8Q13 30 3 52Z" />
          <path d="M30 30Q55 2 92 10Q112 18 118 30Q112 42 92 50Q55 58 30 30Z" />
          <path d="M60 13Q70 1 82 11Z" opacity="0.7" />
        </g>
        <path
          d="M52 12Q60 30 52 49"
          stroke="#fff"
          strokeOpacity="0.35"
          strokeWidth="4"
          fill="none"
        />
        <circle cx="98" cy="26" r="5.5" fill="#fff" />
        <circle cx="99.5" cy="26" r="2.6" fill="#0a2a4a" />
      </symbol>
      <symbol id="wv" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d="M0 60C150 10 300 110 450 60S750 10 900 60S1050 110 1200 60V121H0Z" />
      </symbol>
    </svg>
  );
}
