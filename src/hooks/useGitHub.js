import { GITHUB_USERNAME } from '../constants';

const CACHE_KEY = 'gh_portfolio_cache';
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

/**
 * Reads cached GitHub data from localStorage.
 * Returns null if cache is expired or missing.
 */
function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw);
    if (Date.now() - cached.timestamp > CACHE_TTL) return null;
    return cached.data;
  } catch {
    return null;
  }
}

/** Writes data to localStorage cache with current timestamp. */
function writeCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data }));
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

/**
 * Fetches GitHub profile + repos with localStorage caching.
 * Prevents rate-limiting (60 req/hr) during development.
 *
 * @returns {{ profile: object, repos: array }}
 */
export async function fetchGitHubData() {
  // 1. Try cache first
  const cached = readCache();
  if (cached) return cached;

  // 2. Fetch fresh data
  const [profileRes, reposRes] = await Promise.all([
    fetch(`https://api.github.com/users/${GITHUB_USERNAME}`),
    fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=pushed&per_page=8&direction=desc`),
  ]);

  if (!profileRes.ok || !reposRes.ok) {
    throw new Error(`GitHub API error: ${profileRes.status}`);
  }

  const profile = await profileRes.json();
  const reposRaw = await reposRes.json();

  if (!Array.isArray(reposRaw)) {
    throw new Error('GitHub API rate limit reached');
  }

  const repos = reposRaw
    .filter(r => r.name !== 'portofolio' && r.name !== GITHUB_USERNAME && r.size > 0)
    .slice(0, 6);

  const result = { profile, repos };

  // 3. Cache for next time
  writeCache(result);

  return result;
}
