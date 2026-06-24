export const brandIcons: Record<string, { logo: string; color: string }> = {
  netflix: { logo: 'https://cdn.simpleicons.org/netflix/E50914', color: '#E50914' },
  spotify: { logo: 'https://cdn.simpleicons.org/spotify/1DB954', color: '#1DB954' },
  amazon: { logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/amazon.svg', color: '#FF9900' },
  'amazon prime': { logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/primevideo.svg', color: '#00A8E1' },
  youtube: { logo: 'https://cdn.simpleicons.org/youtube/FF0000', color: '#FF0000' },
  'youtube premium': { logo: 'https://cdn.simpleicons.org/youtube/FF0000', color: '#FF0000' },
  hulu: { logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/hulu.svg', color: '#1CE783' },
  disney: { logo: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg', color: '#113CCF' },
  'disney+': { logo: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg', color: '#113CCF' },
  apple: { logo: 'https://cdn.simpleicons.org/apple/FFFFFF', color: '#555555' },
  'apple music': { logo: 'https://cdn.simpleicons.org/applemusic/FA243C', color: '#FA243C' },
  'apple tv': { logo: 'https://cdn.simpleicons.org/appletv/000000', color: '#000000' },
  google: { logo: 'https://cdn.simpleicons.org/google/4285F4', color: '#4285F4' },
  'google one': { logo: 'https://cdn.simpleicons.org/google/4285F4', color: '#4285F4' },
  microsoft: { logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/microsoft.svg', color: '#00A4EF' },
  xbox: { logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/xbox.svg', color: '#107C10' },
  playstation: { logo: 'https://cdn.simpleicons.org/playstation/003791', color: '#003791' },
  adobe: { logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/adobe.svg', color: '#FF0000' },
  'creative cloud': { logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/adobe.svg', color: '#DA1F26' },
  figma: { logo: 'https://cdn.simpleicons.org/figma/F24E1E', color: '#F24E1E' },
  chatgpt: { logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/openai.svg', color: '#412991' },
  openai: { logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/openai.svg', color: '#412991' },
  github: { logo: 'https://cdn.simpleicons.org/github/FFFFFF', color: '#333333' },
  'github copilot': { logo: 'https://cdn.simpleicons.org/githubcopilot/FFFFFF', color: '#333333' },
  notion: { logo: 'https://cdn.simpleicons.org/notion/FFFFFF', color: '#6B6B6B' },
  slack: { logo: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/slack.svg', color: '#4A154B' },
  zoom: { logo: 'https://cdn.simpleicons.org/zoom/0B5CFF', color: '#0B5CFF' },
  dropbox: { logo: 'https://cdn.simpleicons.org/dropbox/0061FF', color: '#0061FF' },
  'hbo max': { logo: 'https://cdn.simpleicons.org/hbo/FFFFFF', color: '#444444' },
  max: { logo: 'https://cdn.simpleicons.org/hbo/FFFFFF', color: '#444444' },
  paramount: { logo: 'https://cdn.simpleicons.org/paramountplus/0064FF', color: '#0064FF' },
  'paramount+': { logo: 'https://cdn.simpleicons.org/paramountplus/0064FF', color: '#0064FF' },
  peacock: { logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a0/NBCUniversal_Peacock_Logo_%282026%3B_icon%29.svg', color: '#00B140' },
  'peacock tv': { logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a0/NBCUniversal_Peacock_Logo_%282026%3B_icon%29.svg', color: '#00B140' },
};

export function getBrandInfo(merchantName: string): { logo: string; color: string } {
  const normalized = merchantName.trim().toLowerCase();
  
  if (brandIcons[normalized]) {
    return brandIcons[normalized];
  }

  // Generate a random color based on the string hash so it's consistent
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = normalized.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = `#${((hash & 0x00FFFFFF) | 0x444444).toString(16).padStart(6, '0')}`;

  // Default fallback if not found
  return { 
    logo: '📦', 
    color 
  };
}
