import type { Article, Job, NotificationItem, Property } from "@/lib/types";

const now = Date.now();
const ago = (minutes: number) => new Date(now - minutes * 60_000).toISOString();

export const articles: Article[] = [
  {
    id: "ap-cabinet-welfare",
    category: "Andhra Pradesh",
    city: "Vijayawada",
    headline: {
      te: "ఏపీలో కొత్త సంక్షేమ షెడ్యూల్ ప్రకటించిన ప్రభుత్వం",
      en: "AP government announces updated welfare rollout calendar",
      hi: "आंध्र प्रदेश सरकार ने नई कल्याण योजना समय-सारणी घोषित की",
      ta: "ஆந்திராவில் நலத்திட்ட அட்டவணை புதுப்பிப்பு",
      kn: "ಆಂಧ್ರ ಸರ್ಕಾರ ಹೊಸ ಕಲ್ಯಾಣ ವೇಳಾಪಟ್ಟಿ ಪ್ರಕಟಿಸಿದೆ",
      ml: "ആന്ധ്ര സർക്കാർ ക്ഷേമ പദ്ധതി സമയക്രമം പുതുക്കി"
    },
    summary: {
      te: "పింఛన్లు, విద్య, మహిళా సంక్షేమ పథకాలకు జిల్లాల వారీ అమలు తేదీలు విడుదలయ్యాయి. లబ్ధిదారులు మొబైల్ ద్వారా స్టేటస్ చూసుకోవచ్చు.",
      en: "District-wise dates were released for pensions, education and women welfare schemes. Beneficiaries can track status on mobile.",
      hi: "पेंशन, शिक्षा और महिला योजनाओं के लिए जिला-वार तारीखें जारी हुईं। लाभार्थी मोबाइल पर स्थिति देख सकते हैं।",
      ta: "ஓய்வூதியம், கல்வி, பெண்கள் நலத்திட்டங்களுக்கு மாவட்ட வாரியான தேதிகள் வெளியிடப்பட்டன.",
      kn: "ಪಿಂಚಣಿ, ಶಿಕ್ಷಣ ಮತ್ತು ಮಹಿಳಾ ಯೋಜನೆಗಳಿಗೆ ಜಿಲ್ಲಾವಾರು ದಿನಾಂಕಗಳು ಪ್ರಕಟವಾಗಿವೆ.",
      ml: "പെൻഷൻ, വിദ്യാഭ്യാസം, വനിതാ ക്ഷേമ പദ്ധതികൾക്ക് ജില്ലാനുസൃത തീയതികൾ പുറത്തിറങ്ങി."
    },
    oneMinute: {
      te: "ప్రభుత్వం ఈ వారం నుంచి మూడు దశల్లో అమలు మొదలుపెడుతోంది. మొదటి దశలో గ్రామ, వార్డు సచివాలయాల ధృవీకరణ ఉంటుంది. రెండో దశలో బ్యాంక్ ఖాతాల తనిఖీ, మూడో దశలో నేరుగా జమలు జరగనున్నాయి.",
      en: "The rollout begins in three phases this week: secretariat verification, bank validation and direct benefit transfer.",
      hi: "योजना इस सप्ताह तीन चरणों में शुरू होगी: सत्यापन, बैंक जांच और सीधे भुगतान।",
      ta: "மூன்று கட்டங்களில் செயல்படுத்தப்படும்: சரிபார்ப்பு, வங்கி உறுதி, நேரடி பணமாற்றம்.",
      kn: "ಮೂರು ಹಂತಗಳಲ್ಲಿ ಜಾರಿ: ಪರಿಶೀಲನೆ, ಬ್ಯಾಂಕ್ ದೃಢೀಕರಣ, ನೇರ ವರ್ಗಾವಣೆ.",
      ml: "മൂന്ന് ഘട്ടങ്ങളിലായി നടപ്പാക്കും: പരിശോധന, ബാങ്ക് സ്ഥിരീകരണം, നേരിട്ടുള്ള കൈമാറ്റം."
    },
    source: "Vartha Desk",
    sourceUrl: "https://example.com/ap-welfare",
    imageUrl: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80",
    publishedAt: ago(12),
    reactions: 18420,
    bookmarks: 922,
    trendingScore: 98,
    isBreaking: true
  },
  {
    id: "vizag-rain-alert",
    category: "Weather",
    city: "Vizag",
    headline: {
      te: "విశాఖలో భారీ వర్షాలకు ముందస్తు అలర్ట్",
      en: "Heavy rain alert issued for Visakhapatnam",
      hi: "विशाखापट्टनम में भारी बारिश का अलर्ट",
      ta: "விசாகில் கனமழை எச்சரிக்கை",
      kn: "ವಿಶಾಖಪಟ್ಟಣಂಗೆ ಭಾರಿ ಮಳೆ ಎಚ್ಚರಿಕೆ",
      ml: "വിശാഖപട്ടണത്ത് കനത്ത മഴ മുന്നറിയിപ്പ്"
    },
    summary: {
      te: "తీర ప్రాంతాల్లో గాలులు పెరిగే అవకాశం ఉంది. చేపల వేటకు వెళ్లొద్దని అధికారులు సూచించారు.",
      en: "Coastal winds may intensify. Officials advised fishers to avoid venturing into the sea.",
      hi: "तटीय इलाकों में हवा तेज हो सकती है। मछुआरों को समुद्र में न जाने की सलाह दी गई है।",
      ta: "கடலோர காற்று அதிகரிக்கலாம். மீனவர்கள் கடலுக்குச் செல்ல வேண்டாம் என அறிவுரை.",
      kn: "ಕರಾವಳಿ ಗಾಳಿ ಹೆಚ್ಚಾಗಬಹುದು. ಮೀನುಗಾರರು ಸಮುದ್ರಕ್ಕೆ ಹೋಗಬಾರದು ಎಂದು ಸೂಚನೆ.",
      ml: "തീരക്കാറ്റ് ശക്തമാകാം. മത്സ്യത്തൊഴിലാളികൾ കടലിൽ പോകരുതെന്ന് നിർദേശം."
    },
    oneMinute: {
      te: "విశాఖ, భీమిలి, గాజువాక ప్రాంతాల్లో రాత్రి నుంచి వర్షాలు పెరగవచ్చు. తక్కువ ఎత్తున్న ప్రాంతాల్లో నీరు నిలిచే ప్రమాదం ఉంది. ట్రాఫిక్ మార్పులను యాప్‌లో చూడండి.",
      en: "Rain may increase overnight in Vizag, Bheemili and Gajuwaka. Low-lying areas could see waterlogging.",
      hi: "रात से बारिश बढ़ सकती है और निचले इलाकों में पानी भर सकता है।",
      ta: "இரவு முதல் மழை அதிகரிக்கலாம்; தாழ்வான பகுதிகளில் நீர்த்தேக்கம் ஏற்படலாம்.",
      kn: "ರಾತ್ರಿ ಮಳೆ ಹೆಚ್ಚಾಗಬಹುದು; ತಗ್ಗು ಪ್ರದೇಶಗಳಲ್ಲಿ ನೀರು ನಿಲ್ಲಬಹುದು.",
      ml: "രാത്രി മുതൽ മഴ കൂടാം; താഴ്ന്ന പ്രദേശങ്ങളിൽ വെള്ളക്കെട്ട് സാധ്യത."
    },
    source: "IMD Local",
    sourceUrl: "https://example.com/vizag-rain",
    imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    publishedAt: ago(24),
    reactions: 12800,
    bookmarks: 611,
    trendingScore: 91,
    isBreaking: true
  },
  {
    id: "tollywood-ott-week",
    category: "Cinema",
    headline: {
      te: "ఈ వారం OTTలో ఐదు తెలుగు రిలీజులు",
      en: "Five Telugu OTT releases arrive this week",
      hi: "इस सप्ताह OTT पर पांच तेलुगु रिलीज़",
      ta: "இந்த வாரம் OTT-ல் ஐந்து தெலுங்கு வெளியீடுகள்",
      kn: "ಈ ವಾರ OTTಯಲ್ಲಿ ಐದು ತೆಲುಗು ಬಿಡುಗಡೆಗಳು",
      ml: "ഈ ആഴ്ച OTTയിൽ അഞ്ച് തെലുങ്ക് റിലീസുകൾ"
    },
    summary: {
      te: "క్రైమ్ థ్రిల్లర్ నుంచి ఫ్యామిలీ డ్రామా వరకు కొత్త కంటెంట్ సిద్ధంగా ఉంది. AI వాచ్‌లిస్ట్ మీ అభిరుచికి సరిపడే టైటిల్స్ చూపిస్తుంది.",
      en: "From crime thrillers to family dramas, new titles are ready. The AI watchlist highlights what matches your taste.",
      hi: "क्राइम थ्रिलर से फैमिली ड्रामा तक नए टाइटल आ रहे हैं।",
      ta: "க்ரைம் த்ரில்லர் முதல் குடும்ப நாடகம் வரை புதிய தலைப்புகள் வருகின்றன.",
      kn: "ಕ್ರೈಮ್ ಥ್ರಿಲ್ಲರ್‌ನಿಂದ ಕುಟುಂಬ ಕಥೆಗಳವರೆಗೆ ಹೊಸ ಶೀರ್ಷಿಕೆಗಳು.",
      ml: "ക്രൈം ത്രില്ലർ മുതൽ കുടുംബ ഡ്രാമ വരെ പുതിയ തലക്കെട്ടുകൾ."
    },
    oneMinute: {
      te: "ఈ వారం విడుదలల్లో రెండు థియేటర్ తర్వాత OTTకి వస్తున్నాయి. మూడు డైరెక్ట్ డిజిటల్ రిలీజ్‌లు. కుటుంబంతో చూడటానికి రెండు, థ్రిల్లర్ అభిమానులకు రెండు ఎంపికలు ఉన్నాయి.",
      en: "Two releases are post-theatrical premieres and three are direct digital drops, with options for families and thriller fans.",
      hi: "दो फिल्में थिएटर के बाद OTT पर और तीन सीधे डिजिटल रिलीज़ हैं।",
      ta: "இரண்டு படங்கள் திரையரங்குக்குப் பிறகு, மூன்று நேரடி டிஜிட்டல் வெளியீடுகள்.",
      kn: "ಎರಡು ಚಿತ್ರಗಳು ಥಿಯೇಟರ್ ನಂತರ, ಮೂರು ನೇರ ಡಿಜಿಟಲ್ ಬಿಡುಗಡೆಗಳು.",
      ml: "രണ്ട് ചിത്രങ്ങൾ തിയേറ്ററിനു ശേഷം, മൂന്ന് നേരിട്ട് ഡിജിറ്റൽ റിലീസ്."
    },
    source: "Cinema Wire",
    sourceUrl: "https://example.com/ott",
    imageUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80",
    publishedAt: ago(43),
    reactions: 9050,
    bookmarks: 1430,
    trendingScore: 86
  },
  {
    id: "cricket-telugu-commentary",
    category: "Cricket",
    headline: {
      te: "కీలక మ్యాచ్‌కు తెలుగు AI కామెంటరీ సిద్ధం",
      en: "Telugu AI commentary ready for the key cricket clash",
      hi: "बड़े मैच के लिए तेलुगु AI कमेंट्री तैयार",
      ta: "முக்கிய போட்டிக்கு தெலுங்கு AI கருத்துரை",
      kn: "ಮುಖ್ಯ ಪಂದ್ಯಕ್ಕೆ ತೆಲುಗು AI ಕಾಮೆಂಟರಿ ಸಿದ್ಧ",
      ml: "പ്രധാന മത്സരത്തിന് തെലുങ്ക് AI കമന്ററി"
    },
    summary: {
      te: "లైవ్ స్కోర్లు, బంతి బంతికి సారాంశం, ముఖ్య క్షణాల హైలైట్స్ ఒకే డ్యాష్‌బోర్డ్‌లో అందుబాటులో ఉంటాయి.",
      en: "Live scores, ball-by-ball summaries and key highlights will be available in one dashboard.",
      hi: "लाइव स्कोर, गेंद-दर-गेंद सारांश और हाइलाइट्स एक ही जगह मिलेंगे।",
      ta: "லைவ் ஸ்கோர், பந்து வாரியான சுருக்கம், ஹைலைட்ஸ் ஒரே இடத்தில்.",
      kn: "ಲೈವ್ ಸ್ಕೋರ್, ಬಾಲ್-ಬೈ-ಬಾಲ್ ಸಾರಾಂಶ ಮತ್ತು ಹೈಲೈಟ್ಸ್ ಒಂದೇ ಸ್ಥಳದಲ್ಲಿ.",
      ml: "ലൈവ് സ്കോർ, ബോൾ-ബൈ-ബോൾ ചുരുക്കം, ഹൈലൈറ്റുകൾ ഒരിടത്ത്."
    },
    oneMinute: {
      te: "మ్యాచ్ ప్రారంభానికి ముందు పిచ్ రిపోర్ట్, ఫాంటసీ సూచనలు, కీలక ఆటగాళ్ల ఫారం చూపిస్తాం. మ్యాచ్ సమయంలో AI తెలుగు వ్యాఖ్యానం వేగంగా అప్డేట్ అవుతుంది.",
      en: "Before the match, the app shows pitch notes, fantasy hints and player form. During play, AI Telugu commentary updates rapidly.",
      hi: "मैच से पहले पिच, फैंटेसी सुझाव और खिलाड़ी फॉर्म दिखेंगे।",
      ta: "போட்டிக்கு முன் பிச்ச், ஃபான்டஸி குறிப்புகள், வீரர் ஃபார்ம் காட்டப்படும்.",
      kn: "ಪಂದ್ಯಕ್ಕೂ ಮೊದಲು ಪಿಚ್, ಫ್ಯಾಂಟಸಿ ಸೂಚನೆಗಳು, ಆಟಗಾರರ ಫಾರ್ಮ್.",
      ml: "മത്സരത്തിനു മുൻപ് പിച്ച്, ഫാന്റസി നിർദ്ദേശങ്ങൾ, താരങ്ങളുടെ ഫോം."
    },
    source: "Sports Live",
    sourceUrl: "https://example.com/cricket",
    imageUrl: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80",
    publishedAt: ago(68),
    reactions: 22100,
    bookmarks: 2012,
    trendingScore: 94
  },
  {
    id: "vizag-it-jobs",
    category: "Jobs",
    city: "Vizag",
    headline: {
      te: "విశాఖలో కొత్త IT వాక్-ఇన్ డ్రైవ్‌లు",
      en: "New IT walk-in drives open in Vizag",
      hi: "विशाखापट्टनम में नए IT वॉक-इन ड्राइव",
      ta: "விசாகில் புதிய IT வாக்-இன் டிரைவ்கள்",
      kn: "ವಿಶಾಖದಲ್ಲಿ ಹೊಸ IT ವಾಕ್-ಇನ್ ಡ್ರೈವ್‌ಗಳು",
      ml: "വിശാഖിൽ പുതിയ IT വോക്ക്-ഇൻ ഡ്രൈവുകൾ"
    },
    summary: {
      te: "ఫ్రెషర్స్, సపోర్ట్ ఇంజినీర్లు, డేటా అనలిస్టులకు ఈ వారం ఇంటర్వ్యూలు ఉన్నాయి. సేవ్ చేసి రిమైండర్ పెట్టుకోండి.",
      en: "Freshers, support engineers and data analysts have interviews this week. Save roles and add reminders.",
      hi: "फ्रेशर्स, सपोर्ट इंजीनियर और डेटा एनालिस्ट के लिए इंटरव्यू हैं।",
      ta: "புதியவர்கள், சப்போர்ட் இன்ஜினியர்கள், டேட்டா அனலிஸ்ட்களுக்கு நேர்முகங்கள்.",
      kn: "ಫ್ರೆಶರ್ಸ್, ಸಪೋರ್ಟ್ ಎಂಜಿನಿಯರ್‌ಗಳು, ಡೇಟಾ ಅನಾಲಿಸ್ಟ್‌ಗಳಿಗೆ ಸಂದರ್ಶನಗಳು.",
      ml: "ഫ്രെഷർമാർക്കും സപ്പോർട്ട് എൻജിനീയർമാർക്കും ഡാറ്റ അനലിസ്റ്റുകൾക്കും അഭിമുഖങ്ങൾ."
    },
    oneMinute: {
      te: "మధురవాడ, ఐటీ సెజ్ ప్రాంతాల్లో మూడు కంపెనీలు వాక్-ఇన్‌లు నిర్వహిస్తున్నాయి. రిజ్యూమే, ఐడి ప్రూఫ్, రెండు ఫొటోలు తీసుకెళ్లాలి.",
      en: "Three companies near Madhurawada and the IT SEZ are hosting walk-ins. Carry resume, ID proof and photos.",
      hi: "मधुरवाड़ा और IT SEZ के पास तीन कंपनियां वॉक-इन कर रही हैं।",
      ta: "மதுரவாடா மற்றும் IT SEZ அருகே மூன்று நிறுவனங்கள் வாக்-இன் நடத்துகின்றன.",
      kn: "ಮಧುರವಾಡ ಮತ್ತು IT SEZ ಬಳಿ ಮೂರು ಕಂಪನಿಗಳು ವಾಕ್-ಇನ್ ನಡೆಸುತ್ತಿವೆ.",
      ml: "മധുരവാഡ, IT SEZ സമീപം മൂന്ന് കമ്പനികൾ വോക്ക്-ഇൻ നടത്തുന്നു."
    },
    source: "Jobs Desk",
    sourceUrl: "https://example.com/jobs",
    imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
    publishedAt: ago(96),
    reactions: 7600,
    bookmarks: 3340,
    trendingScore: 83
  }
];

export const jobs: Job[] = [
  { id: "job-1", title: "Junior Data Analyst", company: "Vizag Fintech Hub", location: "Madhurawada", type: "IT", salary: "₹4-6 LPA", applyUrl: "#", deadline: "2026-05-28" },
  { id: "job-2", title: "Village Secretariat Assistant", company: "AP Govt", location: "Guntur", type: "Govt", salary: "As per scale", applyUrl: "#", deadline: "2026-06-04" },
  { id: "job-3", title: "Customer Support Walk-in", company: "Coastal BPO", location: "Gajuwaka", type: "Walk-in", salary: "₹18k/mo", applyUrl: "#", deadline: "2026-05-21" },
  { id: "job-4", title: "Frontend Intern", company: "Hyderabad AI Labs", location: "Hyderabad", type: "Internship", salary: "₹20k/mo", applyUrl: "#", deadline: "2026-05-30" }
];

export const properties: Property[] = [
  { id: "prop-1", title: "2BHK Sea View Flat", location: "MVP Colony, Vizag", type: "Flat", price: "₹38,000/mo", imageUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80" },
  { id: "prop-2", title: "Commercial Space", location: "Benz Circle, Vijayawada", type: "Commercial", price: "₹1.2L/mo", imageUrl: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80" },
  { id: "prop-3", title: "Women PG", location: "Madhurawada", type: "PG", price: "₹8,500/mo", imageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=80" }
];

export const notifications: NotificationItem[] = [
  { id: "n1", type: "Rain", title: "Vizag rain alert", body: "Heavy showers likely after 8 PM in coastal areas.", priority: "high", createdAt: ago(8) },
  { id: "n2", type: "Cricket", title: "Powerplay update", body: "India reaches 52/1 with AI Telugu commentary live.", priority: "medium", createdAt: ago(19) },
  { id: "n3", type: "Government", title: "New pension date", body: "District-wise welfare schedule published.", priority: "medium", createdAt: ago(35) }
];
