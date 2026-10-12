export interface ProjectStory {
  problem: string;
  solution: string;
  benefit: string;
}

export interface ProjectMedia {
  type: "image" | "video";
  src: string;
  alt: string;
}

export interface Project {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  url?: string;
  cta?: string;
  hue: number;
  priv?: boolean;
  story: ProjectStory;
  media?: ProjectMedia;
}

export interface DepthZone {
  key: "sky" | "surf" | "sun" | "twi";
  title: string;
  description: string;
  color: string;
  matches: (v: number) => boolean;
}

export interface StatItem {
  number: number;
  label: string;
}

export interface SocialLink {
  label: string;
  url: string;
}
