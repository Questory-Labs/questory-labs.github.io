export type Feature = {
  title: string;
  description: string;
};

export type FeatureGroup = {
  id: string;
  eyebrow: string;
  optional?: boolean;
  features: Feature[];
};

export type Screenshot = {
  id: string;
  title: string;
  group: string;
  optional?: boolean;
};

export type ScreenshotGroup = {
  id: string;
  eyebrow: string;
  optional?: boolean;
  shots: Screenshot[];
};

export const GITHUB_URL = "https://github.com/Questory-Labs/Questory";
export const SELF_HOST_PATH = "/self-hosting/";
export const SELF_HOST_REPO_URL =
  "https://github.com/Questory-Labs/Questory/blob/main/docs/self-hosting.md";
/** @deprecated Use SELF_HOST_PATH for on-site links */
export const SELF_HOST_URL = SELF_HOST_REPO_URL;
export const LICENSE_URL =
  "https://github.com/Questory-Labs/Questory/blob/main/LICENSE";

export const gameFeatures: Feature[] = [
  {
    title: "Dashboard",
    description:
      "Library overview — playtime, backlog, play-next picks, and deal signals in one place.",
  },
  {
    title: "Library",
    description:
      "Browse and filter your Steam collection with rich game detail pages.",
  },
  {
    title: "Wishlist",
    description:
      "Should-buy scores, price targets, and deal alerts across Steam, Epic, and GOG.",
  },
  {
    title: "Collections",
    description:
      "Smart shelves — Never Played, Hidden Gems, Couch Co-op, Steam Deck Ready — plus custom lists.",
  },
  {
    title: "Cost analytics",
    description:
      "Estimate library value and cost-per-hour from store prices, not purchase history.",
  },
  {
    title: "Friends",
    description: "Compare libraries with Steam friends and find mutual games.",
  },
  {
    title: "Multiplayer planner",
    description:
      "Find multiplayer games for your group with strict library match and filters.",
  },
  {
    title: "Family insights",
    description:
      "Browse shareable family libraries with ownership stats and combined views.",
  },
  {
    title: "Trending",
    description:
      "Friends' recent activity, Steam concurrent charts, Deck picks, and new releases.",
  },
  {
    title: "Search",
    description:
      "Search games, friends, and publishers with rich filters from the global header.",
  },
];

export const mediaGroups: FeatureGroup[] = [
  {
    id: "music",
    eyebrow: "Music",
    optional: true,
    features: [
      {
        title: "Listening pulse",
        description:
          "What's playing, when you listen, and what's shifting — from scrobble data.",
      },
      {
        title: "History & charts",
        description: "Day-grouped history plus weekly and monthly top artists and tracks.",
      },
      {
        title: "Insights",
        description: "Patterns across listening time, discovery, and scrobble sources.",
      },
      {
        title: "Multi-scrobbler ingest",
        description:
          "ListenBrainz-compatible API plus imports from Spotify, Last.fm, and more.",
      },
    ],
  },
  {
    id: "watch",
    eyebrow: "Watch",
    optional: true,
    features: [
      {
        title: "Movie & TV analytics",
        description:
          "Titles watched, streaks, completion rate, and weekly tops in one overview.",
      },
      {
        title: "History & insights",
        description:
          "Chronological watch history plus patterns across media types and sources.",
      },
      {
        title: "Title detail",
        description: "Per-title metadata, ratings, and watch history.",
      },
      {
        title: "Connected sources",
        description:
          "Trakt, Letterboxd, AniList, MAL, Plex/Jellyfin webhooks, and more.",
      },
    ],
  },
  {
    id: "read",
    eyebrow: "Read",
    optional: true,
    features: [
      {
        title: "Reading analytics",
        description:
          "Manga, manhwa, and print — chapters logged, completion rate, and streaks.",
      },
      {
        title: "Library & history",
        description: "Your series library and chronological reading activity.",
      },
      {
        title: "Insights",
        description: "Patterns across when you read, formats, and genres.",
      },
      {
        title: "Connected sources",
        description: "Sync from AniList, MAL, Kitsu, Bangumi, and Shikimori.",
      },
    ],
  },
];

export const screenshotGroups: ScreenshotGroup[] = [
  {
    id: "games",
    eyebrow: "Games",
    shots: [
      { id: "steam-dashboard", title: "Dashboard", group: "Games" },
      { id: "steam-wishlist", title: "Wishlist", group: "Games" },
      { id: "steam-cost", title: "Cost analytics", group: "Games" },
      { id: "steam-family", title: "Family insights", group: "Games" },
      {
        id: "steam-family-lic-conflicts",
        title: "Family license conflicts",
        group: "Games",
      },
      { id: "steam-multiplayer", title: "Multiplayer planner", group: "Games" },
      { id: "steam-trending", title: "Trending", group: "Games" },
    ],
  },
  {
    id: "music",
    eyebrow: "Music",
    optional: true,
    shots: [
      { id: "music-dashboard", title: "Dashboard", group: "Music", optional: true },
      { id: "music-listening", title: "Listening pulse", group: "Music", optional: true },
      { id: "music-top-charts", title: "Top charts", group: "Music", optional: true },
      {
        id: "music-album-insights",
        title: "Album insights",
        group: "Music",
        optional: true,
      },
      {
        id: "music-artist-insights",
        title: "Artist insights",
        group: "Music",
        optional: true,
      },
      {
        id: "music-track-insights",
        title: "Track insights",
        group: "Music",
        optional: true,
      },
      { id: "music-sources", title: "Sources", group: "Music", optional: true },
    ],
  },
  {
    id: "watch",
    eyebrow: "Watch",
    optional: true,
    shots: [
      { id: "watch-dashboard", title: "Dashboard", group: "Watch", optional: true },
      { id: "watch-history", title: "History", group: "Watch", optional: true },
      { id: "watch-sources", title: "Sources", group: "Watch", optional: true },
    ],
  },
  {
    id: "read",
    eyebrow: "Read",
    optional: true,
    shots: [
      { id: "read-dashboard", title: "Dashboard", group: "Read", optional: true },
    ],
  },
  {
    id: "qengine",
    eyebrow: "QEngine",
    optional: true,
    shots: [
      {
        id: "qengine-recommendations",
        title: "Recommendations",
        group: "QEngine",
        optional: true,
      },
      {
        id: "qengine-taste-fingerprint",
        title: "Taste fingerprint",
        group: "QEngine",
        optional: true,
      },
    ],
  },
  {
    id: "admin",
    eyebrow: "Admin",
    optional: true,
    shots: [
      { id: "admin-dashboard", title: "Dashboard", group: "Admin", optional: true },
      { id: "admin-users", title: "Users", group: "Admin", optional: true },
      { id: "admin-cron", title: "Cron jobs", group: "Admin", optional: true },
      {
        id: "admin-enrichment",
        title: "Enrichment",
        group: "Admin",
        optional: true,
      },
      { id: "admin-scrapers", title: "Scrapers", group: "Admin", optional: true },
      {
        id: "admin-qengine-traces",
        title: "QEngine traces",
        group: "Admin",
        optional: true,
      },
      {
        id: "admin-qengine-traces-list",
        title: "QEngine traces list",
        group: "Admin",
        optional: true,
      },
      {
        id: "admin-qengine-tokenomics",
        title: "QEngine tokenomics",
        group: "Admin",
        optional: true,
      },
    ],
  },
];

export const featuredScreenshotIds = [
  "steam-dashboard",
  "steam-wishlist",
  "music-dashboard",
  "watch-dashboard",
  "read-dashboard",
  "qengine-recommendations",
];

const screenshotById = new Map(
  screenshotGroups.flatMap((group) => group.shots).map((shot) => [shot.id, shot]),
);

export function getScreenshot(id: string): Screenshot | undefined {
  return screenshotById.get(id);
}

export function getFeaturedScreenshots(): Screenshot[] {
  return featuredScreenshotIds
    .map((id) => screenshotById.get(id))
    .filter((shot): shot is Screenshot => shot !== undefined);
}
