export interface ShortVideoItem {
  title: string;
  link: string;
  thumbnail: string;
  clip: string;
  source: string;
  source_icon: string;
  channel: string;
  duration: string;
}

// 🌐 Load SerpApi keys if present in shell env
// 🌐 Load SerpApi keys if present in shell env
const serpApiKey = import.meta.env.VITE_SERPAPI_KEY || "";

const stableClips = [
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  "https://vjs.zencdn.net/v/oceans.mp4",
  "https://media.w3.org/2010/05/sintel/trailer_hd.mp4",
  "https://html5demos.com/assets/dizzy.mp4",
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
];

const mockShortVideos: ShortVideoItem[] = [
  {
    title: "తిరుమల శ్రీవారి బ్రహ్మోత్సవాలు.. గరుడ సేవ ఏర్పాట్లు",
    link: "https://www.youtube.com/shorts/tv9-tirumala",
    thumbnail: "https://images.unsplash.com/photo-1608976328267-e673d3ec06ce?auto=format&fit=crop&w=600&q=80",
    clip: stableClips[0],
    source: "YouTube",
    source_icon: "https://www.google.com/s2/favicons?domain=tv9telugu.com&sz=64",
    channel: "TV9 Telugu",
    duration: "0:45"
  },
  {
    title: "ఏపీలో భారీ వర్షాల హెచ్చరిక.. అప్రమత్తమైన అధికారులు",
    link: "https://www.youtube.com/shorts/sakshi-rains",
    thumbnail: "https://images.unsplash.com/photo-1428908728789-d2de25dbd4e2?auto=format&fit=crop&w=600&q=80",
    clip: stableClips[1],
    source: "YouTube",
    source_icon: "https://www.google.com/s2/favicons?domain=sakshi.com&sz=64",
    channel: "Sakshi TV",
    duration: "0:59"
  },
  {
    title: "బంగారం ధరల పరుగులు.. సరికొత్త రికార్డు నమోదు",
    link: "https://www.youtube.com/shorts/tv5-gold",
    thumbnail: "https://images.unsplash.com/photo-1599690925058-90e1a0b46154?auto=format&fit=crop&w=600&q=80",
    clip: stableClips[2],
    source: "YouTube",
    source_icon: "https://www.google.com/s2/favicons?domain=tv5news.in&sz=64",
    channel: "TV5 News",
    duration: "0:35"
  },
  {
    title: "టెక్నాలజీ అప్‌డేట్: సరికొత్త 5G మొబైల్స్ ఫీచర్లు ఇవే",
    link: "https://www.youtube.com/shorts/eenadu-tech",
    thumbnail: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80",
    clip: stableClips[3],
    source: "YouTube",
    source_icon: "https://www.google.com/s2/favicons?domain=eenadu.net&sz=64",
    channel: "Eenadu",
    duration: "0:48"
  },
  {
    title: "షేర్ మార్కెట్ తాజా అప్‌డేట్స్.. సెన్సెక్స్ లాభాలు",
    link: "https://www.youtube.com/shorts/tv9-sensex",
    thumbnail: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&q=80",
    clip: stableClips[4],
    source: "YouTube",
    source_icon: "https://www.google.com/s2/favicons?domain=tv9telugu.com&sz=64",
    channel: "TV9 Telugu",
    duration: "0:52"
  }
];

export async function getShortVideos(query: string = "telugu news"): Promise<ShortVideoItem[]> {
  if (!serpApiKey) {
    console.log("No SerpApi key found in environment, falling back to local Shorts catalog.");
    return mockShortVideos;
  }

  try {
    const originalUrl = `https://serpapi.com/search?engine=google_short_videos&q=${encodeURIComponent(query)}&api_key=${serpApiKey}`;
    
    // Try primary proxy (AllOrigins) and backup proxy (ThingProxy)
    const primaryProxy = `https://api.allorigins.win/raw?url=${encodeURIComponent(originalUrl)}`;
    const backupProxy = `https://thingproxy.freeboard.io/fetch/${encodeURIComponent(originalUrl)}`;
    
    let response;
    try {
      response = await fetch(primaryProxy);
      if (!response.ok) throw new Error("Primary proxy failed");
    } catch (e) {
      console.warn("AllOrigins proxy failed, trying backup proxy...");
      response = await fetch(backupProxy);
    }
    
    if (!response.ok) throw new Error("Both proxies failed to query SerpApi");
    
    const data = await response.json();
    const results = data.short_videos || [];

    if (results.length === 0) {
      console.log("SerpApi returned empty results, falling back to mock short videos.");
      return mockShortVideos;
    }

    return results.map((v: any, idx: number) => ({
      title: v.title || "Telugu News Short",
      link: v.link || "#",
      thumbnail: v.thumbnail || "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&q=80",
      clip: v.clip || stableClips[idx % stableClips.length],
      source: v.source || "Google Short Videos",
      source_icon: v.source_icon || "https://www.google.com/s2/favicons?domain=youtube.com&sz=64",
      channel: v.channel || "News Publisher",
      duration: v.duration || "0:30"
    }));
  } catch (error) {
    console.error("Failed to query SerpApi Google Short Videos, falling back to mock catalog:", error);
    return mockShortVideos;
  }
}
