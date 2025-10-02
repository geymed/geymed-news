export const FEEDS = [
  "https://feeds.reuters.com/reuters/worldNews",
  "https://www.aljazeera.com/xml/rss/all.xml",
  "https://www.axios.com/feeds/feed.rss",
  "https://www.timesofisrael.com/feed/",
  "https://www.haaretz.com/rss",
  "https://apnews.com/hub/rss"
];

export const ALLOWED_DOMAINS = [
  "reuters.com","apnews.com","bbc.com","aljazeera.com","axios.com",
  "timesofisrael.com","haaretz.com","nytimes.com","washingtonpost.com","wsj.com"
];

export const KEYWORDS = [
  // Core deal-related terms
  "Hamas deal", "Gaza deal", "Trump deal", "peace deal", "ceasefire deal",
  "hostage deal", "prisoner exchange", "truce agreement", "peace agreement",
  
  // Trump mediation specific
  "Trump mediation", "Trump negotiat", "Trump peace", "Trump Gaza", "Trump Hamas",
  "Trump Israel", "Trump Palestinian", "Trump Middle East",
  
  // Israel-Gaza specific
  "Israel Gaza", "Israeli Palestinian", "Gaza Hamas", "Hamas Israel",
  "Gaza ceasefire", "Gaza peace", "Gaza negotiat", "Gaza hostage",
  
  // Deal/negotiation specific
  "deal negotiat", "peace negotiat", "ceasefire negotiat", "hostage negotiat",
  "deal proposal", "peace proposal", "ceasefire proposal", "hostage proposal",
  
  // Key mediators
  "Qatar mediation", "Egypt mediation", "Qatar negotiat", "Egypt negotiat",
  
  // Specific to current conflict
  "October 7", "October 7th", "Gaza war", "Israel Hamas war"
];