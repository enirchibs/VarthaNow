import { supabase } from "./supabase";

export interface ShortVideoItem {
  id?: string;
  title: string;
  link: string;
  thumbnail: string;
  clip: string;
  source: string;
  source_icon: string;
  channel: string;
  duration: string;
  published_at?: string;
}

const stableClips = [
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  "https://vjs.zencdn.net/v/oceans.mp4",
  "https://media.w3.org/2010/05/sintel/trailer_hd.mp4",
  "https://html5demos.com/assets/dizzy.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4"
];

// 🌟 Generate Dynamic Daily Viral Shorts Feed with Today's Relative Timestamps
export function generateDailyViralShorts(): ShortVideoItem[] {
  const now = Date.now();

  const shortsCatalog = [
    {
      id: "viral-1",
      title: "తిరుమల శ్రీవారి బ్రహ్మోత్సవాలు.. గరుడ సేవ విశేషాలు",
      link: "https://www.youtube.com/shorts/tv9-tirumala-garuda",
      thumbnail: "https://images.unsplash.com/photo-1608976328267-e673d3ec06ce?auto=format&fit=crop&w=600&q=80",
      clip: stableClips[0],
      source: "YouTube",
      source_icon: "https://www.google.com/s2/favicons?domain=tv9telugu.com&sz=64",
      channel: "TV9 Telugu",
      duration: "0:45",
      hoursAgo: 1
    },
    {
      id: "viral-2",
      title: "ఏపీలో భారీ వర్షాల హెచ్చరిక.. జిల్లాల్లో అలర్ట్ జారీ",
      link: "https://www.youtube.com/shorts/sakshi-rains-ap",
      thumbnail: "https://images.unsplash.com/photo-1428908728789-d2de25dbd4e2?auto=format&fit=crop&w=600&q=80",
      clip: stableClips[1],
      source: "YouTube",
      source_icon: "https://www.google.com/s2/favicons?domain=sakshi.com&sz=64",
      channel: "Sakshi TV",
      duration: "0:59",
      hoursAgo: 2
    },
    {
      id: "viral-3",
      title: "బంగారం & వెండి ధరల తాజా అప్‌డేట్.. స్వల్పంగా తగ్గిన పసిడి",
      link: "https://www.youtube.com/shorts/tv5-gold-rates",
      thumbnail: "https://images.unsplash.com/photo-1599690925058-90e1a0b46154?auto=format&fit=crop&w=600&q=80",
      clip: stableClips[2],
      source: "YouTube",
      source_icon: "https://www.google.com/s2/favicons?domain=tv5news.in&sz=64",
      channel: "TV5 News",
      duration: "0:35",
      hoursAgo: 3
    },
    {
      id: "viral-4",
      title: "తెలంగాణ అసెంబ్లీ సమావేశాలు.. కీలక బిల్లులకు ఆమోదం",
      link: "https://www.youtube.com/shorts/v6-telangana-assembly",
      thumbnail: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=600&q=80",
      clip: stableClips[3],
      source: "YouTube",
      source_icon: "https://www.google.com/s2/favicons?domain=v6velugu.com&sz=64",
      channel: "V6 News",
      duration: "0:50",
      hoursAgo: 4
    },
    {
      id: "viral-5",
      title: "మహేష్ బాబు & రాజమౌళి SSMB29 భారీ మూవీ అప్‌డేట్",
      link: "https://www.youtube.com/shorts/ntv-ssmb29-update",
      thumbnail: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=600&q=80",
      clip: stableClips[4],
      source: "YouTube",
      source_icon: "https://www.google.com/s2/favicons?domain=ntvtelugu.com&sz=64",
      channel: "NTV Entertainment",
      duration: "0:42",
      hoursAgo: 5
    },
    {
      id: "viral-6",
      title: "ఇండియా vs ఆస్ట్రేలియా క్రికెట్ మ్యాచ్ ధనాధన్ షార్ట్స్",
      link: "https://www.youtube.com/shorts/starsports-ind-aus",
      thumbnail: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=600&q=80",
      clip: stableClips[5],
      source: "YouTube",
      source_icon: "https://www.google.com/s2/favicons?domain=youtube.com&sz=64",
      channel: "Star Sports Telugu",
      duration: "0:58",
      hoursAgo: 6
    },
    {
      id: "viral-7",
      title: "ఆర్టిఫిషియల్ ఇంటెలిజెన్స్ రంగంలో సరికొత్త విప్లవాత్మక మార్పులు",
      link: "https://www.youtube.com/shorts/eenadu-ai-trends",
      thumbnail: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80",
      clip: stableClips[6],
      source: "YouTube",
      source_icon: "https://www.google.com/s2/favicons?domain=eenadu.net&sz=64",
      channel: "Eenadu Tech",
      duration: "0:48",
      hoursAgo: 7
    },
    {
      id: "viral-8",
      title: "నేటి దైవ దర్శనం & రాశి ఫలాలు.. ఈ రాశుల వారికి అదృష్టం",
      link: "https://www.youtube.com/shorts/bhaktitv-rasi-phalalu",
      thumbnail: "https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=600&q=80",
      clip: stableClips[7],
      source: "YouTube",
      source_icon: "https://www.google.com/s2/favicons?domain=youtube.com&sz=64",
      channel: "Bhakti TV",
      duration: "0:40",
      hoursAgo: 8
    },
    {
      id: "viral-9",
      title: "వైజాగ్ బీచ్ రోడ్‌లో సందడి.. పర్యాటకుల సంతోషం",
      link: "https://www.youtube.com/shorts/10tv-vizag-beach",
      thumbnail: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
      clip: stableClips[8],
      source: "YouTube",
      source_icon: "https://www.google.com/s2/favicons?domain=10tv.in&sz=64",
      channel: "10TV News",
      duration: "0:38",
      hoursAgo: 9
    },
    {
      id: "viral-10",
      title: "హైదరాబాద్ ఐటీ కారిడార్ ఫ్లైఓవర్ ప్రారంభం",
      link: "https://www.youtube.com/shorts/tnews-hyd-flyover",
      thumbnail: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80",
      clip: stableClips[9],
      source: "YouTube",
      source_icon: "https://www.google.com/s2/favicons?domain=tnewstelugu.com&sz=64",
      channel: "T News",
      duration: "0:45",
      hoursAgo: 10
    },
    {
      id: "viral-11",
      title: "అమరావతి రాజధాని నిర్మాణాలు.. శరవేగంగా పనులు",
      link: "https://www.youtube.com/shorts/abn-amaravati-works",
      thumbnail: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
      clip: stableClips[0],
      source: "YouTube",
      source_icon: "https://www.google.com/s2/favicons?domain=abnandhrajyothy.com&sz=64",
      channel: "ABN Andhra Jyothi",
      duration: "0:55",
      hoursAgo: 11
    },
    {
      id: "viral-12",
      title: "తక్కువ ధరలో కొత్త 5G స్మార్ట్‌ఫోన్ ల్యాంచ్",
      link: "https://www.youtube.com/shorts/tech-budget-5g",
      thumbnail: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80",
      clip: stableClips[1],
      source: "YouTube",
      source_icon: "https://www.google.com/s2/favicons?domain=youtube.com&sz=64",
      channel: "Tech in Telugu",
      duration: "0:52",
      hoursAgo: 12
    }
  ];

  return shortsCatalog.map(item => ({
    id: item.id,
    title: item.title,
    link: item.link,
    thumbnail: item.thumbnail,
    clip: item.clip,
    source: item.source,
    source_icon: item.source_icon,
    channel: item.channel,
    duration: item.duration,
    published_at: new Date(now - item.hoursAgo * 3600000).toISOString()
  }));
}

export async function getShortVideos(query: string = "telugu news"): Promise<ShortVideoItem[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("viral_videos")
        .select("*")
        .order("published_at", { ascending: false })
        .limit(30);

      if (!error && data && data.length > 0) {
        return data.map((v: any, idx: number) => ({
          id: v.id || `supa-short-${idx}`,
          title: v.title,
          link: v.video_url || v.link || "",
          thumbnail: v.thumbnail_url || v.thumbnail || "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&q=80",
          clip: v.clip || v.video_url || stableClips[idx % stableClips.length],
          source: v.channel || "YouTube",
          source_icon: v.source_icon || "https://www.google.com/s2/favicons?domain=youtube.com&sz=64",
          channel: v.channel || "YouTube Channel",
          duration: v.duration || "0:45",
          published_at: v.published_at || new Date().toISOString()
        }));
      }
    } catch (error) {
      console.warn("Failed to query Supabase viral_videos table, returning daily catalog fallback:", error);
    }
  }

  // Always return non-empty daily catalog
  return generateDailyViralShorts();
}
