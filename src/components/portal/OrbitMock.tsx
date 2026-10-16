"use client";

import { useState } from "react";

interface OrbitMockProps {
  title: string;
  tags: string[];
  slug?: string;
}

export default function OrbitMock({ title, tags, slug }: OrbitMockProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="pvis" aria-hidden="true">
      <div className="flt">
        {slug && !imgError ? (
          <div className="mock mock-shot" id="mock">
            <div className="mk-bar">
              <i />
              <i />
              <i />
              <span className="mk-url">evan-atharasya.dev/proyek/{slug}</span>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/projects/${slug}/cover.png`}
              alt={`Screenshot ${title}`}
              className="mk-img"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          </div>
        ) : (
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
        )}

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
