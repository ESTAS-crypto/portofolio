export interface CvContactItem {
  type: string;
  display: string;
  url: string;
}

export interface CvSkillGroup {
  category: string;
  skills: string[];
}

export interface CvStatItem {
  value: string;
  label: string;
}

export interface CvFeaturedProject {
  title: string;
  accentColor: string;
  tags: string[];
  description: string;
  displayUrl: string;
  url: string;
  result: string;
}

export interface CvOtherProject {
  title: string;
  tech: string;
  dotColor: string;
  url: string;
  description: string;
}

export interface CvMeta {
  title: string;
  author: string;
  subject: string;
  keywords: string;
  lang: string;
}

export interface CvData {
  name: string;
  role: string;
  country: string;
  summary: string;
  contacts: CvContactItem[];
  skillGroups: CvSkillGroup[];
  stats: CvStatItem[];
  sidebarQuote1: string;
  sidebarQuote2: string;
  sidebarQuote2Url: string;
  featuredProjects: CvFeaturedProject[];
  otherProjects: CvOtherProject[];
  footerNote: string;
  footerDisplayUrl: string;
  footerUrl: string;
  meta: CvMeta;
  updatedDate?: Date;
}

export interface CvPdfResult {
  bytes: Uint8Array;
  endY: number;
}
