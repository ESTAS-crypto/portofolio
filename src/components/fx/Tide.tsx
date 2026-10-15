import Ship from "@/components/fx/Ship";

interface TideProps {
  reducedMotion?: boolean;
}

export default function Tide({ reducedMotion = false }: TideProps) {
  return (
    <div className="tide" aria-hidden="true">
      <Ship reducedMotion={reducedMotion} />
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
