"use client";

interface OrbitMockProps {
  title: string;
  tags: string[];
}

export default function OrbitMock({ title, tags }: OrbitMockProps) {
  return (
    <div className="pvis" aria-hidden="true">
      <div className="flt">
        <div className="mock" id="mock">
          <div className="mk-bar">
            <i />
            <i />
            <i />
          </div>
          <div className="mk-t" id="mkt">
            {title}
          </div>
          <b />
          <b />
        </div>

        <div className="orbit" id="orbit">
          {tags.map((tag, k) => (
            <span
              key={k}
              className="chip"
              style={{ "--k": k } as React.CSSProperties}
            >
              {tag}
            </span>
          ))}
          <s style={{ "--k": 2 } as React.CSSProperties} />
          <s style={{ "--k": 5 } as React.CSSProperties} />
          <s style={{ "--k": 8 } as React.CSSProperties} />
        </div>
      </div>
    </div>
  );
}
