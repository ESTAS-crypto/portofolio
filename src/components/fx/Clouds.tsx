export const cloudsConfig = [
  { d: -1, s: 1.1, style: { top: "12%", left: "4%", width: "300px" } },
  { d: 1, s: 0.8, style: { top: "20%", right: "30%", width: "200px" } },
  { d: -1, s: 0.7, style: { top: "46%", left: "34%", width: "240px" } },
  { d: 1, s: 1.2, style: { top: "52%", right: "2%", width: "340px" } },
  { d: -1, s: 0.9, style: { top: "62%", left: "-4%", width: "280px" } },
];

export default function Clouds() {
  return (
    <>
      {cloudsConfig.map((c, i) => (
        <div
          key={i}
          className="cl"
          data-d={c.d}
          data-s={c.s}
          style={c.style}
        >
          <svg viewBox="0 0 200 80">
            <use href="#cl" />
          </svg>
        </div>
      ))}
    </>
  );
}
