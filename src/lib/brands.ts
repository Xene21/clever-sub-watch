const si = (slug: string, color: string) =>
  `https://cdn.simpleicons.org/${slug}/${color}`;

// ─── Category constants ────────────────────────────────────────────────────────
// These are the canonical category strings used throughout the app.
export const CATEGORIES = {
  STREAMING:     'Streaming',
  MUSIC:         'Music',
  GAMING:        'Gaming',
  PRODUCTIVITY:  'Productivity',
  CLOUD:         'Cloud Storage',
  AI:            'AI Tools',
  FINANCE:       'Finance',
  FITNESS:       'Fitness',
  FOOD:          'Food & Drink',
  NEWS:          'News & Reading',
  EDUCATION:     'Education',
  TRANSPORT:     'Transport',
  TELECOM:       'Telecom',
  SECURITY:      'Security',
  SHOPPING:      'Shopping',
  SOCIAL:        'Social & Dating',
  OTHER:         'Other',
} as const;

export type Category = typeof CATEGORIES[keyof typeof CATEGORIES];

// ─── Brand dictionary ──────────────────────────────────────────────────────────
export const brandIcons: Record<string, { logo: string; color: string; category: Category }> = {
  // ── Streaming (Video) ────────────────────────────────────────────────────
  netflix:            { logo: si('netflix', 'E50914'),          color: '#E50914',  category: CATEGORIES.STREAMING },
  hulu:               { logo: si('hulu', '1CE783'),             color: '#1CE783',  category: CATEGORIES.STREAMING },
  disney:             { logo: si('disneyplus', '113CCF'),       color: '#113CCF',  category: CATEGORIES.STREAMING },
  'disney+':          { logo: si('disneyplus', '113CCF'),       color: '#113CCF',  category: CATEGORIES.STREAMING },
  'hbo max':          { logo: si('hbo', 'B400FF'),              color: '#5822B4',  category: CATEGORIES.STREAMING },
  max:                { logo: si('hbo', 'B400FF'),              color: '#5822B4',  category: CATEGORIES.STREAMING },
  'paramount+':       { logo: si('paramountplus', '0064FF'),    color: '#0064FF',  category: CATEGORIES.STREAMING },
  paramount:          { logo: si('paramountplus', '0064FF'),    color: '#0064FF',  category: CATEGORIES.STREAMING },
  peacock:            { logo: si('nbc', 'FA2D48'),              color: '#FA2D48',  category: CATEGORIES.STREAMING },
  'apple tv':         { logo: si('appletv', '000000'),          color: '#333333',  category: CATEGORIES.STREAMING },
  'apple tv+':        { logo: si('appletv', '000000'),          color: '#333333',  category: CATEGORIES.STREAMING },
  'amazon prime':     { logo: si('primevideo', '00A8E1'),       color: '#00A8E1',  category: CATEGORIES.STREAMING },
  'prime video':      { logo: si('primevideo', '00A8E1'),       color: '#00A8E1',  category: CATEGORIES.STREAMING },
  youtube:            { logo: si('youtube', 'FF0000'),          color: '#FF0000',  category: CATEGORIES.STREAMING },
  'youtube premium':  { logo: si('youtube', 'FF0000'),          color: '#FF0000',  category: CATEGORIES.STREAMING },
  twitch:             { logo: si('twitch', '9146FF'),           color: '#9146FF',  category: CATEGORIES.STREAMING },
  crunchyroll:        { logo: si('crunchyroll', 'F47521'),      color: '#F47521',  category: CATEGORIES.STREAMING },
  'discovery+':       { logo: si('discovery', '0078FF'),        color: '#0078FF',  category: CATEGORIES.STREAMING },
  dazn:               { logo: si('dazn', 'F8FF00'),             color: '#F8FF00',  category: CATEGORIES.STREAMING },
  mubi:               { logo: si('mubi', 'FF3C2E'),             color: '#FF3C2E',  category: CATEGORIES.STREAMING },
  'now tv':           { logo: si('sky', '0072C9'),              color: '#00D287',  category: CATEGORIES.STREAMING },
  nowtv:              { logo: si('sky', '0072C9'),              color: '#00D287',  category: CATEGORIES.STREAMING },
  'sky go':           { logo: si('sky', '0072C9'),              color: '#0072C9',  category: CATEGORIES.STREAMING },
  sky:                { logo: si('sky', '0072C9'),              color: '#0072C9',  category: CATEGORIES.STREAMING },
  'bbc iplayer':      { logo: si('bbc', 'FF6B00'),              color: '#FF6B00',  category: CATEGORIES.STREAMING },
  bbc:                { logo: si('bbc', 'FF6B00'),              color: '#FF6B00',  category: CATEGORIES.STREAMING },
  britbox:            { logo: si('britbox', '264A92'),          color: '#264A92',  category: CATEGORIES.STREAMING },
  shudder:            { logo: si('shudder', 'FF0000'),          color: '#FF0000',  category: CATEGORIES.STREAMING },
  plex:               { logo: si('plex', 'E5A00D'),             color: '#E5A00D',  category: CATEGORIES.STREAMING },

  // ── Music / Audio / Podcasts ─────────────────────────────────────────────
  spotify:            { logo: si('spotify', '1DB954'),          color: '#1DB954',  category: CATEGORIES.MUSIC },
  'apple music':      { logo: si('applemusic', 'FA243C'),       color: '#FA243C',  category: CATEGORIES.MUSIC },
  'amazon music':     { logo: si('amazonmusic', '25D1DA'),      color: '#25D1DA',  category: CATEGORIES.MUSIC },
  tidal:              { logo: si('tidal', '000000'),            color: '#00FFFF',  category: CATEGORIES.MUSIC },
  deezer:             { logo: si('deezer', 'FEAA2D'),           color: '#FEAA2D',  category: CATEGORIES.MUSIC },
  soundcloud:         { logo: si('soundcloud', 'FF5500'),       color: '#FF5500',  category: CATEGORIES.MUSIC },
  pandora:            { logo: si('pandora', '3668FF'),          color: '#3668FF',  category: CATEGORIES.MUSIC },

  // ── Gaming ───────────────────────────────────────────────────────────────
  xbox:               { logo: si('xbox', '107C10'),             color: '#107C10',  category: CATEGORIES.GAMING },
  'xbox game pass':   { logo: si('xbox', '107C10'),             color: '#107C10',  category: CATEGORIES.GAMING },
  playstation:        { logo: si('playstation', '003791'),      color: '#003791',  category: CATEGORIES.GAMING },
  'playstation plus': { logo: si('playstation', '003791'),      color: '#003791',  category: CATEGORIES.GAMING },
  'ps plus':          { logo: si('playstation', '003791'),      color: '#003791',  category: CATEGORIES.GAMING },
  nintendo:           { logo: si('nintendo', 'E4000F'),         color: '#E4000F',  category: CATEGORIES.GAMING },
  'nintendo switch':  { logo: si('nintendoswitch', 'E4000F'),   color: '#E4000F',  category: CATEGORIES.GAMING },
  'ea play':          { logo: si('ea', 'FF4747'),               color: '#FF4747',  category: CATEGORIES.GAMING },
  steam:              { logo: si('steam', '000000'),            color: '#1B2838',  category: CATEGORIES.GAMING },
  'epic games':       { logo: si('epicgames', '313131'),        color: '#313131',  category: CATEGORIES.GAMING },
  'epic games store': { logo: si('epicgames', '313131'),        color: '#313131',  category: CATEGORIES.GAMING },

  // ── Productivity / Software ───────────────────────────────────────────────
  microsoft:          { logo: si('microsoft', '00A4EF'),        color: '#00A4EF',  category: CATEGORIES.PRODUCTIVITY },
  'microsoft 365':    { logo: si('microsoftoffice', 'EA3E23'),  color: '#EA3E23',  category: CATEGORIES.PRODUCTIVITY },
  'office 365':       { logo: si('microsoftoffice', 'EA3E23'),  color: '#EA3E23',  category: CATEGORIES.PRODUCTIVITY },
  adobe:              { logo: si('adobe', 'FF0000'),            color: '#FF0000',  category: CATEGORIES.PRODUCTIVITY },
  'creative cloud':   { logo: si('adobe', 'DA1F26'),            color: '#DA1F26',  category: CATEGORIES.PRODUCTIVITY },
  figma:              { logo: si('figma', 'F24E1E'),            color: '#F24E1E',  category: CATEGORIES.PRODUCTIVITY },
  notion:             { logo: si('notion', 'FFFFFF'),           color: '#6B6B6B',  category: CATEGORIES.PRODUCTIVITY },
  slack:              { logo: si('slack', '4A154B'),            color: '#4A154B',  category: CATEGORIES.PRODUCTIVITY },
  zoom:               { logo: si('zoom', '0B5CFF'),             color: '#0B5CFF',  category: CATEGORIES.PRODUCTIVITY },
  dropbox:            { logo: si('dropbox', '0061FF'),          color: '#0061FF',  category: CATEGORIES.PRODUCTIVITY },
  github:             { logo: si('github', 'FFFFFF'),           color: '#333333',  category: CATEGORIES.PRODUCTIVITY },
  'github copilot':   { logo: si('githubcopilot', 'FFFFFF'),    color: '#333333',  category: CATEGORIES.AI },
  chatgpt:            { logo: si('openai', '412991'),           color: '#412991',  category: CATEGORIES.AI },
  openai:             { logo: si('openai', '412991'),           color: '#412991',  category: CATEGORIES.AI },
  'claude ai':        { logo: si('anthropic', 'D4A574'),        color: '#C9661E',  category: CATEGORIES.AI },
  anthropic:          { logo: si('anthropic', 'D4A574'),        color: '#C9661E',  category: CATEGORIES.AI },
  grammarly:          { logo: si('grammarly', '15C39A'),        color: '#15C39A',  category: CATEGORIES.PRODUCTIVITY },
  evernote:           { logo: si('evernote', '00A82D'),         color: '#00A82D',  category: CATEGORIES.PRODUCTIVITY },
  todoist:            { logo: si('todoist', 'E44232'),          color: '#E44232',  category: CATEGORIES.PRODUCTIVITY },
  trello:             { logo: si('trello', '0052CC'),           color: '#0052CC',  category: CATEGORIES.PRODUCTIVITY },
  asana:              { logo: si('asana', 'F06A6A'),            color: '#F06A6A',  category: CATEGORIES.PRODUCTIVITY },
  monday:             { logo: si('mondaydotcom', 'F62B54'),     color: '#F62B54',  category: CATEGORIES.PRODUCTIVITY },
  canva:              { logo: si('canva', '00C4CC'),            color: '#00C4CC',  category: CATEGORIES.PRODUCTIVITY },
  '1password':        { logo: si('1password', '1A8CFF'),        color: '#1A8CFF',  category: CATEGORIES.SECURITY },
  lastpass:           { logo: si('lastpass', 'D32D27'),         color: '#D32D27',  category: CATEGORIES.SECURITY },
  bitwarden:          { logo: si('bitwarden', '175DDC'),        color: '#175DDC',  category: CATEGORIES.SECURITY },
  nordvpn:            { logo: si('nordvpn', '4687FF'),          color: '#4687FF',  category: CATEGORIES.SECURITY },
  expressvpn:         { logo: si('expressvpn', 'DA3940'),       color: '#DA3940',  category: CATEGORIES.SECURITY },
  surfshark:          { logo: si('surfshark', '1E1E1E'),        color: '#1DBAC9',  category: CATEGORIES.SECURITY },
  dashlane:           { logo: si('dashlane', '004FF9'),         color: '#004FF9',  category: CATEGORIES.SECURITY },
  webflow:            { logo: si('webflow', '146EF5'),          color: '#146EF5',  category: CATEGORIES.PRODUCTIVITY },
  squarespace:        { logo: si('squarespace', 'FFFFFF'),      color: '#333333',  category: CATEGORIES.PRODUCTIVITY },
  wix:                { logo: si('wix', '000000'),              color: '#FAAD4D',  category: CATEGORIES.PRODUCTIVITY },
  wordpress:          { logo: si('wordpress', '21759B'),        color: '#21759B',  category: CATEGORIES.PRODUCTIVITY },
  shopify:            { logo: si('shopify', '96BF48'),          color: '#96BF48',  category: CATEGORIES.PRODUCTIVITY },
  intercom:           { logo: si('intercom', '1F8DED'),         color: '#1F8DED',  category: CATEGORIES.PRODUCTIVITY },
  hubspot:            { logo: si('hubspot', 'FF7A59'),          color: '#FF7A59',  category: CATEGORIES.PRODUCTIVITY },
  mailchimp:          { logo: si('mailchimp', 'FFE01B'),        color: '#FFE01B',  category: CATEGORIES.PRODUCTIVITY },
  zapier:             { logo: si('zapier', 'FF4A00'),           color: '#FF4A00',  category: CATEGORIES.PRODUCTIVITY },

  // ── Cloud / Developer / Storage ───────────────────────────────────────────
  google:             { logo: si('google', '4285F4'),           color: '#4285F4',  category: CATEGORIES.CLOUD },
  'google one':       { logo: si('google', '4285F4'),           color: '#4285F4',  category: CATEGORIES.CLOUD },
  'google workspace': { logo: si('googleworkspace', '4285F4'),  color: '#4285F4',  category: CATEGORIES.PRODUCTIVITY },
  amazon:             { logo: si('amazon', 'FF9900'),           color: '#FF9900',  category: CATEGORIES.SHOPPING },
  aws:                { logo: si('amazonaws', 'FF9900'),        color: '#FF9900',  category: CATEGORIES.CLOUD },
  apple:              { logo: si('apple', 'FFFFFF'),            color: '#555555',  category: CATEGORIES.PRODUCTIVITY },
  icloud:             { logo: si('icloud', '3693F3'),           color: '#3693F3',  category: CATEGORIES.CLOUD },
  digitalocean:       { logo: si('digitalocean', '0080FF'),     color: '#0080FF',  category: CATEGORIES.CLOUD },
  heroku:             { logo: si('heroku', '430098'),           color: '#430098',  category: CATEGORIES.CLOUD },
  vercel:             { logo: si('vercel', 'FFFFFF'),           color: '#333333',  category: CATEGORIES.CLOUD },
  linear:             { logo: si('linear', '5E6AD2'),           color: '#5E6AD2',  category: CATEGORIES.PRODUCTIVITY },
  jira:               { logo: si('jira', '0052CC'),             color: '#0052CC',  category: CATEGORIES.PRODUCTIVITY },
  confluence:         { logo: si('confluence', '0052CC'),       color: '#0052CC',  category: CATEGORIES.PRODUCTIVITY },
  atlassian:          { logo: si('atlassian', '0052CC'),        color: '#0052CC',  category: CATEGORIES.PRODUCTIVITY },

  // ── Finance / Banking (UK & US) ───────────────────────────────────────────
  monzo:              { logo: si('monzo', 'FF3A6E'),            color: '#FF3A6E',  category: CATEGORIES.FINANCE },
  revolut:            { logo: si('revolut', '191C1F'),          color: '#6F5EFF',  category: CATEGORIES.FINANCE },
  paypal:             { logo: si('paypal', '003087'),           color: '#003087',  category: CATEGORIES.FINANCE },
  coinbase:           { logo: si('coinbase', '0052FF'),         color: '#0052FF',  category: CATEGORIES.FINANCE },
  klarna:             { logo: si('klarna', 'FFB3C7'),           color: '#FF607B',  category: CATEGORIES.FINANCE },
  transferwise:       { logo: si('wise', '9FE870'),             color: '#9FE870',  category: CATEGORIES.FINANCE },
  wise:               { logo: si('wise', '9FE870'),             color: '#9FE870',  category: CATEGORIES.FINANCE },
  stripe:             { logo: si('stripe', '635BFF'),           color: '#635BFF',  category: CATEGORIES.FINANCE },

  // ── Fitness / Wellness ────────────────────────────────────────────────────
  peloton:            { logo: si('peloton', 'FC0FC0'),          color: '#000000',  category: CATEGORIES.FITNESS },
  strava:             { logo: si('strava', 'FC4C02'),           color: '#FC4C02',  category: CATEGORIES.FITNESS },
  headspace:          { logo: si('headspace', 'FF6E00'),        color: '#FF6E00',  category: CATEGORIES.FITNESS },
  calm:               { logo: si('calm', '4A90D9'),             color: '#4A90D9',  category: CATEGORIES.FITNESS },
  'myfitnesspal':     { logo: si('myfitnesspal', '0F69C9'),     color: '#0F69C9',  category: CATEGORIES.FITNESS },
  whoop:              { logo: si('whoop', '000000'),            color: '#A3F535',  category: CATEGORIES.FITNESS },
  noom:               { logo: si('noom', '64BE4D'),             color: '#64BE4D',  category: CATEGORIES.FITNESS },
  'the gym group':    { logo: '🏋️',                            color: '#FF0000',  category: CATEGORIES.FITNESS },
  'pure gym':         { logo: '🏋️',                            color: '#FF6600',  category: CATEGORIES.FITNESS },
  puregym:            { logo: '🏋️',                            color: '#FF6600',  category: CATEGORIES.FITNESS },
  'david lloyd':      { logo: '🎾',                             color: '#003087',  category: CATEGORIES.FITNESS },
  'virgin active':    { logo: '🏊',                             color: '#CC0000',  category: CATEGORIES.FITNESS },

  // ── Food / Delivery ───────────────────────────────────────────────────────
  hellofresh:         { logo: si('hellofresh', '8DB600'),       color: '#8DB600',  category: CATEGORIES.FOOD },
  'hello fresh':      { logo: si('hellofresh', '8DB600'),       color: '#8DB600',  category: CATEGORIES.FOOD },
  deliveroo:          { logo: si('deliveroo', '00CCBC'),        color: '#00CCBC',  category: CATEGORIES.FOOD },
  'uber eats':        { logo: si('ubereats', '06C167'),         color: '#06C167',  category: CATEGORIES.FOOD },
  doordash:           { logo: si('doordash', 'FF3008'),         color: '#FF3008',  category: CATEGORIES.FOOD },
  'just eat':         { logo: si('justeat', 'FF8000'),          color: '#FF8000',  category: CATEGORIES.FOOD },

  // ── Restaurants / Chains (UK & US) ───────────────────────────────────────
  starbucks:          { logo: si('starbucks', '00704A'),        color: '#00704A',  category: CATEGORIES.FOOD },
  mcdonalds:          { logo: si('mcdonalds', 'FBC817'),        color: '#DA291C',  category: CATEGORIES.FOOD },
  "mcdonald's":       { logo: si('mcdonalds', 'FBC817'),        color: '#DA291C',  category: CATEGORIES.FOOD },
  'burger king':      { logo: si('burgerking', 'F5EBDC'),       color: '#D62300',  category: CATEGORIES.FOOD },
  burgerking:         { logo: si('burgerking', 'F5EBDC'),       color: '#D62300',  category: CATEGORIES.FOOD },
  kfc:                { logo: si('kfc', 'F40027'),              color: '#F40027',  category: CATEGORIES.FOOD },
  dominos:            { logo: si('dominospizza', 'E31837'),      color: '#006491', category: CATEGORIES.FOOD },
  "domino's":         { logo: si('dominospizza', 'E31837'),      color: '#006491', category: CATEGORIES.FOOD },
  'pizza hut':        { logo: si('pizzahut', 'EE2722'),         color: '#EE2722',  category: CATEGORIES.FOOD },
  pizzahut:           { logo: si('pizzahut', 'EE2722'),         color: '#EE2722',  category: CATEGORIES.FOOD },
  subway:             { logo: si('subway', '009743'),           color: '#009743',  category: CATEGORIES.FOOD },
  chipotle:           { logo: si('chipotle', '491E0F'),         color: '#A81612',  category: CATEGORIES.FOOD },
  'five guys':        { logo: '🍔',                             color: '#CE1126',  category: CATEGORIES.FOOD },
  'nandos':           { logo: '🍗',                             color: '#E2231A',  category: CATEGORIES.FOOD },
  "nando's":          { logo: '🍗',                             color: '#E2231A',  category: CATEGORIES.FOOD },
  greggs:             { logo: '🥐',                             color: '#003087',  category: CATEGORIES.FOOD },
  pret:               { logo: '☕',                             color: '#8B1A2F',  category: CATEGORIES.FOOD },
  'pret a manger':    { logo: '☕',                             color: '#8B1A2F',  category: CATEGORIES.FOOD },
  wagamama:           { logo: '🍜',                             color: '#E31837',  category: CATEGORIES.FOOD },
  'leon':             { logo: '🌿',                             color: '#F4C300',  category: CATEGORIES.FOOD },
  'costa coffee':     { logo: si('costacoffee', '6C1D45'),      color: '#6C1D45',  category: CATEGORIES.FOOD },
  costa:              { logo: si('costacoffee', '6C1D45'),      color: '#6C1D45',  category: CATEGORIES.FOOD },
  'tim hortons':      { logo: si('timhortons', 'C8102E'),       color: '#C8102E',  category: CATEGORIES.FOOD },
  'shake shack':      { logo: '🍔',                             color: '#6BBD45',  category: CATEGORIES.FOOD },
  'papa johns':       { logo: '🍕',                             color: '#006633',  category: CATEGORIES.FOOD },
  "papa john's":      { logo: '🍕',                             color: '#006633',  category: CATEGORIES.FOOD },
  'taco bell':        { logo: si('tacobell', '702082'),         color: '#702082',  category: CATEGORIES.FOOD },
  tacobell:           { logo: si('tacobell', '702082'),         color: '#702082',  category: CATEGORIES.FOOD },
  'dunkin':           { logo: si('dunkin', 'FF6E1A'),           color: '#FF6E1A',  category: CATEGORIES.FOOD },
  "dunkin'":          { logo: si('dunkin', 'FF6E1A'),           color: '#FF6E1A',  category: CATEGORIES.FOOD },
  'wetherspoons':     { logo: '🍺',                             color: '#003087',  category: CATEGORIES.FOOD },

  // ── News / Reading ────────────────────────────────────────────────────────
  'new york times':   { logo: si('newyorktimes', '000000'),     color: '#333333',  category: CATEGORIES.NEWS },
  medium:             { logo: si('medium', '000000'),           color: '#333333',  category: CATEGORIES.NEWS },
  substack:           { logo: si('substack', 'FF6719'),         color: '#FF6719',  category: CATEGORIES.NEWS },
  kindle:             { logo: si('amazon', 'FF9900'),           color: '#FF9900',  category: CATEGORIES.NEWS },
  audible:            { logo: si('audible', 'F8991C'),          color: '#F8991C',  category: CATEGORIES.NEWS },

  // ── Education ─────────────────────────────────────────────────────────────
  duolingo:           { logo: si('duolingo', '58CC02'),         color: '#58CC02',  category: CATEGORIES.EDUCATION },
  coursera:           { logo: si('coursera', '0056D2'),         color: '#0056D2',  category: CATEGORIES.EDUCATION },
  skillshare:         { logo: si('skillshare', '00C4A7'),       color: '#00C4A7',  category: CATEGORIES.EDUCATION },
  udemy:              { logo: si('udemy', 'A435F0'),            color: '#A435F0',  category: CATEGORIES.EDUCATION },
  linkedin:           { logo: si('linkedin', '0A66C2'),         color: '#0A66C2',  category: CATEGORIES.EDUCATION },
  'linkedin premium': { logo: si('linkedin', '0A66C2'),         color: '#0A66C2',  category: CATEGORIES.EDUCATION },
  masterclass:        { logo: si('masterclass', 'F5A623'),      color: '#F5A623',  category: CATEGORIES.EDUCATION },
  'khan academy':     { logo: si('khanacademy', '14BF96'),      color: '#14BF96',  category: CATEGORIES.EDUCATION },

  // ── Transport / Utilities ─────────────────────────────────────────────────
  uber:               { logo: si('uber', '000000'),             color: '#333333',  category: CATEGORIES.TRANSPORT },
  lyft:               { logo: si('lyft', 'EA0B8C'),             color: '#EA0B8C',  category: CATEGORIES.TRANSPORT },
  'national rail':    { logo: si('nationalrail', 'E31F1F'),     color: '#E31F1F',  category: CATEGORIES.TRANSPORT },
  tfl:                { logo: si('transportforlondon', '0019A8'), color: '#0019A8', category: CATEGORIES.TRANSPORT },

  // ── Telecom / Mobile Carriers ─────────────────────────────────────────────
  'at&t':             { logo: si('att', '00A8E0'),              color: '#00A8E0',  category: CATEGORIES.TELECOM },
  att:                { logo: si('att', '00A8E0'),              color: '#00A8E0',  category: CATEGORIES.TELECOM },
  verizon:            { logo: si('verizon', 'CD040B'),          color: '#CD040B',  category: CATEGORIES.TELECOM },
  't-mobile':         { logo: si('tmobile', 'E20074'),          color: '#E20074',  category: CATEGORIES.TELECOM },
  tmobile:            { logo: si('tmobile', 'E20074'),          color: '#E20074',  category: CATEGORIES.TELECOM },
  o2:                 { logo: si('o2', '032B5A'),               color: '#032B5A',  category: CATEGORIES.TELECOM },
  vodafone:           { logo: si('vodafone', 'E60000'),         color: '#E60000',  category: CATEGORIES.TELECOM },
  ee:                 { logo: si('ee', '00A5B5'),               color: '#00A5B5',  category: CATEGORIES.TELECOM },
  three:              { logo: '3️⃣',                            color: '#000000',  category: CATEGORIES.TELECOM },
  sprint:             { logo: si('sprint', 'FFDD00'),           color: '#FFDD00',  category: CATEGORIES.TELECOM },
  mintmobile:         { logo: '📱',                             color: '#F16499',  category: CATEGORIES.TELECOM },
  'mint mobile':      { logo: '📱',                             color: '#F16499',  category: CATEGORIES.TELECOM },

  // ── Security / Anti-virus / Tools ───────────────────────────────────────
  mcafee:             { logo: si('mcafee', 'C01818'),           color: '#C01818',  category: CATEGORIES.SECURITY },
  norton:             { logo: si('norton', 'F3C016'),           color: '#F3C016',  category: CATEGORIES.SECURITY },
  kaspersky:          { logo: si('kaspersky', '006D55'),        color: '#006D55',  category: CATEGORIES.SECURITY },
  avast:              { logo: si('avast', 'FF7A00'),            color: '#FF7A00',  category: CATEGORIES.SECURITY },
  malwarebytes:       { logo: si('malwarebytes', '005EEA'),     color: '#005EEA',  category: CATEGORIES.SECURITY },
  jetbrains:          { logo: si('jetbrains', '000000'),        color: '#000000',  category: CATEGORIES.PRODUCTIVITY },
  autocad:            { logo: si('autocad', '0696D7'),          color: '#0696D7',  category: CATEGORIES.PRODUCTIVITY },
  quickbooks:         { logo: si('quickbooks', '2CA01C'),       color: '#2CA01C',  category: CATEGORIES.FINANCE },
  xero:               { logo: si('xero', '13B5EA'),             color: '#13B5EA',  category: CATEGORIES.FINANCE },

  // ── E-commerce / Retail / Shopping ──────────────────────────────────────
  walmart:            { logo: si('walmart', '0071CE'),          color: '#0071CE',  category: CATEGORIES.SHOPPING },
  'walmart+':         { logo: si('walmart', '0071CE'),          color: '#0071CE',  category: CATEGORIES.SHOPPING },
  costco:             { logo: '🛒',                             color: '#E31837',  category: CATEGORIES.SHOPPING },
  target:             { logo: si('target', 'CC0000'),           color: '#CC0000',  category: CATEGORIES.SHOPPING },
  asos:               { logo: si('asos', '000000'),             color: '#333333',  category: CATEGORIES.SHOPPING },
  instacart:          { logo: si('instacart', '003D29'),        color: '#43B02A',  category: CATEGORIES.SHOPPING },
  shipt:              { logo: si('shipt', '141414'),            color: '#020000',  category: CATEGORIES.SHOPPING },
  chewy:              { logo: '🐾',                             color: '#1C49C2',  category: CATEGORIES.SHOPPING },
  ebay:               { logo: si('ebay', 'E53238'),             color: '#E53238',  category: CATEGORIES.SHOPPING },
  etsy:               { logo: si('etsy', 'F1641E'),             color: '#F1641E',  category: CATEGORIES.SHOPPING },

  // ── Dating / Social / Creator ───────────────────────────────────────────
  tinder:             { logo: si('tinder', 'FE3C72'),           color: '#FE3C72',  category: CATEGORIES.SOCIAL },
  bumble:             { logo: si('bumble', 'FFC629'),           color: '#FFC629',  category: CATEGORIES.SOCIAL },
  hinge:              { logo: '🤍',                             color: '#000000',  category: CATEGORIES.SOCIAL },
  okcupid:            { logo: si('okcupid', '4385F5'),          color: '#4385F5',  category: CATEGORIES.SOCIAL },
  match:              { logo: '❤️',                             color: '#0000FF',  category: CATEGORIES.SOCIAL },
  'match.com':        { logo: '❤️',                             color: '#0000FF',  category: CATEGORIES.SOCIAL },
  patreon:            { logo: si('patreon', 'FF424D'),          color: '#FF424D',  category: CATEGORIES.SOCIAL },
  onlyfans:           { logo: si('onlyfans', '00AFF0'),         color: '#00AFF0',  category: CATEGORIES.SOCIAL },
  'youtube channel':  { logo: si('youtube', 'FF0000'),          color: '#FF0000',  category: CATEGORIES.SOCIAL },
  kickstarter:        { logo: si('kickstarter', '05CE78'),      color: '#05CE78',  category: CATEGORIES.SOCIAL },
  gofundme:           { logo: si('gofundme', '00B964'),         color: '#00B964',  category: CATEGORIES.SOCIAL },
};

// ── Lookup helpers ────────────────────────────────────────────────────────────

function fuzzyLookup(merchantName: string): (typeof brandIcons)[string] | undefined {
  const normalized = merchantName.trim().toLowerCase();

  // 1. Exact match
  if (brandIcons[normalized]) return brandIcons[normalized];

  // 2. Partial match — first key whose name appears in the merchant string (or vice versa)
  for (const key of Object.keys(brandIcons)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return brandIcons[key];
    }
  }

  return undefined;
}

export function getBrandInfo(merchantName: string): { logo: string; color: string } {
  const match = fuzzyLookup(merchantName);
  if (match) return { logo: match.logo, color: match.color };

  // Deterministic color fallback based on name hash
  const normalized = merchantName.trim().toLowerCase();
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = normalized.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = `#${((hash & 0x00FFFFFF) | 0x444444).toString(16).padStart(6, '0')}`;

  return { logo: '📦', color };
}

/**
 * Returns the canonical category for a merchant name by looking it up in the
 * brand dictionary. Falls back to null so the caller can decide what to do
 * (e.g. use the Plaid category or default to 'Other').
 */
export function getBrandCategory(merchantName: string): Category | null {
  return fuzzyLookup(merchantName)?.category ?? null;
}


