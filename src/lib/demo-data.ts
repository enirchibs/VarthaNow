import type { BlogPost, NewsCategory } from "@/types/news";
import type { Language } from "@/hooks/useLanguage";

const now = Date.now();
const minutesAgo = (minutes: number) => new Date(now - minutes * 60_000).toISOString();

const basePosts: BlogPost[] = [
  {
    slug: "ap-government-new-scheme-2026",
    title: "ఏపీలో కొత్త సంక్షేమ పథకం: లబ్ధిదారులకు ముఖ్యమైన మార్పులు",
    excerpt: "రాష్ట్ర ప్రభుత్వం ప్రకటించిన కొత్త మార్గదర్శకాలతో అర్హుల జాబితా, దరఖాస్తు విధానం, చెల్లింపు షెడ్యూల్‌పై స్పష్టత వచ్చింది.",
    content:
      "## ప్రధానాంశాలు\n\n- జిల్లాల వారీగా అమలు షెడ్యూల్ విడుదలైంది.\n- గ్రామ, వార్డు సచివాలయాల ద్వారా ధృవీకరణ జరుగుతుంది.\n- అర్హులైన వారికి నేరుగా ఖాతాలో జమ చేసే విధానం కొనసాగుతుంది.\n\n## పూర్తి వివరాలు\n\nఏపీ ప్రభుత్వం సంక్షేమ పథకాల అమలులో పారదర్శకత పెంచేందుకు కొత్త ప్రక్రియను ప్రకటించింది. దరఖాస్తుదారులు తమ మొబైల్ నంబర్ ద్వారా స్టేటస్ తెలుసుకోవచ్చు.\n\n## FAQ\n\n### ఎవరు అర్హులు?\nఅధికారిక మార్గదర్శకాల ప్రకారం ఆదాయం, నివాసం, పత్రాల ఆధారంగా అర్హత నిర్ణయిస్తారు.\n\n## ముగింపు\n\nఅర్హులు అధికారిక పోర్టల్ లేదా సమీప సచివాలయం ద్వారా వివరాలు పరిశీలించాలి.",
    category: "andhra-pradesh",
    tags: ["AP News", "Welfare", "Telugu News"],
    meta_title: "ఏపీ కొత్త సంక్షేమ పథకం 2026 - పూర్తి వివరాలు",
    meta_description: "ఏపీ ప్రభుత్వ కొత్త సంక్షేమ పథకం వివరాలు, అర్హత, దరఖాస్తు విధానం, తాజా తెలుగు వార్తలు.",
    og_image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80",
    author_name: "VarthaNow AI Desk",
    language: "te",
    published: true,
    featured: true,
    reading_time_min: 3,
    published_at: minutesAgo(18)
  },
  {
    slug: "vizag-real-estate-growth",
    title: "విశాఖలో రియల్ ఎస్టేట్ ఊపు: కొత్త ప్రాజెక్టులపై ఆసక్తి",
    excerpt: "ఐటీ, పోర్ట్, టూరిజం అభివృద్ధితో విశాఖలో నివాస, వాణిజ్య ప్రాజెక్టులపై డిమాండ్ పెరుగుతోంది.",
    content:
      "## విశాఖలో మార్కెట్ ట్రెండ్\n\nమధురవాడ, గాజువాక, ఎంవీపీ కాలనీ పరిసరాల్లో కొత్త ప్రాజెక్టులపై కొనుగోలుదారుల ఆసక్తి పెరుగుతోంది.\n\n## గమనించాల్సిన అంశాలు\n\n- ప్రాజెక్ట్ అనుమతులు చూసుకోవాలి.\n- రవాణా, నీటి సరఫరా, డ్రైనేజ్ వివరాలు పరిశీలించాలి.\n- ధరలను సమీప ప్రాంతాలతో పోల్చాలి.\n\n## FAQ\n\n### ఇప్పుడే కొనుగోలు చేయాలా?\nవ్యక్తిగత అవసరం, బడ్జెట్, చట్టపరమైన పత్రాలు పరిశీలించి నిర్ణయం తీసుకోవాలి.",
    category: "vizag",
    tags: ["Vizag", "Real Estate", "Local News"],
    meta_title: "విశాఖ రియల్ ఎస్టేట్ తాజా ట్రెండ్స్",
    meta_description: "విశాఖలో రియల్ ఎస్టేట్ డిమాండ్, కొత్త ప్రాజెక్టులు, ప్రాంతాల వారీ తాజా సమాచారం.",
    og_image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
    author_name: "VarthaNow Local Desk",
    language: "te",
    published: true,
    featured: true,
    reading_time_min: 4,
    published_at: minutesAgo(36)
  },
  {
    slug: "telugu-cinema-breaking-news",
    title: "టాలీవుడ్‌లో భారీ అప్‌డేట్: కొత్త సినిమా విడుదల తేదీ ఖరారు",
    excerpt: "స్టార్ హీరో కొత్త చిత్రానికి విడుదల తేదీపై అధికారిక ప్రకటన రావడంతో అభిమానుల్లో ఉత్సాహం పెరిగింది.",
    content:
      "## సినిమా అప్‌డేట్\n\nటాలీవుడ్‌లో కొత్తగా రానున్న భారీ చిత్రంపై మేకర్స్ కీలక ప్రకటన చేశారు. పాటలు, టీజర్, ట్రైలర్ షెడ్యూల్ త్వరలో వెల్లడించనున్నారు.\n\n## అభిమానుల స్పందన\n\nసోషల్ మీడియాలో పోస్టర్లు, హ్యాష్‌ట్యాగ్‌లు ట్రెండ్ అవుతున్నాయి.\n\n## ముగింపు\n\nఅధికారిక ప్రమోషన్ ప్రారంభమైన తర్వాత మరిన్ని వివరాలు అందుబాటులోకి వస్తాయి.",
    category: "cinema",
    tags: ["Tollywood", "Cinema", "OTT"],
    meta_title: "టాలీవుడ్ బ్రేకింగ్ న్యూస్ - కొత్త సినిమా అప్‌డేట్",
    meta_description: "టాలీవుడ్ తాజా వార్తలు, సినిమా విడుదల తేదీలు, OTT అప్డేట్స్, సెలెబ్రిటీ వార్తలు.",
    og_image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80",
    author_name: "VarthaNow Cinema Desk",
    language: "te",
    published: true,
    featured: false,
    reading_time_min: 2,
    published_at: minutesAgo(52)
  },
  // English Mock Data
  {
    slug: "ap-infrastructure-corridors-2026",
    title: "AP Government Approves Modern Infrastructure Corridors",
    excerpt: "State cabinet sanctions landmark logistics corridors to accelerate industrial growth and seaport connectivity.",
    content:
      "## Major Highlights\n\n- Multi-modal logistic parks to be established across 4 locations.\n- Direct connection with major national highways for quick freight movement.\n- Estimated investment of ₹4,500 Crores with private-public participation.\n\n## Growth Outlook\n\nThis decision marks a significant milestone in turning Andhra Pradesh into a primary maritime logistics hub on the east coast.\n\n## FAQ\n\n### Which cities will benefit first?\nVisakhapatnam, Kakinada, Nellore, and Vijayawada corridors are prioritized in phase one.",
    category: "andhra-pradesh",
    tags: ["Infrastructure", "AP Economy", "Development"],
    meta_title: "AP Approves Modern Infrastructure Corridors 2026",
    meta_description: "AP cabinet clears new industrial logistics corridors to boost maritime trade, seaport transit, and IT hubs.",
    og_image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1200&q=80",
    author_name: "VarthaNow Business Desk",
    language: "en",
    published: true,
    featured: true,
    reading_time_min: 3,
    published_at: minutesAgo(10)
  },
  {
    slug: "vizag-it-sector-expansion",
    title: "Visakhapatnam IT Sector Gains Momentum with New Tech Hubs",
    excerpt: "Leading software organizations and research laboratories expand their footprints in Visakhapatnam IT hills.",
    content:
      "## Emerging IT Core\n\nVisakhapatnam is rapidly ascending as a tech powerhouse in South India, with dedicated Special Economic Zones (SEZs) witnessing record absorption rates.\n\n## Key Factors Driving Growth\n\n- Exceptional coastal lifestyle attracting top-tier engineering talent.\n- Modern infrastructure with high-speed fiber connectivity.\n- State government incentives for electronics and IT startups.\n\n## Conclusion\n\nIndustry veterans project a double-digit rise in software export revenues from Vizag over the next two fiscal years.",
    category: "vizag",
    tags: ["Vizag", "IT Industry", "Tech Hub"],
    meta_title: "Vizag IT Sector Expansion - Dynamic Growth Hub",
    meta_description: "Visakhapatnam welcomes top global tech firms and incubation spaces, generating thousands of technical jobs.",
    og_image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
    author_name: "VarthaNow Tech Desk",
    language: "en",
    published: true,
    featured: true,
    reading_time_min: 4,
    published_at: minutesAgo(24)
  },
  {
    slug: "cricket-championship-finals-buzz",
    title: "Championship Finals: Squad Preparation Underway Under Intense Heat",
    excerpt: "Both final contenders undergo rigorous training sessions as dynamic strategies take shape for the grand title.",
    content:
      "## Match Strategy\n\nCricket analysts expect a spin-friendly pitch, prompting tactical changes in the starting line-up for both teams.\n\n## Expert Opinions\n\n- Pacing selection will be crucial during early powerplays.\n- Team batting second might experience minor dew advantage.\n\n## Final Prediction\n\nA high-stakes, thrilling chase is anticipated on Sunday.",
    category: "cricket",
    tags: ["Cricket", "Finals", "Sports News"],
    meta_title: "Cricket Championship Finals - Teams Prepare for Battle",
    meta_description: "Dynamic squad training and pitch analysis ahead of the grand cricket finale this weekend.",
    og_image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=80",
    author_name: "VarthaNow Sports Desk",
    language: "en",
    published: true,
    featured: false,
    reading_time_min: 2,
    published_at: minutesAgo(45)
  }
];

const mockImages: Record<NewsCategory, string> = {
  "andhra-pradesh": "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80",
  "telangana": "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1200&q=80",
  cinema: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80",
  vizag: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
  technology: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
  jobs: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=1200&q=80",
  cricket: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=80",
  politics: "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=1200&q=80"
};

const templates: Record<Language, Record<NewsCategory, { title: string; excerpt: string; content: string; tags: string[] }>> = {
  te: {
    "andhra-pradesh": {
      title: "ఆంధ్రప్రదేశ్ తాజా అభివృద్ధి ప్రాజెక్టులు",
      excerpt: "రాష్ట్రంలో మౌలిక వసతుల పెంపునకు ప్రభుత్వం తీసుకుంటున్న చర్యలపై సమీక్ష.",
      content: "## సమీక్ష\n\nఏపీలోని ప్రధాన నగరాలు మరియు పోర్టుల అనుసంధానానికి కొత్త రహదారుల నిర్మాణ పనులు వేగవంతం కానున్నాయి.",
      tags: ["ఆంధ్రప్రదేశ్", "అభివృద్ధి", "వార్తలు"]
    },
    telangana: {
      title: "తెలంగాణ సాగునీటి ప్రాజెక్టుల పురోగతి",
      excerpt: "తెలంగాణ వ్యాప్తంగా సాగునీటి రంగానికి ప్రభుత్వం నూతన నిధులు కేటాయింపు.",
      content: "## సాగునీటి అప్‌డేట్\n\nరైతాంగానికి మేలు చేసేలా ప్రాజెక్టుల పునర్నిర్మాణం మరియు కాల్వల పూడికతీత పనులు త్వరితగతిన పూర్తి చేయాలని ప్రభుత్వం ఆదేశించింది.",
      tags: ["తెలంగాణ", "వ్యవసాయం", "వార్తలు"]
    },
    cinema: {
      title: "టాలీవుడ్ ప్రముఖ చిత్రాల ఓటీటీ విశేషాలు",
      excerpt: "ఈ వారం డిజిటల్ ప్లాట్‌ఫామ్‌లలో సందడి చేయనున్న తెలుగు సినిమాలు.",
      content: "## ఓటీటీ విడుదలలు\n\nప్రముఖ స్టార్ హీరోల మరియు చిన్న చిత్రాలు ఈ వారం నెట్‌ఫ్లిక్స్, ప్రైమ్ మరియు ఆహా లలో అందుబాటులోకి రానున్నాయి.",
      tags: ["సినిమా", "టాలీవుడ్", "ఓటీటీ"]
    },
    vizag: {
      title: "విశాఖ సాగర తీర పర్యాటక రంగ అప్‌డేట్",
      excerpt: "పర్యాటకులను ఆకర్షించేందుకు బీచ్ రోడ్డులో ప్రత్యేక సౌకర్యాల ఏర్పాట్లు.",
      content: "## పర్యాటకం\n\nవిశాఖ బీచ్ రోడ్ పరిసరాల్లో పర్యాటక అభివృద్ధి సంస్థ ప్రత్యేక వినోద పార్కులను మరియు సేదతీరే ప్రాంతాలను సిద్ధం చేస్తోంది.",
      tags: ["విశాఖ", "పర్యాటకం", "స్థానిక వార్త"]
    },
    technology: {
      title: "భారత్‌లో నూతన 5G స్మార్ట్‌ఫోన్ల సందడి",
      excerpt: "అత్యంత తక్కువ ధరకు లభించే టాప్ మోడల్స్ మరియు వాటి ఫీచర్లు.",
      content: "## సరికొత్త ఫోన్లు\n\nప్రముఖ కంపెనీలు భారత మార్కెట్లోకి బడ్జెట్ ధరలో శక్తివంతమైన ఫీచర్లతో కూడిన 5G ఫోన్లను విడుదల చేస్తున్నాయి.",
      tags: ["టెక్నాలజీ", "మొబైల్స్", "5G"]
    },
    jobs: {
      title: "ప్రభుత్వ ఉద్యోగాల కొత్త నోటిఫికేషన్లు 2026",
      excerpt: "వివిధ విభాగాల్లో ఖాళీల భర్తీకి అర్హులైన అభ్యర్థుల నుంచి దరఖాస్తుల ఆహ్వానం.",
      content: "## నోటిఫికేషన్ సమాచారం\n\nఅర్హతగల అభ్యర్థులు నిర్ణీత గడువులోగా అధికారిక వెబ్‌సైట్ ద్వారా ఆన్‌లైన్‌లో దరఖాస్తు చేసుకోవాలని సూచించారు.",
      tags: ["ఉద్యోగాలు", "కెరీర్", "నోటిఫికేషన్"]
    },
    cricket: {
      title: "టీమిండియా తదుపరి క్రికెట్ సిరీస్ షెడ్యూల్",
      excerpt: "సొంతగడ్డపై జరగనున్న ద్వైపాక్షిక సిరీస్ కోసం జట్టు సంసిద్ధత.",
      content: "## షెడ్యూల్ వివరాలు\n\nభారత క్రికెట్ జట్టు త్వరలోనే బలమైన ప్రత్యర్థితో తలపడనుంది. క్రీడాకారులు ప్రాక్టీస్ సెషన్స్ ప్రారంభించారు.",
      tags: ["క్రికెట్", "టీమిండియా", "క్రీడలు"]
    },
    politics: {
      title: "రాష్ట్ర రాజకీయాల్లో తాజా విమర్శలు-ప్రతివిమర్శలు",
      excerpt: "ప్రతిపక్షాల ఆరోపణలకు అధికార పక్షం కౌంటర్, వేడెక్కిన పొలిటికల్ వాతావరణం.",
      content: "## పొలిటికల్ హీట్\n\nఅభివృద్ధి మరియు సంక్షేమం అంశాలపై నాయకుల మధ్య మాటల యుద్ధం సాగుతోంది. ఎన్నికల సమీపిస్తున్న కొద్దీ వేడి పెరుగుతోంది.",
      tags: ["రాజకీయాలు", "విశ్లేషణ", "వార్తలు"]
    }
  },
  en: {
    "andhra-pradesh": {
      title: "Andhra Pradesh Launches New Smart City Initiatives",
      excerpt: "Urban development department outlines new sustainability frameworks for major municipal corporations.",
      content: "## Smart Cities\n\nNew smart traffic management systems and eco-friendly parks are slated to begin construction early next month.",
      tags: ["Andhra Pradesh", "Smart Cities", "Development"]
    },
    telangana: {
      title: "Telangana IT Exports Hit Record High in 2026",
      excerpt: "State records stellar double digit growth driven by robust infrastructure and global tech setups.",
      content: "## IT Growth\n\nHyderabad continues to solidify its place as a global technology destination with record-breaking office space absorption.",
      tags: ["Telangana", "IT Sector", "Economy"]
    },
    cinema: {
      title: "Global Film Festivals Nominate South Indian Masterpieces",
      excerpt: "Three regional films recognized globally for screenwriting and exceptional cinematography.",
      content: "## Cinematic Glory\n\nRenowned directors express gratitude as international audiences applaud their unique cultural storytelling and scale.",
      tags: ["Cinema", "Tollywood", "Awards"]
    },
    vizag: {
      title: "Visakhapatnam Port Expands Dry Dock Capacity",
      excerpt: "Logistics infrastructure gets boost with modern ship repair facilities and deeper draft channels.",
      content: "## Port Expansion\n\nThe dry dock project will reduce turnaround times and accommodate modern high-tonnage cargo vessels.",
      tags: ["Vizag", "Port", "Logistics"]
    },
    technology: {
      title: "Generative AI Integration Speeds Up Across Indian Startups",
      excerpt: "New productivity tools and software solutions emerge as LLMs redefine software engineering.",
      content: "## AI Revolution\n\nStartups are reporting up to a 40% reduction in development times by utilizing sophisticated code-generation assistants.",
      tags: ["Technology", "AI", "Startups"]
    },
    jobs: {
      title: "Tech Recruiting Stabilizes with In-Demand Specialized Roles",
      excerpt: "Industry experts forecast high openings in Cybersecurity, Cloud Infrastructure, and Data Engineering.",
      content: "## Careers 2026\n\nWhile general engineering hiring remains moderate, companies are actively headhunting specialized talent.",
      tags: ["Jobs", "Careers", "Tech Hiring"]
    },
    cricket: {
      title: "Young Spinners Dominate National Selection Trials",
      excerpt: "Selection committee highlights spin department depth as upcoming bilateral tour approaches.",
      content: "## Cricket Trials\n\nNotable young spin bowlers have recorded exceptional statistics on dry, turning pitches during the domestic matches.",
      tags: ["Cricket", "Team India", "Sports"]
    },
    politics: {
      title: "Key Economic Reforms Table in Parliament",
      excerpt: "Parliamentary sessions discuss land, logistics, and digital tax frameworks for foreign direct investments.",
      content: "## Parliament Updates\n\nBipartisan committees are discussing clauses to ensure minor business protection while keeping borders friendly.",
      tags: ["Politics", "Reforms", "Parliament"]
    }
  },
  hi: {
    "andhra-pradesh": {
      title: "आंध्र प्रदेश में नए औद्योगिक गलियारों की मंजूरी",
      excerpt: "राज्य सरकार ने औद्योगिक विकास और रोजगार सृजन को बढ़ावा देने के लिए नए बुनियादी ढांचे को मंजूरी दी।",
      content: "## बुनियादी ढांचा गलियारा\n\nइन नए गलियारों से न केवल प्रमुख शहरों के बीच संपर्क सुधरेगा, बल्कि नए विनिर्माण संयंत्र स्थापित करने में भी मदद मिलेगी।",
      tags: ["आंध्र प्रदेश", "उद्योग", "विकास"]
    },
    telangana: {
      title: "तेलंगाना कृषि क्षेत्र में आधुनिक तकनीकों का उपयोग",
      excerpt: "किसानों की आय दोगुनी करने के लिए ड्रिप सिंचाई और डिजिटल प्लेटफॉर्म को बड़े पैमाने पर लागू किया जा रहा है।",
      content: "## कृषि क्रांति\n\nकृषि विभाग ड्रोन तकनीक के माध्यम से कीटनाशकों के छिड़काव और मिट्टी की गुणवत्ता की जांच को बढ़ावा दे रहा है।",
      tags: ["तेलंगाना", "कृषि", "तकनीक"]
    },
    cinema: {
      title: "भारतीय सिनेमा में नया मील का पत्थर: ब्लॉकबस्टर फिल्मों की होड़",
      excerpt: "इस साल सिनेमाघरों में बड़ी कहानियों और अद्भुत वीएफएक्स वाली फिल्मों का बोलबाला रहा।",
      content: "## बॉक्स ऑफिस रिपोर्ट्स\n\nदेशभर में फिल्म देखने वाले दर्शकों की संख्या में रिकॉर्ड बढ़ोतरी हुई है, जिससे क्षेत्रीय सिनेमा को बड़ी वैश्विक पहचान मिल रही है।",
      tags: ["सिनेमा", "मनोरंजन", "बॉलीवुड"]
    },
    vizag: {
      title: "विशाखापत्तनम में तटीय सुरक्षा और बुनियादी ढांचा मजबूत",
      excerpt: "पर्यटन को बढ़ावा देने के लिए नए समुद्र तट रिसॉर्ट्स और उन्नत सुरक्षा प्रणालियों की स्थापना की गई।",
      content: "## तटीय विकास\n\nस्थानीय प्रशासन ने समुद्र तटों पर रात की रोशनी, सुरक्षा कर्मियों और पर्यटकों के बैठने के सुंदर इंतजाम किए हैं।",
      tags: ["विशाखापत्तनम", "पर्यटन", "स्थानीय समाचार"]
    },
    technology: {
      title: "भारत में निर्मित पहला सुपरकंप्यूटर जल्द होगा लॉन्च",
      excerpt: "वैज्ञानिक अनुसंधान और मौसम पूर्वानुमान को और सटीक बनाने में मिलेगी अभूतपूर्व मदद।",
      content: "## विज्ञान और तकनीक\n\nयह नया सुपरकंप्यूटर स्वदेशी चिप तकनीक पर आधारित है और डेटा प्रोसेसिंग गति में वैश्विक मानकों को टक्कर देता है।",
      tags: ["तकनीक", "विज्ञान", "सुपरकंप्यूटर"]
    },
    jobs: {
      title: "बैंक और सरकारी विभागों में बंपर भर्तियां शुरू",
      excerpt: "दस लाख से अधिक पदों के लिए आवेदन प्रक्रिया शुरू, परीक्षा तिथियां भी घोषित।",
      content: "## भर्ती अधिसूचना\n\nयोग्य उम्मीदवार पात्रता मानदंडों की जांच करके निर्धारित तिथियों से पहले आधिकारिक वेबसाइट पर ऑनलाइन आवेदन पत्र भर सकते हैं।",
      tags: ["नौकरियां", "करियर", "अधिसूचना"]
    },
    cricket: {
      title: "आईपीएल 2026: युवा खिलाड़ियों ने मचाया तहलका",
      excerpt: "घरेलू मैदानों पर नए बल्लेबाजों और तेज गेंदबाजों की शानदार गेंदबाजी से टीम चयनकर्ताओं की बढ़ी मुश्किलें।",
      content: "## आईपीएल अपडेट्स\n\nइस सत्र में कई अनकैप्ड भारतीय खिलाड़ियों ने अपने अद्भुत प्रदर्शन से अंतरराष्ट्रीय दिग्गजों का ध्यान खींचा है।",
      tags: ["क्रिकेट", "आईपीएल", "खेल"]
    },
    politics: {
      title: "देश के आर्थिक विकास पर संसद में गहन बहस",
      excerpt: "सत्तापक्ष ने सुधारों की उपलब्धियां गिनाईं, विपक्ष ने बेरोजगारी और महंगाई पर उठाए सवाल।",
      content: "## संसदीय कार्यवाही\n\nआर्थिक नीतियों और वित्तीय विधेयकों पर विभिन्न दलों के सदस्यों के बीच तीखी बहस देखने को मिली।",
      tags: ["राजनीति", "संसद", "आर्थिक सुधार"]
    }
  },
  ta: {
    "andhra-pradesh": {
      title: "ஆந்திரப் பிரதேசத்தில் புதிய பசுமைச் சாலைத் திட்டம்",
      excerpt: "கிராமப்புற மேம்பாட்டை ஊக்குவிக்கும் வகையில் புதிய நெடுஞ்சாலைத் திட்டங்களுக்கு நிதி ஒதுக்கீடு.",
      content: "## நெடுஞ்சாலைத் திட்டம்\n\nஇப்புதிய சாலைகள் மூலம் விவசாய விளைபொருட்களை விரைவாக நகர சந்தைகளுக்கு கொண்டு செல்ல முடியும் என அதிகாரிகள் தெரிவித்துள்ளனர்.",
      tags: ["ஆந்திரா", "சாலைகள்", "மேம்பாடு"]
    },
    telangana: {
      title: "தெலுங்கானாவில் புதிய தகவல் தொழில்நுட்ப பூங்கா திறப்பு",
      excerpt: "இளைஞர்களுக்கு ஆயிரக்கணக்கான வேலைவாய்ப்புகளை உருவாக்கக்கூடிய புதிய ஐடி செக்டர் செயல்பாட்டுக்கு வந்தது.",
      content: "## ஐடி பூங்கா\n\nஇந்த புதிய தொழில்நுட்ப பூங்கா உலகத்தரம் வாய்ந்த வசதிகளுடன் சர்வதேச நிறுவனங்களை ஈர்க்கும் வகையில் வடிவமைக்கப்பட்டுள்ளது.",
      tags: ["தெலுங்கானா", "தொழில்நுட்பம்", "வேலைகள்"]
    },
    cinema: {
      title: "தமிழ் திரையுலகின் பிரம்மாண்ட படைப்புகளின் அறிவிப்பு",
      excerpt: "முன்னணி நட்சத்திரங்களின் புதிய திரைப்பட அறிவிப்புகள் மற்றும் படப்பிடிப்பு தகவல்கள்.",
      content: "## கோலிவுட் செய்திகள்\n\nஇந்த ஆண்டு மிகப்பெரிய பட்ஜெட்டில் தயாராகும் வரலாற்று சிறப்புமிக்க திரைப்படங்களின் டீசர்கள் விரைவில் வெளியாகவுள்ளன.",
      tags: ["சினிமா", "கோலிவுட்", "திரைப்படம்"]
    },
    vizag: {
      title: "விசாகப்பட்டினம் துறைமுகத்தில் சரக்கு கையாளுதல் சாதனை",
      excerpt: "கடந்த நிதியாண்டில் விசாகப்பட்டினம் துறைமுகம் புதிய ஏற்றுமதி சாதனை படைத்துள்ளது.",
      content: "## துறைமுக செய்திகள்\n\nதானியங்கி சரக்கு கையாளுதல் அமைப்புகள் அறிமுகப்படுத்தப்பட்டதன் மூலம் கப்பல்களின் காத்திருப்பு நேரம் பெருமளவு குறைந்துள்ளது.",
      tags: ["விசாகப்பட்டினம்", "துறைமுகம்", "வர்த்தகம்"]
    },
    technology: {
      title: "புதிய ஏஐ செயலிகள் இந்திய மொழிகளில் அறிமுகம்",
      excerpt: "மக்களின் அன்றாட தேவைகளை பூர்த்தி செய்யக்கூடிய உள்ளூர் மொழி ஏஐ தொழில்நுட்பங்கள்.",
      content: "## ஏஐ செயலிகள்\n\nதமிழ், தெலுங்கு, இந்தி உள்ளிட்ட மொழிகளில் தகவல்களை மொழிபெயர்க்கவும், உதவிகள் வழங்கவும் புதிய மொபைல் செயலிகள் வெளியாகி வருகின்றன.",
      tags: ["தொழில்நுட்பம்", "ஏஐ", "மொபைல்"]
    },
    jobs: {
      title: "தமிழ்நாடு அரசுப் பணியாளர் தேர்வாணையம் புதிய அறிவிப்பு",
      excerpt: "பல்வேறு காலிப்பணியிடங்களை நிரப்புவதற்கான குரூப் தேர்வுகள் அறிவிப்பு மற்றும் விண்ணப்பிக்கும் வழிமுறைகள்.",
      content: "## அரசு தேர்வுகள்\n\nஅரசு பணிகளுக்கு தயாராகும் தகுதியுடைய விண்ணப்பதாரர்கள் ஆன்லைன் வாயிலாக விண்ணப்பிக்க தேவையான ஆவணங்களை சமர்ப்பிக்க வேண்டும்.",
      tags: ["வேலைகள்", "அரசுப்பணி", "தேர்வுகள்"]
    },
    cricket: {
      title: "உலகக்கோப்பை கிரிக்கெட்: இந்திய அணியின் புதிய வியூகம்",
      excerpt: "பயிற்சியாளர் மற்றும் கேப்டன் இணைந்து உருவாக்கிய புதிய சுழற்பந்து வீச்சு உத்திகள்.",
      content: "## கிரிக்கெட் அப்டேட்\n\nஎதிர்பாராத திருப்பங்களை ஏற்படுத்தக்கூடிய திறமையான இளம் வீரர்களுக்கு இம்முறை அணியில் முன்னுரிமை வழங்கப்பட்டுள்ளது.",
      tags: ["கிரிக்கெட்", "இந்திய அணி", "விளையாட்டு"]
    },
    politics: {
      title: "மாநில நலத்திட்டங்கள் குறித்த சட்டமன்ற விவாதம்",
      excerpt: "கல்வி மற்றும் மருத்துவ துறைகளில் புதிய சீர்திருத்தங்கள் குறித்த முக்கிய மசோதாக்கள் தாக்கல்.",
      content: "## சட்டமன்ற செய்திகள்\n\nமக்களுக்கான இலவச மருத்துவ வசதிகள் மற்றும் அரசு பள்ளி உட்கட்டமைப்பு மேம்பாடு குறித்த விவாதங்கள் நடைபெற்றன.",
      tags: ["அரசியல்", "சட்டமன்றம்", "மசோதா"]
    }
  },
  kn: {
    "andhra-pradesh": {
      title: "ಆಂಧ್ರಪ್ರದೇಶದಲ್ಲಿ ಕೃಷಿ ಯಾಂತ್ರೀಕರಣಕ್ಕೆ ಚಾಲನೆ",
      excerpt: "ರೈತರಿಗೆ ರಿಯಾಯಿತಿ ದರದಲ್ಲಿ ಆಧುನಿಕ ಟ್ರ್ಯಾಕ್ಟರ್ ಮತ್ತು ಬಿತ್ತನೆ ಯಂತ್ರಗಳ ವಿತರಣೆ.",
      content: "## ಕೃಷಿ ಯೋಜನೆ\n\nಕೃಷಿ ವೆಚ್ಚವನ್ನು ಕಡಿಮೆ ಮಾಡಲು ಮತ್ತು ಇಳುವರಿಯನ್ನು ಹೆಚ್ಚಿಸಲು ಸರ್ಕಾರವು ರೈತರಿಗೆ ನೇರ ನಗದು ವರ್ಗಾವಣೆ ಮೂಲಕ ಸಬ್ಸಿಡಿ ನೀಡುತ್ತಿದೆ.",
      tags: ["ಆಂಧ್ರಪ್ರದೇಶ್", "ಕೃಷಿ", "ಯೋಜನೆ"]
    },
    telangana: {
      title: "ತೆಲಂಗಾಣದಲ್ಲಿ ಹೈದರಾಬಾದ್ ಮೆಟ್ರೋ ರೈಲು 2ನೇ ಹಂತದ ವಿಸ್ತರಣೆ",
      excerpt: "ನಗರದ ಹೊರವಲಯಗಳಿಗೆ ವೇಗದ ಸಂಪರ್ಕ ಕಲ್ಪಿಸಲು ನೂತನ ಮಾರ್ಗಗಳ ಸಮೀಕ್ಷೆ ಪೂರ್ಣ.",
      content: "## ಮೆಟ್ರೋ ರೈಲು\n\nಪ್ರಯಾಣಿಕರ ದಟ್ಟಣೆಯನ್ನು ಕಡಿಮೆ ಮಾಡಲು ಪ್ರಮುಖ ಕೈಗಾರಿಕಾ ಪ್ರದೇಶಗಳಿಗೆ ಮೆಟ್ರೋ ಸೇವೆ ವಿಸ್ತರಿಸುವ ಬೃಹತ್ ಯೋಜನೆ ಇದಾಗಿದೆ.",
      tags: ["ತೆಲಂಗಾಣ", "ಮೆಟ್ರೋ", "ಸಾರಿಗೆ"]
    },
    cinema: {
      title: "ಕನ್ನಡ ಚಿತ್ರರಂಗದ ಹೊಸ ಮೈಲಿಗಲ್ಲುಗಳು",
      excerpt: "ರಾಷ್ಟ್ರ ಮತ್ತು ಅಂತರರಾಷ್ಟ್ರೀಯ ಮಟ್ಟದಲ್ಲಿ ಸದ್ದು ಮಾಡುತ್ತಿರುವ ಕನ್ನಡ ಪ್ರತಿಭೆಗಳು.",
      content: "## ಸ್ಯಾಂಡಲ್‌ವುಡ್ ಸುದ್ದಿ\n\nವಿಶಿಷ್ಟ ಕಥಾಹಂದರ ಹೊಂದಿರುವ ಕನ್ನಡ ಚಿತ್ರಗಳು ಗಲ್ಲಾಪೆಟ್ಟಿಗೆಯಲ್ಲಿ ಭರ್ಜರಿ ಗಳಿಕೆ ಕಾಣುತ್ತಿದ್ದು, ಹೊಸ ದಾಖಲೆ ಬರೆಯುತ್ತಿವೆ.",
      tags: ["ಸಿನಿಮಾ", "ಸ್ಯಾಂಡಲ್‌ವುಡ್", "ಮನರಂಜನೆ"]
    },
    vizag: {
      title: "ವಿಶಾಖಪಟ್ಟಣಂನಲ್ಲಿ ಹೊಸ ಪ್ರವಾಸಿ ತಾಣಗಳ ಅಭಿವೃದ್ಧಿ",
      excerpt: "ಪ್ರವಾಸಿಗರನ್ನು ಆಕರ್ಷಿಸಲು ಕರಾವಳಿ ಪ್ರದೇಶದಲ್ಲಿ ಜಲಕ್ರೀಡೆ ಮತ್ತು ಪರಿಸರ ಸ್ನೇಹಿ ಉದ್ಯಾನಗಳ ಸ್ಥಾಪನೆ.",
      content: "## ಪ್ರವಾಸೋದ್ಯಮ\n\nಸಮುದ್ರ ತೀರದ ಸ್ವಚ್ಛತೆ ಕಾಪಾಡಲು ಮತ್ತು ಪರಿಸರ ಪ್ರವಾಸೋದ್ಯಮವನ್ನು ಉತ್ತೇಜಿಸಲು ವಿಶೇಷ ರಕ್ಷಣಾ ಪಡೆಗಳನ್ನು ನಿಯೋಜಿಸಲಾಗಿದೆ.",
      tags: ["ವಿಶಾಖಪಟ್ಟಣಂ", "ಪ್ರವಾಸೋದ್ಯಮ", "ಸ್ಥಳೀಯ ಸುದ್ದಿ"]
    },
    technology: {
      title: "ಭಾರತದಲ್ಲಿ ಮೊಬೈಲ್ ಉತ್ಪಾದನೆ ಹೊಸ ದಾಖಲೆ",
      excerpt: "ಸ್ವಾವಲಂಬನೆ ಕಡೆಗೆ ಹೆಜ್ಜೆ ಇಟ್ಟಿರುವ ಭಾರತದಲ್ಲಿ ಸ್ಥಳೀಯ ಉತ್ಪಾದನೆ ಮತ್ತು ರಫ್ತು ಪ್ರಮಾಣ ಗಣನೀಯವಾಗಿ ಹೆಚ್ಚಳ.",
      content: "## ತಂತ್ರಜ್ಞಾನ ವಲಯ\n\nಪ್ರಮುಖ ಜಾಗತಿಕ ಬ್ರ್ಯಾಂಡ್‌ಗಳು ಭಾರತದಲ್ಲೇ ಫೋನ್‌ಗಳನ್ನು ತಯಾರಿಸುತ್ತಿದ್ದು, ಸ್ಥಳೀಯರಿಗೆ ಲಕ್ಷಾಂತರ ಉದ್ಯೋಗಗಳು ಸೃಷ್ಟಿಯಾಗಿವೆ.",
      tags: ["ತಂತ್ರಜ್ಞಾನ", "ಮೊಬೈಲ್", "ಉತ್ಪಾದನೆ"]
    },
    jobs: {
      title: "ಕೆಪಿಎಸ್‌ಸಿ ಹೊಸ ಗ್ರೂಪ್ ಸಿ ಹುದ್ದೆಗಳ ಅಧಿಸೂಚನೆ 2026",
      excerpt: "ವಿವಿಧ ಇಲಾಖೆಗಳಲ್ಲಿನ ಖಾಲಿ ಹುದ್ದೆಗಳ ಭರ್ತಿಗೆ ಆನ್‌ಲೈನ್ ಮೂಲಕ ಅರ್ಜಿ ಸಲ್ಲಿಸಲು ಕೊನೆಯ ಅವಕಾಶ.",
      content: "## ಉದ್ಯೋಗಾವಕಾಶ\n\nನಿಗದಿತ ವಿದ್ಯಾರ್ಹತೆ ಹೊಂದಿರುವ ಆಸಕ್ತ ಅಭ್ಯರ್ಥಿಗಳು ಕೊನೆಯ ದಿನಾಂಕದ ಮೊದಲು ಪರೀಕ್ಷಾ ಶುಲ್ಕ ಪಾವತಿಸಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಬಹುದಾಗಿದೆ.",
      tags: ["ಉದ್ಯೋಗ", "ಕೆಪಿಎಸ್‌ಸಿ", "ಅಧಿಸೂಚನೆ"]
    },
    cricket: {
      title: "ಬೆಂಗಳೂರು ಚಿನ್ನಸ್ವಾಮಿ ಕ್ರೀಡಾಂಗಣದಲ್ಲಿ ಭರ್ಜರಿ ಕ್ರಿಕೆಟ್ ಸರಣಿ",
      excerpt: "ಭಾರತ ಮತ್ತು ಆಸ್ಟ್ರೇಲಿಯಾ ನಡುವಿನ ರೋಚಕ ಪಂದ್ಯಕ್ಕೆ ಕ್ರೀಡಾಂಗಣ ಸಂಪೂರ್ಣ ಸಜ್ಜು.",
      content: "## ಕ್ರಿಕೆಟ್ ಸರಣಿ\n\nಟಿಕೆಟ್ ಮಾರಾಟ ಈಗಾಗಲೇ ಮುಗಿದಿದ್ದು, ಪ್ರೇಕ್ಷಕರ ಗ್ಯಾಲರಿ ಹೊಸ ಬೆಳಕಿನ ವ್ಯವಸ್ಥೆ ಮತ್ತು ಸುಧಾರಿತ ಸೌಲಭ್ಯಗಳೊಂದಿಗೆ ಸಜ್ಜಾಗಿದೆ.",
      tags: ["ಕ್ರಿಕೆಟ್", "ಚಿನ್ನಸ್ವಾಮಿ", "ಕ್ರೀಡೆ"]
    },
    politics: {
      title: "ರಾಜ್ಯ ಬಜೆಟ್‌ನಲ್ಲಿ ಜನಪ್ರಿಯ ಯೋಜನೆಗಳ ಘೋಷಣೆ",
      excerpt: "ರೈತರು, ಮಹಿಳೆಯರು ಮತ್ತು ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ವಿಶೇಷ ಆರ್ಥಿಕ ನೆರವು ಮತ್ತು ಯೋಜನೆಗಳ ಕೊಡುಗೆ.",
      content: "## ರಾಜಕೀಯ ಬೆಳವಣಿಗೆ\n\nವಿರೋಧ ಪಕ್ಷಗಳು ಬಜೆಟ್ ಅನ್ನು ಕೇವಲ ಚುನಾವಣಾ ಆಕರ್ಷಣೆ ಎಂದು ಟೀಕಿಸಿದರೆ, ಆಡಳಿತ ಪಕ್ಷವು ಇದು ಅಭಿವೃದ್ಧಿ ಬಜೆಟ್ ಎಂದು ಸಮರ್ಥಿಸಿಕೊಂಡಿದೆ.",
      tags: ["ರಾಜಕೀಯ", "ಬಜೆಟ್", "ಸುದ್ದಿ"]
    }
  }
};

const generatedPosts: BlogPost[] = [];
const langList: Language[] = ["te", "en", "hi", "ta", "kn"];
const categoriesList: NewsCategory[] = ["andhra-pradesh", "telangana", "cinema", "vizag", "technology", "jobs", "cricket", "politics"];

langList.forEach((lang) => {
  categoriesList.forEach((cat) => {
    const exists = basePosts.some((p) => p.category === cat && p.language === lang);
    if (!exists) {
      const template = templates[lang][cat];
      generatedPosts.push({
        slug: `${cat}-news-${lang}`,
        title: template.title,
        excerpt: template.excerpt,
        content: `## ${template.title}\n\n${template.content}\n\n## FAQ\n\n### ${lang === "te" ? "మరిన్ని వివరాలు ఎప్పుడు అందుబాటులోకి వస్తాయి?" : lang === "en" ? "When will more details be available?" : lang === "hi" ? "अधिक जानकारी कब उपलब्ध होगी?" : lang === "ta" ? "கூடுதல் விவரங்கள் எப்போது கிடைக்கும்?" : "ಹೆಚ್ಚಿನ ವಿವರಗಳು ಯಾವಾಗ ಲಭ್ಯವಿರುತ್ತವೆ?"}\n${lang === "te" ? "త్వరలోనే మా విలేకరుల నుంచి సమాచారం లభిస్తుంది." : lang === "en" ? "Updates will be gathered from our field reporters soon." : lang === "hi" ? "हमारे संवाददाताओं से जल्द ही अपडेट मिलेंगे।" : lang === "ta" ? "எங்கள் நிருபர்களிடமிருந்து விரைவில் தகவல்கள் பெறப்படும்." : "ನಮ್ಮ ವರದಿಗಾರರಿಂದ ಶೀಘ್ರದಲ್ಲೇ ಮಾಹಿತಿ ಸಿಗಲಿದೆ."}\n\n## ${lang === "te" ? "ముగింపు" : lang === "en" ? "Conclusion" : lang === "hi" ? "निष्कर्ष" : lang === "ta" ? "முடிவுரை" : "ಉಪಸಂಹಾರ"}\n\n${template.excerpt}`,
        category: cat,
        tags: template.tags,
        meta_title: template.title,
        meta_description: template.excerpt,
        og_image: mockImages[cat],
        author_name: "VarthaNow AI Editor",
        language: lang,
        published: true,
        featured: cat === "andhra-pradesh" || cat === "technology",
        reading_time_min: 3,
        published_at: minutesAgo(40)
      });
    }
  });
});

export const demoPosts: BlogPost[] = [...basePosts, ...generatedPosts];
