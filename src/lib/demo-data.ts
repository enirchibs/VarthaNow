import type { BlogPost, NewsCategory } from "@/types/news";
import type { Language } from "@/hooks/useLanguage";

const now = Date.now();
const minutesAgo = (minutes: number) => new Date(now - minutes * 60_000).toISOString();

const basePosts: BlogPost[] = [
  {
    slug: "reducing-bp-sugar-stress-naturally",
    title: "బిపి, షుగర్ మరియు మానసిక ఒత్తిడిని సహజంగా తగ్గించుకునే మార్గాలు",
    excerpt: "ఈ రోజుల్లో అధిక రక్తపోటు (BP), డయాబెటిస్ (షుగర్), మరియు మానసిక ఒత్తిడి (Stress) సర్వసాధారణం అయ్యాయి. వీటిని నియంత్రించే ఆయుర్వేద మరియు యోగా చిట్కాలు ఇక్కడ చూడండి.",
    content: `## రక్తపోటును (BP) ఎలా తగ్గించాలి?

రక్తపోటును అదుపులో ఉంచుకోవడానికి ప్రతిరోజూ వ్యాయామం చేయడం అవసరం. ఆహారంలో కొన్ని మార్పులు చేయడం ద్వారా దీన్ని సహజంగా నియంత్రించవచ్చు:

- **ఉప్పు వాడకం తగ్గించండి:** రోజువారీ ఉప్పు శాతాన్ని తగ్గించడం వల్ల రక్తనాళాలపై ఒత్తిడి తగ్గుతుంది.
- **పొటాషియం సమృద్ధిగా తీసుకోండి:** అరటిపండ్లు, ఆకుకూరలు, బీట్‌రూట్ రసం రక్తపోటును చాలా త్వరగా నియంత్రిస్తాయి.
- **ధ్యానం (Meditation):** రోజుకు 15 నిమిషాల ప్రాణాయామం రక్తపోటును తగ్గిస్తుంది.

## బ్లడ్ షుగర్ (డయాబెటిస్) నివారణలు

బ్లడ్ షుగర్ నియంత్రణకు ఇన్సులిన్ స్థాయిలను సహజంగా పెంచుకోవాలి:

- **మెంతులు మరియు దాల్చినచెక్క:** రాత్రిపూట నానబెట్టిన మెంతులు లేదా దాల్చినచెక్క పొడి ఉదయాన్నే నీటితో కలిపి తీసుకుంటే షుగర్ నియంత్రణలో ఉంటుంది.
- **పీచు పదార్థాలు (Fiber):** పీచు ఎక్కువగా ఉండే తృణధాన్యాలు, బ్రౌన్ రైస్, కూరగాయలు తీసుకోండి.
- **తీపికి దూరంగా ఉండండి:** పంచదార మరియు కృత్రిమ తీపి పదార్థాలను పూర్తిగా నివారించండి.

## మానసిక ఒత్తిడి (Stress) నుండి ఉపశమనం

ఒత్తిడిని తగ్గించుకోవడానికి ఈ క్రింది మార్గాలు ఉపయోగపడతాయి:

- **తగినంత నిద్ర:** రోజుకు కనీసం 7-8 గంటల నిద్ర మైండ్‌ను ఫ్రెష్‌గా ఉంచుతుంది.
- **హెర్బల్ టీ:** గ్రీన్ టీ లేదా చామంతి టీ తాగడం వల్ల మెదడు కండరాలు రిలాక్స్ అవుతాయి.
- **శారీరక శ్రమ:** నడక లేదా నచ్చిన సంగీతం వినడం ద్వారా ఒత్తిడి హార్మోన్లు తగ్గుతాయి.`,
    category: "health",
    tags: ["Health Tips", "Reduce BP", "Manage Diabetes", "Stress Relief"],
    meta_title: "బిపి, షుగర్, ఒత్తిడి తగ్గించే సహజ చిట్కాలు",
    meta_description: "హైపర్ టెన్షన్, డయాబెటిస్ మరియు మానసిక ఒత్తిడిని యోగా, ఆయుర్వేద పద్ధతులతో తగ్గించుకునే మార్గాలు.",
    og_image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80",
    author_name: "VaartaNow Health Desk",
    language: "te",
    published: true,
    featured: true,
    reading_time_min: 4,
    published_at: minutesAgo(5)
  },
  {
    slug: "stock-market-sensex-green-energy-investment",
    title: "వ్యాపార విశేషాలు: బంగారం, వెండి ధరల పరుగులు.. దీర్గకాలిక లాభాల కోసం సోలార్ & గ్రీన్ ఎనర్జీ షేర్లు!",
    excerpt: "ఈ రోజు షేర్ మార్కెట్లో సెన్సెక్స్ మరియు నిఫ్టీ లాభాల బాట పట్టాయి. మరోవైపు బంగారం ధరలు రికార్డు స్థాయికి చేరాయి. సోలార్ మరియు గ్రీన్ ఎనర్జీ రంగానికి చెందిన ఉత్తమ షేర్ల వివరాలు ఇక్కడ ఉన్నాయి.",
    content: `## సెన్సెక్స్ మరియు నిఫ్టీ తాజా అప్‌డేట్స్

నేడు స్టాక్ మార్కెట్ ట్రేడింగ్ సానుకూలంగా ముగిసింది. ఐటీ మరియు బ్యాంకింగ్ రంగ షేర్లు మంచి లాభాలను సాధించాయి.

## బంగారం మరియు వెండి రికార్డ్ రేట్లు

అంతర్జాతీయ పరిణామాల నేపథ్యంలో బంగారం, వెండి ధరలు కొత్త రికార్డులను సృష్టించాయి. నిపుణుల అభిప్రాయం ప్రకారం, రాబోయే రోజుల్లో బంగారం ధర 10 గ్రాములకు రూ. 80,000 మార్కును తాకే అవకాశం ఉంది.

## దీర్ఘకాలిక పెట్టుబడుల కోసం గ్రీన్ ఎనర్జీ షేర్లు

గ్రీన్ ఎనర్జీ మరియు సోలార్ ఎనర్జీ రంగాల్లో కేంద్ర ప్రభుత్వం భారీగా సబ్సిడీలను ఇస్తోంది. దీంతో ఈ రంగాల షేర్లు మల్టీబ్యాగర్లుగా మారనున్నాయి:

- **టాటా పవర్ (Tata Power):** సోలార్ ప్యానెల్స్ మరియు ఈవీ ఛార్జింగ్ కేంద్రాల నెట్‌వర్క్‌తో ఈ షేరు భారీ వృద్ధిని నమోదు చేయనుంది.
- **అదానీ గ్రీన్ ఎనర్జీ (Adani Green Energy):** పవన మరియు సౌర విద్యుత్ ఉత్పాదనలో దేశంలోనే అతిపెద్ద కంపెనీగా ఉంది. దీర్ఘకాలిక అవసరాలకు ఇది మంచి ఎంపిక.
- **సుజ్లాన్ ఎనర్జీ (Suzlon Energy):** విండ్ పవర్ మార్కెట్లో తనకంటూ ఒక తిరుగులేని స్థానాన్ని సంపాదించుకుంది.

## నేటి ట్రేడింగ్ చిట్కాలు (Daily Stock Picks)

నిఫ్టీ భవిష్యత్ ట్రెండ్ బట్టి ఇంట్రాడే కోసం ఐటీ కంపెనీలైన ఇన్ఫోసిస్ లేదా విప్రోలపై నిపుణులు మొగ్గు చూపుతున్నారు.`,
    category: "business",
    tags: ["Share Market", "Sensex", "Gold Silver Rates", "Green Energy Stocks", "Solar Shares"],
    meta_title: "బంగారం రేట్లు, గ్రీన్ ఎనర్జీ సోలార్ స్టాక్స్ అప్‌డేట్స్",
    meta_description: "సెన్సెక్స్ తాజా వార్తలు, బంగారం మరియు వెండి రేట్లు, దీర్ఘకాలిక పెట్టుబడులకు సరిపోయే గ్రీన్ ఎనర్జీ షేర్లు.",
    og_image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80",
    author_name: "VaartaNow Business Desk",
    language: "te",
    published: true,
    featured: true,
    reading_time_min: 5,
    published_at: minutesAgo(10)
  },
  {
    slug: "tirumala-brahmotsavam-ekadasi-vastu-sastra",
    title: "భక్తి & వాస్తు: తిరుమల బ్రహ్మోత్సవాలు, ఏకాదశి వ్రత విధానం మరియు శ్రేయస్సును తెచ్చే ఇంటి వాస్తు చిట్కాలు",
    excerpt: "హిందూ సంప్రదాయాల ప్రకారం పండుగలు, ఏకాదశి ఉపవాస నియమాలు మరియు ఇంటి ప్రధాన ద్వారానికి సంబంధించిన వాస్తు నియమాలను ఇక్కడ తెలుసుకోండి.",
    content: `## తిరుమల శ్రీవారి బ్రహ్మోత్సవాల షెడ్యూల్

తిరుమల కొండపై శ్రీ వెంకటేశ్వర స్వామి వారి బ్రహ్మోత్సవాలు అత్యంత వైభవంగా జరగనున్నాయి. వాహన సేవల వివరాలు:
- **గరుడ సేవ:** బ్రహ్మోత్సవాలలో ఐదవ రోజు రాత్రి జరిగే గరుడ వాహన సేవకు లక్షలాది మంది భక్తులు తరలివస్తాయి.
- **రథోత్సవం:** ఎనిమిదవ రోజు ఉదయం రథోత్సవంలో స్వామి వారు భక్తులకు దర్శనమిస్తారు.

## ఏకాదశి వ్రత నియమాలు మరియు ఫలితాలు

ఏకాదశి రోజున ఉపవాసం ఉండటం వల్ల శారీరక రుగ్మతలు తొలగిపోయి మానసిక ప్రశాంతత లభిస్తుంది:
- **ఉపవాస నియమం:** ఏకాదశి రోజున తృణధాన్యాలు, అన్నం తినకూడదు. పండ్లు మరియు పాలు తీసుకోవచ్చు.
- **ద్వాదశి పారణ:** మరుసటి రోజు ద్వాదశి తిథి సమయంలోనే ఉపవాస దీక్షను విరమించాలి.

## శ్రేయస్సు కలిగించే ముఖ్యమైన వాస్తు చిట్కాలు

ఇంట్లో సానుకూల శక్తిని పెంచుకోవడానికి వాస్తు నిపుణుల సలహాలు:
- **సింహద్వారం:** ఇంటి ప్రధాన ద్వారం ఎల్లప్పుడూ తూర్పు లేదా ఉత్తర దిశలో ఉండాలి. ద్వారం వద్ద చెప్పులు, చెత్త వేయకూడదు.
- **పూజా గది:** ఈశాన్య మూలలో పూజా మందిరం నిర్మించడం వల్ల ఇంట్లో ప్రశాంతత, లక్ష్మీదేవి అనుగ్రహం లభిస్తుంది.
- **అద్దాల అమరిక:** బెడ్‌రూమ్‌లో మంచానికి ఎదురుగా అద్దాలు పెట్టరాదు. ఇది నిద్రలేమికి కారణమవుతుంది.`,
    category: "devotional",
    tags: ["Tirumala Brahmotsavam", "Ekadasi Fasting", "Vastu Shastra Tips", "Bhakti Devotional"],
    meta_title: "తిరుమల బ్రహ్మోత్సవాలు, ఏకాదశి ఉపవాసం, ఇంటి వాస్తు చిట్కాలు",
    meta_description: "శ్రీవారి గరుడ సేవ సమయాలు, ఏకాదశి వ్రత పద్ధతులు మరియు సంపదను తెచ్చే సింహద్వార వాస్తు నియమాలు.",
    og_image: "https://images.unsplash.com/photo-1608976328267-e673d3ec06ce?auto=format&fit=crop&w=1200&q=80",
    author_name: "VaartaNow Bhakti Desk",
    language: "te",
    published: true,
    featured: true,
    reading_time_min: 4,
    published_at: minutesAgo(12)
  },
  {
    slug: "seasonal-healthcare-summer-monsoon-winter",
    title: "రుతువుల వారీగా ఆరోగ్యం: ఎండకాలం, వర్షాకాలంలో రోగనిరోధక శక్తిని పెంచే ఆయుర్వేద రక్షణ సూత్రాలు",
    excerpt: "మారుతున్న కాలానికి అనుగుణంగా వచ్చే వ్యాధుల నుండి మనల్ని మనం రక్షించుకోవడానికి నిపుణులు అందించిన అద్భుతమైన ఆరోగ్య నియమాలు ఇక్కడ ఉన్నాయి.",
    content: `## ఎండకాలం (Summer) రక్షణ సూత్రాలు

వేసవి కాలంలో శరీరం డీహైడ్రేషన్‌కు గురి కాకుండా కాపాడుకోవడం చాలా ముఖ్యం:

- **సహజ పానీయాలు:** కొబ్బరి నీళ్లు, మజ్జిగ, రాగి జావ, మరియు చెరకు రసం ఎక్కువగా తీసుకోండి. ఇవి శరీర ఉష్ణోగ్రతను వెంటనే తగ్గిస్తాయి.
- **లేత రంగు కాటన్ దుస్తులు:** వదులుగా ఉండే కాటన్ బట్టలు ధరించడం వల్ల చర్మ సమస్యలు దరిచేరవు.
- **సూర్య కిరణాల నుండి రక్షణ:** మధ్యాహ్నం 12 నుండి 3 గంటల మధ్య ప్రత్యక్ష ఎండలో తిరగవద్దు.

## వర్షాకాలం (Monsoon) మరియు శీతాకాలంలో తీసుకోవలసిన జాగ్రత్తలు

వర్షాకాలంలో జీర్ణక్రియ బలహీనపడటం వల్ల ఇన్ఫెక్షన్లు త్వరగా వ్యాపిస్తాయి:

- **веడి వేడి ఆహారం తీసుకోండి:** ఎల్లప్పుడూ వేడి చేసిన మరియు తాజాగా వండిన ఆహారాన్నే తినాలి.
- **రోగనిరోధక శక్తిని పెంచే డ్రింక్స్:** ప్రతిరోజూ రాత్రి పూట వేడి పాలలో చిటికెడు పసుపు మరియు మిరియాల పొడి వేసి తాగితే జలుబు, దగ్గు త్వరగా తగ్గుతాయి.
- **కాచి చల్లార్చిన నీరు:** తాగునీటిని ఎల్లప్పుడూ కాచి చల్లార్చిన తర్వాతే తాగాలి. ఇది కలుషిత నీటి వల్ల వచ్చే టైఫాయిడ్, కలరా వంటి జ్వరాన్ని నివారిస్తుంది.

## ముగింపు

చిన్నపాటి నియమాల ద్వారా మన రోగనిరోధక శక్తిని పెంచుకుని డాక్టర్ వద్దకు వెళ్లే అవసరం లేకుండా జీవించవచ్చు.`,
    category: "health",
    tags: ["Seasonal Health", "Immunity Boosters", "Summer Healthcare", "Monsoon Diseases Prevention"],
    meta_title: "ఎండకాలం, వర్షాకాలం ఆయుర్వేద ఆరోగ్య నియమాలు",
    meta_description: "వేసవిలో శరీర వేడిని తగ్గించే మజ్జిగ కొబ్బరి నీళ్ల ప్రయోజనాలు మరియు వర్షాకాల జ్వరాన్ని నివారించే చిట్కాలు.",
    og_image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80",
    author_name: "VaartaNow Health Desk",
    language: "te",
    published: true,
    featured: false,
    reading_time_min: 3,
    published_at: minutesAgo(15)
  },
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
    author_name: "VaartaNow AI Desk",
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
    author_name: "VaartaNow Local Desk",
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
    author_name: "VaartaNow Cinema Desk",
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
  viralshorts: "https://images.unsplash.com/photo-1598257006458-087169a1f08d?auto=format&fit=crop&w=1200&q=80",
  "andhra-pradesh": "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80",
  "telangana": "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1200&q=80",
  cinema: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80",
  vizag: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
  technology: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
  jobs: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=1200&q=80",
  cricket: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=80",
  politics: "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=1200&q=80",
  health: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80",
  business: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80",
  devotional: "https://images.unsplash.com/photo-1608976328267-e673d3ec06ce?auto=format&fit=crop&w=1200&q=80"
};

const templates: Record<Language, Record<NewsCategory, { title: string; excerpt: string; content: string; tags: string[] }>> = {
  te: {
    viralshorts: {
      title: "ట్రెండింగ్ వైరల్ షార్ట్స్ వార్తలు",
      excerpt: "సోషల్ మీడియాలో విపరీతంగా హల్‌చల్ చేస్తున్న క్రేజీ వీడియోలు మరియు బ్రేకింగ్ అప్‌డేట్స్.",
      content: "## వైరల్ వీడియోలు\n\nనేటి సోషల్ మీడియా ట్రెండ్స్ మరియు వైరల్ అవుతున్న క్రేజీ క్లిప్స్ ఇక్కడ చూడండి.",
      tags: ["వైరల్ షార్ట్స్", "వైరల్ వీడియోలు", "ట్రెండింగ్"]
    },
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
    },
    health: {
      title: "ఆరోగ్య సూత్రాలు: వేసవిలో వడదెబ్బ తగలకుండా తీసుకోవాల్సిన జాగ్రత్తలు",
      excerpt: "веసవి తీవ్రత పెరుగుతున్న నేపథ్యంలో ఆరోగ్య నిపుణులు సూచించిన కీలక జాగ్రత్తలు.",
      content: "## వడదెబ్బ నివారణ\n\nఎండ కాలంలో శరీరాన్ని చల్లగా ఉంచుకోవడానికి ద్రవపదార్థాలు ఎక్కువగా తీసుకోవాలి. రోజుకు కనీసం 3-4 లీటర్ల నీరు తాగాలి. కొబ్బరి నీరు, మజ్జిగ శ్రేష్ఠం.",
      tags: ["ఆరోగ్యం", "హెల్త్ టిప్స్", "వేసవి రక్షణ"]
    },
    business: {
      title: "నేటి వ్యాపార సమాచారం: స్టాక్ మార్కెట్ ఒడిదుడుకులు మరియు బంగారం ధరల అప్‌డేట్",
      excerpt: "సెన్సెక్స్ మరియు నిఫ్టీ తాజా విశ్లేషణ, బంగారం, వెండి నూతన ధరల వివరాలు.",
      content: "## స్టాక్ మార్కెట్\n\nఈరోజు దేశీయ మార్కెట్లు స్వల్ప లాభాలతో ముగిశాయి. బంగారం ధర తులం రూ. 75,000 మార్కును తాకింది.",
      tags: ["వ్యాపారం", "స్టాక్ మార్కెట్", "బంగారం ధరలు"]
    },
    devotional: {
      title: "నేటి పంచాంగం మరియు ద్వాదశ రాశిఫలాలు",
      excerpt: "ఈరోజు శుభ సమయాలు, రాహుకాలం, మరియు మీ రాశి యొక్క ఫలితాలు ఇక్కడ తెలుసుకోండి.",
      content: "## పంచాంగం\n\nనేటి తిథి, నక్షత్రం మరియు శుభ ముహూర్తాల వివరాలు. రాహుకాలంలో ముఖ్యమైన పనులను వాయిదా వేసుకోవడం మంచిది.",
      tags: ["ఆధ్యాత్మికం", "పంచాంగం", "రాశిఫలాలు"]
    }
  },
  en: {
    viralshorts: {
      title: "Trending Viral Shorts & Clips",
      excerpt: "Catch up on the latest viral video updates and hot social media trends in real-time.",
      content: "## Viral Trends\n\nExplore what's capturing attention across social media channels and trending platforms.",
      tags: ["Viral Shorts", "Trending Videos", "Social Media"]
    },
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
    },
    health: {
      title: "Daily Health Tips: Natural Ways to Manage Stress and Reduce Blood Pressure",
      excerpt: "Simple breathing exercises, stress management routines, and diet changes to control hypertension naturally.",
      content: "## Stress Management\n\nPracticing deep breathing for 10 minutes daily can significantly drop cortisol levels. Reducing sodium and adding potassium-rich foods like bananas helps lower blood pressure.",
      tags: ["Health", "Wellness", "Reduce BP", "Stress Relief"]
    },
    business: {
      title: "Business Focus: Green Energy Stocks for Long-Term Multi-bagger Returns",
      excerpt: "An analysis of solar and wind energy shares that are poised for significant growth in the future energy transition.",
      content: "## Green Energy Investment\n\nWith heavy government subsidies, solar and wind power companies like Tata Power and Adani Green are prime long-term picks. Financial analysts recommend systematic investing.",
      tags: ["Business", "Stock Market", "Green Energy", "Solar Shares"]
    },
    devotional: {
      title: "Spiritual Living: Daily Panchangam and Auspicious Rahu Kalam Timings",
      excerpt: "Start your day with spiritual clarity. Check daily tithi, nakshatra, and customized horoscope highlights.",
      content: "## Panchangam Guidelines\n\nAligning your daily schedules with auspicious timings like Amrutha Ghadiyalu can bring positivity. Avoid major transactions during Rahu Kalam and Durmuhurtham.",
      tags: ["Spiritual", "Astrology", "Panchangam", "Horoscope"]
    }
  },
  hi: {
    viralshorts: {
      title: "ट्रेंडिंग वायरल शॉर्ट्स और मजेदार वीडियो",
      excerpt: "सोशल मीडिया पर धूम मचाने वाले वायरल वीडियो और ताज़ा ट्रेंड्स का संग्रह।",
      content: "## वायरल वीडियो\n\nआज के सबसे चर्चित सोशल मीडिया वीडियो और मजेदार क्लिप्स की खास रिपोर्ट।",
      tags: ["वायरल शॉर्ट्स", "ट्रेंडिंग वीडियो", "सोशल मीडिया"]
    },
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
    },
    health: {
      title: "स्वास्थ्य युक्तियाँ: तनाव और उच्च रक्तचाप को प्राकृतिक रूप से नियंत्रित करने के उपाय",
      excerpt: "तनाव कम करने और रक्तचाप को सामान्य रखने के लिए आसान जीवनशैली बदलाव और योग अभ्यास।",
      content: "## प्राकृतिक स्वास्थ्य\n\nयोग और प्राणायाम के दैनिक अभ्यास से रक्तचाप और तनाव का स्तर नियंत्रित रहता है। संतुलित आहार और ताजे फल आपके स्वास्थ्य के लिए लाभकारी हैं।",
      tags: ["स्वास्थ्य", "योग", "तनाव से राहत"]
    },
    business: {
      title: "बिज़नेस अपडेट: सोने-चांदी की कीमतें रिकॉर्ड स्तर पर, ग्रीन एनर्जी शेयरों में उछाल",
      excerpt: "शेयर बाजार का ताजा विश्लेषण, सेंसेक्स में बढ़त और सौर ऊर्जा क्षेत्र में निवेश के नए विकल्प।",
      content: "## बाजार विश्लेषण\n\nआज के कारोबारी सत्र में शेयर बाजार में उछाल देखा गया। नवीकरणीय ऊर्जा के बढ़ते चलन के कारण सोलर शेयरों में निवेशकों की दिलचस्पी बढ़ रही है।",
      tags: ["बिज़नेस", "शेयर बाजार", "सोना चांदी", "निवेश"]
    },
    devotional: {
      title: "आज का पंचांग और दैनिक राशिफल: जानें शुभ मुहूर्त",
      excerpt: "दैनिक राहुकाल, शुभ मुहूर्त, तिथि, नक्षत्र और सभी 12 राशियों के आज के सितारे।",
      content: "## दैनिक पंचांग\n\nआज का दिन शुभ कार्य शुरू करने के लिए कैसा रहेगा, और किस समय राहुकाल का प्रभाव रहेगा, इसकी विस्तृत जानकारी दी गई है।",
      tags: ["आध्यात्मिक", "पंचांग", "राशिफल"]
    }
  },
  ta: {
    viralshorts: {
      title: "டிரெண்டிங் வைரல் ஷார்ட்ஸ் மற்றும் வீடியோக்கள்",
      excerpt: "சமூக வலைதளங்களில் வைரலாகி வரும் சுவாரஸ்யமான சிறு வீடியோக்கள் மற்றும் முக்கிய செய்திகள்.",
      content: "## வைரல் செய்திகள்\n\nஇன்றைய சமூக ஊடகங்களின் டிரெண்டுகள் மற்றும் வைரலாகும் வீடியோ கிளிப்புகள்.",
      tags: ["வைரல் ஷார்ட்ஸ்", "டிரெண்டிங்", "சமூக ஊடகம்"]
    },
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
    },
    health: {
      title: "ஆரோக்கிய குறிப்புகள்: இரத்த அழுத்தத்தை கட்டுப்படுத்த எளிய இயற்கை வழிகள்",
      excerpt: "மன அழுத்தத்தைக் குறைக்கவும், உயர் இரத்த அழுத்தத்தைக் கட்டுப்படுத்தவும் மருத்துவர்கள் வழங்கும் எளிய ஆலோசனைகள்.",
      content: "## ஆரோக்கிய வாழ்வு\n\nதினசரி உடற்பயிற்சி மற்றும் தியானம் இரத்த அழுத்தத்தைக் கட்டுப்படுத்த உதவுகிறது. உப்பு மற்றும் எண்ணெய் பலகாரங்களை தவிர்த்து காய்கறிகளை அதிகம் சேர்க்கவும்.",
      tags: ["ஆரோக்கியம்", "இயற்கை மருத்துவம்", "மன அழுத்தம்"]
    },
    business: {
      title: "வர்த்தக செய்திகள்: தங்கம் மற்றும் வெள்ளி விலையில் மாற்றம், பசுமை ஆற்றல் பங்குகள்",
      excerpt: "பங்குச் சந்தை நிலவரம், சென்செக்ஸ் ஏற்ற இறக்கம், மற்றும் நீண்ட கால முதலீட்டிற்கான சோலார் பங்குகள்.",
      content: "## பங்குச் சந்தை\n\nஇன்றைய பங்குச் சந்தைகள் ஏற்றத்துடன் முடிவடைந்தன. சோலார் மற்றும் புதுப்பிக்கத்தக்க ஆற்றல் பங்குகளின் மதிப்பு தொடர்ந்து உயர்ந்து வருகிறது.",
      tags: ["வர்த்தகம்", "பங்குச்சந்தை", "தங்கம் விலை", "முதலீடு"]
    },
    devotional: {
      title: "இன்றைய பஞ்சாங்கம் மற்றும் தினசரி ராசிபலன்கள்",
      excerpt: "இன்றைய நல்ல நேரம், ராகு காலம், எமகண்டம் மற்றும் 12 ராசிகளுக்கான பலன்கள்.",
      content: "## பஞ்சாங்கம்\n\nசுப காரியங்களைத் தொடங்க உகந்த நேரங்கள் மற்றும் தவிர்க்க வேண்டிய நேரங்கள் பற்றிய முழுமையான விபரம்.",
      tags: ["ஆன்மீகம்", "பஞ்சாங்கம்", "ராசிபலன்"]
    }
  },
  kn: {
    viralshorts: {
      title: "ಟ್ರೆಂಡಿಂಗ್ ವೈರಲ್ ಶಾರ್ಟ್ಸ್ ಮತ್ತು ವಿಡಿಯೋಗಳು",
      excerpt: "ಸಾಮಾಜಿಕ ಜಾಲತಾಣಗಳಲ್ಲಿ ಸದ್ದು ಮಾಡುತ್ತಿರುವ ವೈರಲ್ ವಿಡಿಯೋಗಳು ಮತ್ತು ಬ್ರೇಕಿಂಗ್ ಅಪ್‌ಡೇಟ್ಸ್.",
      content: "## ವೈರಲ್ ವಿಡಿಯೋಗಳು\n\nಇಂದಿನ ಸಾಮಾಜಿಕ ಜಾಲತಾಣಗಳ ಟ್ರೆಂಡ್ಸ್ ಮತ್ತು ವೈರಲ್ ಆಗುತ್ತಿರುವ ಕ್ರೇಜಿ ಕ್ಲಿಪ್ಸ್ ವಿವರ ಇಲ್ಲಿದೆ.",
      tags: ["ವೈರಲ್ ಶಾರ್ಟ್ಸ್", "ವೈರಲ್ ವಿಡಿಯೋ", "ಟ್ರೆಂಡಿಂಗ್"]
    },
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
    },
    health: {
      title: "ಆರೋಗ್ಯ ಸಲಹೆಗಳು: ರಕ್ತದೊತ್ತಡ ಮತ್ತು ಮಾನಸಿಕ ಒತ್ತಡ ನಿವಾರಣೆಗೆ ಸುಲಭ ಮಾರ್ಗಗಳು",
      excerpt: "ಬಿಪಿ ಮತ್ತು ಮಧುಮೇಹವನ್ನು ನೈಸರ್ಗಿಕವಾಗಿ ನಿಯಂತ್ರಿಸಲು ವೈದ್ಯರು ಸೂಚಿಸಿದ ಅತ್ಯುತ್ತಮ ಸಲಹೆಗಳು.",
      content: "## ಆರೋಗ್ಯ ರಕ್ಷಣೆ\n\nದಿನನಿತ್ಯದ ನಡಿಗೆ, ಧ್ಯಾನ ಮತ್ತು ಪೌಷ್ಟಿಕ ಆಹಾರದ ಸೇವನೆಯಿಂದ ಬಿಪಿ ಹಾಗೂ ಒತ್ತಡವನ್ನು ಸುಲಭವಾಗಿ ನಿಯಂತ್ರಿಸಬಹುದು.",
      tags: ["ಆರೋಗ್ಯ", "ಯೋಗ", "ಒತ್ತಡ ನಿವಾರಣೆ"]
    },
    business: {
      title: "ವ್ಯಾಪಾರ ಮಾಹಿತಿ: ಚಿನ್ನ ಮತ್ತು ಬೆಳ್ಳಿ ದರ ಏರಿಕೆ, ಗ್ರೀನ್ ಎನರ್ಜಿ ಷೇರುಗಳ ಹೂಡಿಕೆ",
      excerpt: "ಷೇರು ಮಾರುಕಟ್ಟೆ ತಾಜಾ ಸುದ್ದಿ, ಸೆನ್ಸೆಕ್ಸ್ ಏರಿಕೆ ಮತ್ತು ದೀರ್ಘಕಾಲದ ಹೂಡಿಕೆಗೆ ಯೋಗ್ಯವಾದ ಸೋಲಾರ್ ಷೇರುಗಳು.",
      content: "## ಮಾರುಕಟ್ಟೆ ವಿಶ್ಲೇಷಣೆ\n\nಭಾರತೀಯ ಷೇರು ಮಾರುಕಟ್ಟೆಯು ಇಂದು ಸಾಲದಾಯಕ ಲಾಭ ಕಂಡಿದೆ. ಹಸಿರು ಇಂಧನ ವಲಯದ ಷೇರುಗಳಿಗೆ ಬೇಡಿಕೆ ಹೆಚ್ಚುತ್ತಿದೆ.",
      tags: ["ವ್ಯಾಪಾರ", "ಷೇರು ಮಾರುಕಟ್ಟೆ", "ಚಿನ್ನದ ದರ", "ಹೂಡಿಕೆ"]
    },
    devotional: {
      title: "ಇಂದಿನ ಪಂಚಾಂಗ ಮತ್ತು ದೈನಂದಿನ ರಾಶಿ ಭವಿಷ್ಯ",
      excerpt: "ಇಂದಿನ ಶುಭ ಸಮಯ, ರಾಹುಕಾಲ, ತಿಥಿ, ನಕ್ಷತ್ರ ಮತ್ತು ದ್ವಾದಶ ರಾಶಿಗಳ ಫಲ.",
      content: "## ಪಂಚಾಂಗ\n\nಶುಭ ಕಾರ್ಯಗಳಿಗೆ ಉತ್ತಮ ಸಮಯ ಹಾಗೂ ರಾಹುಕಾಲದಂತಹ ಅಶುಭ ಸಮಯಗಳ ಸಂಪೂರ್ಣ ವಿವರ ಇಲ್ಲಿದೆ.",
      tags: ["ಅಧ್ಯಾತ್ಮಿಕ", "ಪಂಚಾಂಗ", "ರಾಶಿ ಭವಿಷ್ಯ"]
    }
  }
};

const generatedPosts: BlogPost[] = [];
const langList: Language[] = ["te", "en", "hi", "ta", "kn"];
const categoriesList: NewsCategory[] = [
  "viralshorts",
  "andhra-pradesh",
  "telangana",
  "cinema",
  "vizag",
  "technology",
  "jobs",
  "cricket",
  "politics",
  "health",
  "business",
  "devotional"
];

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
        author_name: "VaartaNow AI Editor",
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
