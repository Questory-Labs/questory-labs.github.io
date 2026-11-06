export type Frame = { id: string; title: string; note: string };

export type Act = {
  id: string;
  mark: string;
  title: string;
  accent: string;
  tint: string;
  logline: string;
  pan: string;
  panAlt: string;
  beats: { title: string; body: string }[];
  reel: Frame[];
};

export const acts: Act[] = [
  {
    id: "play",
    mark: "Act I",
    title: "Play",
    accent: "the backlog speaks.",
    tint: "143, 214, 196",
    logline: "The wall of games you bought on sale finally tells you something.",
    pan: "steam-dashboard-full",
    panAlt: "Questory home dashboard with time played, what's up next, and goals",
    beats: [
      { title: "One home screen", body: "Playtime, backlog, play-next picks and deal signals in one place." },
      { title: "Up next", body: "It knows what you left unfinished and what you never started." },
      { title: "Every shelf at once", body: "Games, music, shows and reading share one account and one database." },
    ],
    reel: [
      { id: "steam-library", title: "Library", note: "Filter the whole collection, down to what you never touched." },
      { id: "steam-game-detail", title: "Game detail", note: "Hours, cost per hour, achievements, every session." },
      { id: "steam-wishlist", title: "Wishlist", note: "Should-buy scores and deal alerts across Steam, Epic and GOG." },
      { id: "steam-cost", title: "Cost analytics", note: "Library value and cost-per-hour, from store prices." },
      { id: "steam-multiplayer", title: "Multiplayer planner", note: "What can everyone launch tonight?" },
      { id: "steam-friends", title: "Friends", note: "Compare libraries and find the overlap." },
      { id: "steam-family", title: "Family insights", note: "One family, one shelf, and who owns what." },
    ],
  },
  {
    id: "listen",
    mark: "Act II",
    title: "Listen",
    accent: "the year has a soundtrack.",
    tint: "240, 168, 184",
    logline: "Every scrobble, kept. Hear your year take shape.",
    pan: "music-dashboard-full",
    panAlt: "Questory music overview with now playing, listening time, and top artists",
    beats: [
      { title: "Listening pulse", body: "What's playing, when you listen, and what's shifting." },
      { title: "When you listen", body: "Your week as a heatmap, from the first track to the last." },
      { title: "Bring your history", body: "A ListenBrainz-compatible API, plus imports from Spotify, Last.fm and more." },
    ],
    reel: [
      { id: "music-listening", title: "Listening", note: "Every scrobble, newest first." },
      { id: "music-top-charts", title: "Top charts", note: "Artists, albums and tracks, ranked." },
      { id: "music-artist-insights", title: "Artist", note: "Peak hours, top songs, and when it started." },
      { id: "music-album-insights", title: "Album", note: "Time spent inside one record." },
      { id: "music-track-insights", title: "Track", note: "One song, every time you came back to it." },
    ],
  },
  {
    id: "watch",
    mark: "Act III",
    title: "Watch",
    accent: "every episode, accounted for.",
    tint: "230, 194, 122",
    logline: "Movies, TV and anime in one timeline, wherever you saw them.",
    pan: "watch-dashboard-full",
    panAlt: "Questory watch overview with continue watching, watch time, and most watched",
    beats: [
      { title: "Pick up where you stopped", body: "Continue watching across movies, TV and anime." },
      { title: "Your rhythm", body: "Streaks, completion rate, and the day of the week you binge." },
      { title: "Every source", body: "Trakt, Letterboxd, AniList, MAL, Plex and Jellyfin webhooks." },
    ],
    reel: [
      { id: "watch-history", title: "History", note: "Everything you watched, newest first." },
      { id: "watch-title", title: "Title detail", note: "Episodes, progress and your own history." },
    ],
  },
  {
    id: "read",
    mark: "Act IV",
    title: "Read",
    accent: "chapters, logged.",
    tint: "174, 185, 242",
    logline: "Manga, manhwa, novels. Mostly past midnight.",
    pan: "read-dashboard-full",
    panAlt: "Questory reading overview with currently reading, chapters logged, and formats",
    beats: [
      { title: "On the nightstand", body: "Everything you're in the middle of, front and centre." },
      { title: "When you read", body: "Chapters by hour, formats, and the sources behind them." },
      { title: "Sync your lists", body: "AniList, MAL, Kitsu, Bangumi and Shikimori." },
    ],
    reel: [
      { id: "read-library", title: "Library", note: "Every series and where you left it." },
      { id: "read-history", title: "History", note: "Every chapter, newest first." },
      { id: "read-title", title: "Title detail", note: "Your progress through one long story." },
    ],
  },
];

export const twist: Act = {
  id: "qengine",
  mark: "The twist",
  title: "It knows",
  accent: "your taste.",
  tint: "230, 194, 122",
  logline: "An opt-in Rust engine that plans your evening from what you actually play, hear, watch and read.",
  pan: "qengine-recommendations-full",
  panAlt: "Questory recommendations with a mood prompt, tonight's plan, and picks across media",
  beats: [
    { title: "Say what you're in the mood for", body: "A sentence is enough. It curates from your own shelves." },
    { title: "Tonight's plan", body: "Not a list. An order to do things in, with your taste fingerprint beside it." },
    { title: "Across everything", body: "Games, music, shows and reading ranked together." },
  ],
  reel: [],
};

export const finale: Act = {
  id: "rewind",
  mark: "Finale",
  title: "Rewind",
  accent: "the ending writes itself.",
  tint: "237, 237, 238",
  logline: "Every month, the whole story: everything you played, heard, watched and read.",
  pan: "unified-rewind-full",
  panAlt: "Questory unified rewind with total hours, a daily chart, and top games, artists and shows",
  beats: [
    { title: "One number", body: "All your time across games, music, watching and reading." },
    { title: "Told back to you", body: "Insights in plain sentences, not just another chart." },
    { title: "Yours to keep", body: "Download the share card, or just sit with it." },
  ],
  reel: [
    { id: "steam-rewind", title: "Games Rewind", note: "Hours, sessions, your peak night." },
    { id: "music-rewind", title: "Music Rewind", note: "Plays, new artists, longest streak." },
    { id: "watch-rewind", title: "Watch Rewind", note: "Every title in the month." },
    { id: "read-rewind", title: "Read Rewind", note: "Chapters, titles, late hours." },
  ],
};

export const heroWall: string[][] = [
  ["steam-library", "music-rewind", "qengine-recommendations", "read-library", "steam-wishlist"],
  ["steam-rewind", "watch-title", "steam-cost", "music-artist-insights", "read-dashboard"],
  ["watch-dashboard", "steam-multiplayer", "music-track-insights", "unified-rewind", "steam-game-detail"],
  ["read-rewind", "steam-friends", "music-top-charts", "watch-rewind", "steam-collections"],
];

export const credits: { role: string; names: string[] }[] = [
  { role: "Starring", names: ["Your library", "Your late nights", "That game you swore you'd finish"] },
  { role: "Games from", names: ["Steam", "Epic", "GOG"] },
  { role: "Music from", names: ["ListenBrainz", "multi-scrobbler", "Spotify", "Last.fm"] },
  { role: "Screen from", names: ["Trakt", "Letterboxd", "TMDB", "Plex", "Jellyfin"] },
  { role: "Pages from", names: ["AniList", "MyAnimeList", "Kitsu", "Bangumi", "Shikimori"] },
  { role: "Filmed on location", names: ["Your own hardware"] },
  { role: "Footage", names: ["Questory's built-in demo account, with sample data"] },
  { role: "Produced by", names: ["Questory Labs"] },
];
