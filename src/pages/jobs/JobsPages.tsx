import { useEffect } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { setMeta } from "@/lib/seo";
import { VaartanowJobsBoard } from "@/components/jobs/VaartanowJobsBoard";
import { JobsAdminDashboard } from "@/components/jobs/JobsAdminDashboard";

// Helper to set SEO metadata for the jobs pages
function useJobsSEO(titleKey: string, descKey: string, canonicalPath: string) {
  const { lang } = useLanguage();

  const titles: Record<string, Record<string, string>> = {
    main: {
      te: "ఉద్యోగాలు | VaartaNow AI Jobs Hub",
      en: "Jobs Hub | VaartaNow AI Jobs Board",
      hi: "जॉब्स हब | VaartaNow एआई जॉब्स",
      ta: "வேலைவாய்ப்பு | VaartaNow ஏஐ வேலைவாய்ப்பு",
      kn: "ಉದ್ಯೋಗಗಳು | VaartaNow ಎಐ ಉದ್ಯೋಗ ಹಬ್"
    },
    wfh: {
      te: "ఇంటి నుండి పని (WFH) ఉద్యోగాలు | VaartaNow",
      en: "Work From Home (WFH) Jobs | VaartaNow",
      hi: "घर से काम (WFH) नौकरियां | VaartaNow",
      ta: "வீட்டிலிருந்து வேலை (WFH) | VaartaNow",
      kn: "ಮನೆಯಿಂದಲೇ ಕೆಲಸ (WFH) ಉದ್ಯೋಗಗಳು | VaartaNow"
    },
    fresher: {
      te: "ఫ్రెషర్స్ ఉద్యోగాలు | VaartaNow",
      en: "Fresher Jobs & Internships | VaartaNow",
      hi: "फ्रेशर्स नौकरियां | VaartaNow",
      ta: "புதுமுகங்கள் வேலைவாய்ப்பு | VaartaNow",
      kn: "ಫ್ರೆಶರ್ಸ್ ಉದ್ಯೋಗಗಳು | VaartaNow"
    },
    experienced: {
      te: "అనుభవజ్ఞులైన వారికి ఉద్యోగాలు | VaartaNow",
      en: "Experienced Professional Jobs | VaartaNow",
      hi: "अनुभवी पेशेवरों के लिए नौकरियां | VaartaNow",
      ta: "அனுபவம் வாய்ந்தவர்களுக்கான வேலைகள் | VaartaNow",
      kn: "ಅನುಭವಿ ಉದ್ಯೋಗಗಳು | VaartaNow"
    },
    freelance: {
      te: "ఫ్రీలాన్స్ & కాంట్రాక్ట్ పనులు | VaartaNow",
      en: "Freelance & Contract Gigs | VaartaNow",
      hi: "फ्रीलांस और अनुबंध कार्य | VaartaNow",
      ta: "ஃப்ரீலான்ஸ் மற்றும் ஒப்பந்த வேலைகள் | VaartaNow",
      kn: "ಫ್ರೀಲಾನ್ಸ್ ಮತ್ತು ಗುತ್ತಿಗೆ ಉದ್ಯೋಗಗಳು | VaartaNow"
    },
    internships: {
      te: "ఇంటర్న్‌షిప్ అవకాశాలు | VaartaNow",
      en: "Internships & Traineeships | VaartaNow",
      hi: "इंटर्नशिप के अवसर | VaartaNow",
      ta: "இன்டர்ன்ஷிப் வாய்ப்புகள் | VaartaNow",
      kn: "ಇಂಟರ್ನ್‌ಶಿಪ್ ಅವಕಾಶಗಳು | VaartaNow"
    },
    government: {
      te: "ప్రభుత్వ ఉద్యోగాలు (Govt Jobs) | VaartaNow",
      en: "Government Jobs Recruitment | VaartaNow",
      hi: "सरकारी नौकरियां | VaartaNow",
      ta: "அரசு வேலைவாய்ப்பு | VaartaNow",
      kn: "ಸರ್ಕಾರಿ ಉದ್ಯೋಗಗಳು | VaartaNow"
    },
    startup: {
      te: "స్టార్టప్ ఉద్యోగాలు | VaartaNow",
      en: "Startup Gigs & AI Jobs | VaartaNow",
      hi: "स्टार्टअप नौकरियां | VaartaNow",
      ta: "ஸ்டார்ட்அப் வேலைகள் | VaartaNow",
      kn: "ಸ್ಟಾರ್ಟ್ಅಪ್ ಉದ್ಯೋಗಗಳು | VaartaNow"
    },
    remoteIt: {
      te: "రిమోట్ ఐటీ ఉద్యోగాలు | VaartaNow",
      en: "Remote IT Software Jobs | VaartaNow",
      hi: "रिमोट आईटी नौकरियां | VaartaNow",
      ta: "ரிமோட் ஐடி வேலைகள் | VaartaNow",
      kn: "ರಿಮೋಟ್ ಐಟಿ ಉದ್ಯೋಗಗಳು | VaartaNow"
    },
    admin: {
      te: "ఉద్యోగాల నిర్వాహణ కేంద్రం (Admin) | VaartaNow",
      en: "Jobs Portal Admin Center | VaartaNow",
      hi: "जॉब्स एडमिन सेंटर | VaartaNow",
      ta: "வேலைவாய்ப்பு நிர்வாக மையம் | VaartaNow",
      kn: "ಉದ್ಯೋಗಗಳ ನಿರ್ವಹಣಾ ಕೇಂದ್ರ | VaartaNow"
    }
  };

  const descriptions: Record<string, Record<string, string>> = {
    main: {
      te: "ఆంధ్రప్రదేశ్, తెలంగాణ మరియు రిమోట్ ఐటీ రంగంలో వేలాది ఉద్యోగ అవకాశాలు.",
      en: "Search thousands of job listings including Freshers, WFH, IT, Freelance & Govt openings.",
      hi: "नवीनतम नौकरियों, आईटी, सरकारी और फ्रीलांसिंग अवसरों की खोज करें।",
      ta: "புதிய வேலைகள், ஐடி மற்றும் அரசு வேலைவாய்ப்புகளை தேடுங்கள்.",
      kn: "ಹೊಸ ಉದ್ಯೋಗಗಳು, ಐಟಿ ಮತ್ತು ಸರ್ಕಾರಿ ಉದ್ಯೋಗಾವಕಾಶಗಳನ್ನು ಹುಡುಕಿ."
    },
    wfh: {
      te: "ఇంటి నుండి పని చేసే చక్కటి రిమోట్ ఉద్యోగ అవకాశాలు.",
      en: "Find high-paying remote and work from home opportunities across top tech firms.",
      hi: "शीर्ष कंपनियों में घर से काम करने वाले रिमोट जॉब्स ढूंढें।",
      ta: "வீட்டிலிருந்து வேலை செய்யும் சிறந்த வேலை வாய்ப்புகள்.",
      kn: "ಮನೆಯಿಂದಲೇ ಕೆಲಸ ಮಾಡುವ ರಿಮೋಟ್ ಉದ್ಯೋಗಾವಕಾಶಗಳು."
    },
    fresher: {
      te: "డిగ్రీ మరియు బీటెక్ పూర్తి చేసిన అభ్యర్థుల కోసం ఫ్రెషర్స్ ఉద్యోగాలు.",
      en: "Perfect entry-level and junior trainee vacancies for recent graduates.",
      hi: "हाल ही में स्नातक हुए छात्रों के लिए एंट्री-लेवल नौकरियां।",
      ta: "இளம் பட்டதாரிகளுக்கான ஆரம்ப நிலை வேலை வாய்ப்புகள்.",
      kn: "ಇತ್ತೀಚಿನ ಪದವೀಧರರಿಗೆ ಪ್ರವೇಶ ಮಟ್ಟದ ಉದ್ಯೋಗಗಳು."
    },
    experienced: {
      te: "అనుభవజ్ఞులైన అభ్యర్థుల కోసం సీనియర్ మరియు లీడ్ లెవెల్ ఉద్యోగ అప్‌డేట్స్.",
      en: "Senior, mid-level, and leadership roles in engineering, management, and more.",
      hi: "वरिष्ठ और मध्यम स्तर के अनुभवी पेशेवरों के लिए बेहतरीन नौकरियां।",
      ta: "அனுபவம் வாய்ந்த பொறியாளர்கள் மற்றும் மேலாளர்களுக்கான வேலைகள்.",
      kn: "ಅನುಭವಿ ವೃತ್ತಿಪರರಿಗಾಗಿ ಅತ್ಯುತ್ತಮ ಉದ್ಯೋಗಗಳು."
    },
    freelance: {
      te: "ఫ్లెక్సిబుల్ పని వేళలతో ఫ్రీలాన్స్, కాంట్రాక్ట్ మరియు పార్ట్ టైమ్ ప్రాజెక్టులు.",
      en: "Browse flexible contract terms, translation gigs, and freelance portfolios.",
      hi: "लचीले फ्रीलांसिंग प्रोजेक्ट और अल्पकालिक अनुबंध कार्य खोजें।",
      ta: "ஃப்ரீலான்ஸ் மற்றும் பகுதிநேர ஒப்பந்த திட்டங்கள்.",
      kn: "ಅರೆಕಾಲಿಕ ಮತ್ತು ಫ್ರೀಲಾನ್ಸ್ ಗುತ್ತಿಗೆ ಉದ್ಯೋಗಗಳು."
    },
    internships: {
      te: "స్టూడెంట్స్ కోసం పెయిడ్ ఇంటర్న్‌షిప్ మరియు స్టైపెండ్ ఉద్యోగ అవకాశాలు.",
      en: "Paid technical and operational internships for collegiate students.",
      hi: "छात्रों के लिए सशुल्क इंटर्नशिप और वजीफा के अवसर।",
      ta: "மாணவர்களுக்கான கட்டண இன்டர்ன்ஷிப் வாய்ப்புகள்.",
      kn: "ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಪಾವತಿಸಿದ ಇಂಟರ್ನ್‌ಶಿಪ್‌ಗಳು."
    },
    government: {
      te: "ఏపీపీఎస్సీ, టీఎస్‌పీఎస్సీ బ్రేకింగ్ ప్రభుత్వ ఉద్యోగ నోటిఫికేషన్లు.",
      en: "Latest state civil services, administrative boards, and public sector notifications.",
      hi: "नवीनतम सरकारी और लोक सेवा आयोग भर्ती अधिसूचनाएं।",
      ta: "சமீபத்திய அரசு மற்றும் பொதுத்துறை வேலைவாய்ப்பு அறிவிப்புகள்.",
      kn: "ಇತ್ತೀಚಿನ ಸರ್ಕಾರಿ ಉದ್ಯೋಗ ನೇಮಕಾತಿ ಅಧಿಸೂಚನೆಗಳು."
    },
    startup: {
      te: "స్టార్టప్స్ మరియు కొత్త కంపెనీలలో డైనమిక్ ఉద్యోగ అవకాశాలు.",
      en: "Join high-growth startups and build future-proof artificial intelligence tools.",
      hi: "तेजी से बढ़ते स्टार्टअप और एआई प्रयोगशालाओं में शामिल हों।",
      ta: "வளர்ந்து வரும் ஸ்டார்ட்அப்களில் சிறந்த வேலை வாய்ப்புகள்.",
      kn: "ವೇಗವಾಗಿ ಬೆಳೆಯುತ್ತಿರುವ ಸ್ಟಾರ್ಟ್ಅಪ್ ಉದ್ಯೋಗಗಳು."
    },
    remoteIt: {
      te: "సాఫ్ట్‌వేర్ రంగంలో రిమోట్ ఐటీ డెవలపర్ ఉద్యోగ అవకాశాలు.",
      en: "Explore frontend, fullstack, backend, and cloud remote engineering openings.",
      hi: "सॉफ्टवेयर, क्लाउड और वेब डेवलपमेंट में रिमोट नौकरियां।",
      ta: "மென்பொருள் மற்றும் கிளவுட் இன்ஜினியரிங் துறையில் ரிமோட் வேலைகள்.",
      kn: "ಸಾಫ್ಟ್‌ವೇರ್ ಮತ್ತು ಕ್ಲೌಡ್ ತಂತ್ರಜ್ಞಾನದಲ್ಲಿ ರಿಮೋಟ್ ಉದ್ಯೋಗಗಳು."
    },
    admin: {
      te: "ఉద్యోగాల డేటాబేస్ పర్యవేక్షణ మరియు నవీకరణ ప్యానెల్.",
      en: "Manage, audit, feature, and review automated crawler records.",
      hi: "नौकरी डेटाबेस प्रबंधन और ऑटो-क्रॉलर समीक्षा पैनल।",
      ta: "வேலைவாய்ப்பு தரவுத்தள மேலாண்மை மற்றும் நிர்வாக குழு.",
      kn: "ಉದ್ಯೋಗಗಳ ನಿರ್ವಹಣೆ ಮತ್ತು ಪರಿಶೀಲನಾ ಫಲಕ."
    }
  };

  useEffect(() => {
    const selectedTitle = titles[titleKey]?.[lang] || titles[titleKey]?.te || "Jobs";
    const selectedDesc = descriptions[descKey]?.[lang] || descriptions[descKey]?.te || "Jobs Board";

    setMeta({
      title: `${selectedTitle} | VaartaNow`,
      description: selectedDesc,
      canonical: canonicalPath
    });
  }, [lang, titleKey, descKey, canonicalPath]);
}

// 1. Unified Jobs Board Page
export function JobsMainPage() {
  useJobsSEO("main", "main", "/jobs");
  return (
    <main className="container-shell py-4">
      <VaartanowJobsBoard />
    </main>
  );
}

// 2. Work From Home Page
export function JobsWFHPage() {
  useJobsSEO("wfh", "wfh", "/jobs/work-from-home");
  return (
    <main className="container-shell py-4">
      <VaartanowJobsBoard initialCategoryFilter="WFH" initialWorkModeFilter="Remote" />
    </main>
  );
}

// 3. Fresher Jobs Page
export function JobsFresherPage() {
  useJobsSEO("fresher", "fresher", "/jobs/fresher-jobs");
  return (
    <main className="container-shell py-4">
      <VaartanowJobsBoard initialCategoryFilter="Freshers" />
    </main>
  );
}

// 4. Experienced Jobs Page
export function JobsExperiencedPage() {
  useJobsSEO("experienced", "experienced", "/jobs/experienced-jobs");
  return (
    <main className="container-shell py-4">
      <VaartanowJobsBoard initialCategoryFilter="Experienced" />
    </main>
  );
}

// 5. Freelance Gigs Page
export function JobsFreelancePage() {
  useJobsSEO("freelance", "freelance", "/jobs/freelance");
  return (
    <main className="container-shell py-4">
      <VaartanowJobsBoard initialCategoryFilter="Freelance" initialContractFilter="Freelance" />
    </main>
  );
}

// 6. Internship Opportunities Page
export function JobsInternshipPage() {
  useJobsSEO("internships", "internships", "/jobs/internships");
  return (
    <main className="container-shell py-4">
      <VaartanowJobsBoard initialCategoryFilter="Internships" initialContractFilter="Internship" />
    </main>
  );
}

// 7. Government Careers Page
export function JobsGovernmentPage() {
  useJobsSEO("government", "government", "/jobs/government");
  return (
    <main className="container-shell py-4">
      <VaartanowJobsBoard initialCategoryFilter="Government" />
    </main>
  );
}

// 8. Startups & AI Opportunities Page
export function JobsStartupPage() {
  useJobsSEO("startup", "startup", "/jobs/startup");
  return (
    <main className="container-shell py-4">
      <VaartanowJobsBoard initialCategoryFilter="Startup" />
    </main>
  );
}

// 9. Remote IT Software Page
export function JobsRemoteITPage() {
  useJobsSEO("remoteIt", "remoteIt", "/jobs/remote-it");
  return (
    <main className="container-shell py-4">
      <VaartanowJobsBoard initialCategoryFilter="Remote IT" initialWorkModeFilter="Remote" />
    </main>
  );
}

// 10. Jobs Administrative Dashboard
export function JobsAdminPage() {
  useJobsSEO("admin", "admin", "/jobs/admin");
  return (
    <main className="container-shell py-4">
      <JobsAdminDashboard />
    </main>
  );
}
