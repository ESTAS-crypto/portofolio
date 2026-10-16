import { projects } from "@/data/projects";
import { siteConfig } from "@/data/site";
import {
  CvData,
  CvFeaturedProject,
  CvOtherProject,
} from "./types";
import {
  CV_COLORS,
  CV_CONTACTS,
  CV_DEFAULT_META,
  CV_FEATURED_ACCENTS,
  CV_FOOTER,
  CV_LANGUAGE_DOT_COLORS,
  CV_OTHER_PROJECT_OVERRIDES,
  CV_SIDEBAR_QUOTES,
  CV_SKILL_GROUPS,
  CV_STATS,
} from "./cvConfig";

export function buildCvData(customDate?: Date): CvData {
  // 1. Featured projects (top 3)
  const featuredProjects: CvFeaturedProject[] = projects.slice(0, 3).map((p, idx) => {
    const isPrivate = p.priv || !p.url;
    const cleanDisplayUrl = p.url
      ? p.url.replace(/^https?:\/\//, "").replace(/\/$/, "")
      : "";

    // For Laporan Kunjungan Rumah, ensure tag ordering matches approved design
    const tags = p.slug === "laporan-kunjungan-rumah"
      ? ["Flutter", "Supabase", "Privat"]
      : p.tags;

    return {
      title: p.title,
      accentColor: CV_FEATURED_ACCENTS[idx] || CV_COLORS.GOLD2,
      tags,
      description: p.description,
      displayUrl: isPrivate ? "" : cleanDisplayUrl,
      url: isPrivate ? "" : p.url || "",
      result: p.story?.benefit || "",
    };
  });

  // 2. Other projects (index 3 and beyond)
  const otherProjects: CvOtherProject[] = projects.slice(3).map((p) => {
    const override = CV_OTHER_PROJECT_OVERRIDES[p.slug];
    const firstTag = p.tags[0] || "JavaScript";
    const dotColor =
      override?.dotColor ||
      CV_LANGUAGE_DOT_COLORS[firstTag] ||
      "#3B82C4";
    const tech = override?.tech || p.tags.join(", ");
    const description = override?.description || p.description;

    return {
      title: p.title,
      tech,
      dotColor,
      url: p.url || "",
      description,
    };
  });

  return {
    name: siteConfig.name,
    role: "FULL-STACK DEVELOPER",
    country: "Indonesia",
    summary:
      "Full-stack developer dari Indonesia yang membangun aplikasi web, bot, dan alat berbasis AI, dari toko online hingga manajemen keuangan. Saya suka antarmuka yang nyaman dan kode yang rapi.",
    contacts: CV_CONTACTS,
    skillGroups: CV_SKILL_GROUPS,
    stats: CV_STATS,
    sidebarQuote1: CV_SIDEBAR_QUOTES.quote1,
    sidebarQuote2: CV_SIDEBAR_QUOTES.quote2,
    sidebarQuote2Url: CV_SIDEBAR_QUOTES.quote2Url,
    featuredProjects,
    otherProjects,
    footerNote: CV_FOOTER.note,
    footerDisplayUrl: CV_FOOTER.displayUrl,
    footerUrl: CV_FOOTER.url,
    meta: CV_DEFAULT_META,
    updatedDate: customDate,
  };
}
