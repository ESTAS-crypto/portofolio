'use client';

import { GITHUB_USERNAME } from '../constants';

const CACHE_KEY = 'gh_portfolio_cache_v2';
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

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

/** Names to exclude from the project list */
const EXCLUDED_REPOS = new Set([
  'portofolio',      // This portfolio itself
  GITHUB_USERNAME,   // Profile README repo
  'trash',           // Junk/temp repo
]);

/**
 * Fetches GitHub profile + ALL repos with localStorage caching.
 * Returns repos sorted by most recently pushed, filtered for quality.
 *
 * @returns {{ profile: object, repos: array }}
 */
export async function fetchGitHubData() {
  // 1. Try cache first
  const cached = readCache();
  if (cached) return cached;

  // 2. Fetch fresh data — get up to 100 repos (covers all public repos)
  const [profileRes, reposRes] = await Promise.all([
    fetch(`https://api.github.com/users/${GITHUB_USERNAME}`),
    fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=pushed&per_page=100&direction=desc`),
  ]);

  if (!profileRes.ok || !reposRes.ok) {
    throw new Error(`GitHub API error: ${profileRes.status}`);
  }

  const profile = await profileRes.json();
  const reposRaw = await reposRes.json();

  if (!Array.isArray(reposRaw)) {
    throw new Error('GitHub API rate limit reached');
  }

  // 3. Filter out excluded repos and empty ones, keep up to 9
  const repos = reposRaw
    .filter(r => !EXCLUDED_REPOS.has(r.name) && r.size > 0)
    .slice(0, 9);

  const result = { profile, repos };

  // 4. Cache for next time
  writeCache(result);

  return result;
}

/**
 * Force clear the cache — use when user updates repos and wants instant refresh.
 */
export function clearGitHubCache() {
  try {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem('gh_portfolio_cache'); // also clear old key
  } catch {
    // ignore
  }
}
