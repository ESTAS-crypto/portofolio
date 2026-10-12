export default function Tide() {
  return (
    <div className="tide" aria-hidden="true">
      <div className="wv">
        <svg viewBox="0 0 2400 120" preserveAspectRatio="none">
          <use href="#wv" x="0" width="1200" height="120" />
          <use href="#wv" x="1200" width="1200" height="120" />
        </svg>
        <svg viewBox="0 0 2400 120" preserveAspectRatio="none">
          <use href="#wv" x="0" width="1200" height="120" />
          <use href="#wv" x="1200" width="1200" height="120" />
        </svg>
      </div>
      <div className="solid" style={{ minHeight: "140vh" }} />
    </div>
  );
}
