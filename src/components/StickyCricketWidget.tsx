import { useEffect, useState, useMemo, useRef } from "react";
import { 
  X, 
  Award, 
  ChevronUp, 
  ChevronDown, 
  Check, 
  TrendingUp, 
  Trophy, 
  Play, 
  Pause, 
  RotateCcw, 
  Activity, 
  Zap
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface ReplayBall {
  overs: number;
  runs: number;
  wickets: number;
  batter1: { name: string; runs: number; balls: number };
  batter2: { name: string; runs: number; balls: number };
  bowler: { name: string; wickets: number; runs: number; overs: number };
  commentary: {
    te: string;
    en: string;
    hi: string;
    ta: string;
    kn: string;
  };
  type: "dot" | "run" | "four" | "six" | "wicket";
}

interface StickyCricketWidgetProps {
  mode?: "floating" | "banner";
  onOpenLiveView?: () => void;
}

// ============================================================================
// MATCH 1: IPL ELIMINATOR - SRH vs RR (May 27, 2026)
// ============================================================================
const ELIMINATOR_REPLAY_BALLS: ReplayBall[] = [
  {
    overs: 17.1,
    runs: 171,
    wickets: 7,
    batter1: { name: "Heinrich Klaasen", runs: 62, balls: 30 },
    batter2: { name: "Pat Cummins", runs: 11, balls: 7 },
    bowler: { name: "Sandeep Sharma", wickets: 1, runs: 29, overs: 3.1 },
    commentary: {
      te: "ఒక్క పరుగు.. కమ్మీన్స్ ఆఫ్ స్టంప్ వెలుపల వేసిన బంతిని థర్డ్ మ్యాన్ దిశగా నెట్టి సింగిల్ తీశాడు.",
      en: "Sandeep Sharma to Cummins, 1 run, steered down to third-man for a single.",
      hi: "एक रन.. कमिंस ने ऑफ स्टंप के बाहर की गेंद को थर्ड मैन की तरफ धकेलकर सिंगल लिया।",
      ta: "ஒரு ரன்.. கம்மின்ஸ் ஆஃப் ஸ்டம்பிற்கு வெளியே வந்த பந்தை தேர்ட் மேன் திசையில் தட்டி சிங்கிள் எடுத்தார்.",
      kn: "ಒಂದು ರನ್.. ಕಮ್ಮಿನ್ಸ್ ಆಫ್ ಸ್ಟಂಪ್ ಹೊರಗಿನ ಚೆಂಡನ್ನು ಥರ್ಡ್ ಮ್ಯಾನ್ ಕಡೆಗೆ ತಳ್ಳಿ ಸಿಂಗಲ್ ಪಡೆದರು."
    },
    type: "run"
  },
  {
    overs: 17.2,
    runs: 177,
    wickets: 7,
    batter1: { name: "Heinrich Klaasen", runs: 68, balls: 31 },
    batter2: { name: "Pat Cummins", runs: 11, balls: 7 },
    bowler: { name: "Sandeep Sharma", wickets: 1, runs: 35, overs: 3.2 },
    commentary: {
      te: "సిక్సర్!!! క్లాసెన్ బంతిని అద్భుతమైన బ్యాట్ స్వింగ్ తో లాంగ్-ఆన్ మీదుగా గాల్లోకి లేపాడు.. బంతి స్టాండ్స్ లో పడింది!",
      en: "SIX! Pure power! Heinrich Klaasen stands tall and launches it high over deep long-on for a monster maximum!",
      hi: "छक्का!!! क्लासेन ने शानदार शॉट लगाया, गेंद लॉन्ग-ऑन बाउंड्री के पार स्टैंड्स में!",
      ta: "சிக்சர்!!! கிளாசென் பந்தை லாங்-ஆன் திசையில் பறக்கவிட்டு மெகா சிக்ஸ் அடித்தார்!",
      kn: "ಸಿಕ್ಸರ್!!! ಕ್ಲಾಸೆನ್ ಅದ್ಭುತ ಬ್ಯಾಟ್ ಸ್ವಿಂಗ್ ಮೂಲಕ ಚೆಂಡನ್ನು ಲಾಂಗ್-ಆನ್ ಮೇಲಿಂದ ಪ್ರೇಕ್ಷಕರ ಗ್ಯಾಲರಿಗೆ ಅಟ್ಟಿದರು!"
    },
    type: "six"
  },
  {
    overs: 17.3,
    runs: 177,
    wickets: 8,
    batter1: { name: "Heinrich Klaasen", runs: 68, balls: 32 },
    batter2: { name: "Pat Cummins", runs: 11, balls: 7 },
    bowler: { name: "Sandeep Sharma", wickets: 2, runs: 35, overs: 3.3 },
    commentary: {
      te: "అవుట్!! క్లాసెన్ అవుట్! సందీప్ వైడ్ డెలివరీని లాంగ్-ఆఫ్ మీదుగా బాదే ప్రయత్నంలో బౌండరీ వద్ద రోవ్‌మన్ పావెల్ కు క్యాచ్ ఇచ్చాడు. సంచలన ముగింపు!",
      en: "OUT! Massive blow! Heinrich Klaasen reaches for a wide ball, slices it in the air, and is caught by Rovman Powell at long-off!",
      hi: "आउट!! क्लासेन आउट! बड़ा शॉट लगाने के प्रयास में बाउंड्री पर रोवमैन पॉवेल को कैच थमा बैठे।",
      ta: "அவுட்!! கிளாசென் அவுட்! பெரிய ஷாட் அடிக்க முயன்று எல்லையில் ரோவ்மன் பாவெலிடம் கேட்ச் கொடுத்தார்.",
      kn: "ಔಟ್!! ಕ್ಲಾಸೆನ್ ಔಟ್! ಮತ್ತೊಂದು ಭರ್ಜರಿ ಹೊಡೆತಕ್ಕೆ ಕೈಹಾಕಿ ಬೌಂಡರಿ ಗೆರೆಯಲ್ಲಿ ರೋವ್ಮನ್ ಪೊವೆಲ್‌ಗೆ ಕ್ಯಾಚ್ ನೀಡಿದರು."
    },
    type: "wicket"
  },
  {
    overs: 17.4,
    runs: 178,
    wickets: 8,
    batter1: { name: "Bhuvneshwar Kumar", runs: 1, balls: 1 },
    batter2: { name: "Pat Cummins", runs: 11, balls: 7 },
    bowler: { name: "Sandeep Sharma", wickets: 2, runs: 36, overs: 3.4 },
    commentary: {
      te: "ఒక్క పరుగు.. భువనేశ్వర్ లెగ్ సైడ్ లోకి నెట్టి వేగంగా సింగిల్ తో ఖాతా తెరిచాడు.",
      en: "Sandeep Sharma to Bhuvneshwar Kumar, 1 run, tucked away to deep square leg to get off the mark.",
      hi: "एक रन.. भुवनेश्वर कुमार ने लेग साइड में खेलकर अपना खाता खोला।",
      ta: "ஒரு ரன்.. புவனேஷ்வர் குமார் லெக் சைடில் தட்டிவிட்டு தனது கணக்கைத் தொடங்கினார்.",
      kn: "ಒಂದು ರನ್.. ಭುವನೇಶ್ವರ್ ಕುಮಾರ್ ಲೆಗ್ ಸೈಡ್‌ನಲ್ಲಿ ತಟ್ಟಿ ಸಿಂಗಲ್ ಮೂಲಕ ಖಾತೆ ತೆರೆದರು."
    },
    type: "run"
  },
  {
    overs: 17.5,
    runs: 182,
    wickets: 8,
    batter1: { name: "Bhuvneshwar Kumar", runs: 1, balls: 1 },
    batter2: { name: "Pat Cummins", runs: 15, balls: 8 },
    bowler: { name: "Sandeep Sharma", wickets: 2, runs: 40, overs: 3.5 },
    commentary: {
      te: "ఫోర్!! కమ్మీన్స్ ఆఫ్ స్టంప్ వెలుపల వచ్చిన హాఫ్-ట్రాకర్ ని డీప్ ఎక్స్‌ట్రా కవర్ గ్యాప్ గుండా బౌండరీకి తరలించాడు!",
      en: "FOUR! Pat Cummins stands tall and lofts the slower ball beautifully over extra-cover for a crucial boundary!",
      hi: "चौका!! कमिंस ने धीमी गेंद को डीप एक्स्ट्रा कवर के खाली स्थान से सीमा रेखा के बाहर भेजा।",
      ta: "பவுண்டரி!! கம்மின்ஸ் மெதுவான பந்தை எக்ஸ்ட்ரா கவர் திசையில் லாவகமாக அடித்து பவுண்டரி பெற்றார்.",
      kn: "ಬೌಂಡರಿ!! ಕಮ್ಮಿನ್ಸ್ ನಿಧಾನಗತಿಯ ಎಸೆತವನ್ನು ಎಕ್ಸ್‌ಟ್ರಾ ಕವರ್ ಮೇಲೆ ಅದ್ಭುತವಾಗಿ ಹೊಡೆದು ಬೌಂಡರಿ ಗಳಿಸಿದರು."
    },
    type: "four"
  },
  {
    overs: 17.6,
    runs: 183,
    wickets: 8,
    batter1: { name: "Bhuvneshwar Kumar", runs: 1, balls: 1 },
    batter2: { name: "Pat Cummins", runs: 16, balls: 9 },
    bowler: { name: "Sandeep Sharma", wickets: 2, runs: 41, overs: 4.0 },
    commentary: {
      te: "ఒక్క పరుగు.. డీప్ మిడ్-వికెట్ వైపు సింగిల్ తో ఓవర్ ముగిసింది. ఎస్ఆర్హెచ్ విజయానికి చివరి 12 బంతుల్లో 61 పరుగులు కావాలి.",
      en: "Sandeep finishes the over with a single to deep midwicket. SRH need 61 runs in the final 2 overs.",
      hi: "एक रन.. सिंगल के साथ ओवर समाप्त। हैदराबाद को जीत के लिए आखिरी 12 गेंदों में 61 रन चाहिए।",
      ta: "ஒரு ரன்.. சிங்கிளுடன் ஓவர் முடிந்தது. ஹைதராபாத் வெற்றிக்கு கடைசி 12 பந்துகளில் 61 ரன்கள் தேவை.",
      kn: "ಒಂದು ರನ್.. ಸಿಂಗಲ್‌ನೊಂದಿಗೆ ಓವರ್ ಮುಕ್ತಾಯ. ಹೈದರಾಬಾದ್ ಗೆಲುವಿಗೆ ಕೊನೆಯ ಓವರ್‌ನಲ್ಲಿ 61 ರನ್ ಅಗತ್ಯವಿದೆ."
    },
    type: "run"
  },
  {
    overs: 18.1,
    runs: 183,
    wickets: 9,
    batter1: { name: "Bhuvneshwar Kumar", runs: 1, balls: 1 },
    batter2: { name: "Pat Cummins", runs: 16, balls: 10 },
    bowler: { name: "Jofra Archer", wickets: 3, runs: 28, overs: 3.1 },
    commentary: {
      te: "అవుట్!! జోఫ్రా ఆర్చర్ అద్భుతమైన పేస్ తో కమ్మీన్స్ ను బోల్తా కొట్టించాడు, ఎడ్జ్ తీసుకున్న బంతిని డీప్ వికెట్ లో రియాన్ పరాగ్ ఒడిసిపట్టాడు!",
      en: "OUT! Jofra Archer strikes! Cummins goes for the big heave against the 148kph delivery, gets a top-edge caught cleanly by Riyan Parag!",
      hi: "आउट!! जोफ्रा आर्चर ने झटका एक और विकेट! कमिंस बड़ा शॉट खेलने के प्रयास में रियान पराग के हाथों कैच आउट!",
      ta: "அவுட்!! ஜோஃப்ரா ஆர்ச்சர் வேகத்தில் கம்மின்ஸை வீழ்த்தினார், டீப் மிட்விக்கெட்டில் ரியான் பராக் கேட்ச் பிடித்தார்!",
      kn: "ಔಟ್!! ಜೋಫ್ರಾ ಆರ್ಚರ್ ವೇಗಕ್ಕೆ ಕಮ್ಮಿನ್ಸ್ ಬಲಿ! ಭರ್ಜರಿ ಹೊಡೆತಕ್ಕೆ ಯತ್ನಿಸಿ ಆರ್ಚರ್ ಎಸೆತದಲ್ಲಿ ರಿಯಾನ್ ಪರಾಗ್‌ಗೆ ಕ್ಯಾಚ್ ನೀಡಿದರು!"
    },
    type: "wicket"
  },
  {
    overs: 18.2,
    runs: 184,
    wickets: 9,
    batter1: { name: "Bhuvneshwar Kumar", runs: 1, balls: 1 },
    batter2: { name: "Praful Hinge", runs: 1, balls: 1 },
    bowler: { name: "Jofra Archer", wickets: 3, runs: 29, overs: 3.2 },
    commentary: {
      te: "ఒక్క పరుగు.. హింగే కవర్స్ దిశగా నెట్టి క్విక్ సింగిల్ పూర్తి చేసాడు.",
      en: "Archer to Praful Hinge, 1 run, pushed soft to cover for a rapid single.",
      hi: "एक रन.. हिंगे ने कवर्स की ओर धकेलकर तेजी से सिंगल चुराया।",
      ta: "ஒரு ரன்.. ஹிங்கே கवर्स திசையில் தட்டிவிட்டு ஒரு விரைவான சிங்கிள் எடுத்தார்.",
      kn: "ಒಂದು ರನ್.. ಹಿಂಗೆ ಕವರ್ಸ್ ಕಡೆಗೆ ಚೆಂಡನ್ನು ತಳ್ಳಿ ಚುರುಕಿನ ಸಿಂಗಲ್ ಪಡೆದರು."
    },
    type: "run"
  },
  {
    overs: 18.3,
    runs: 186,
    wickets: 9,
    batter1: { name: "Bhuvneshwar Kumar", runs: 3, balls: 2 },
    batter2: { name: "Praful Hinge", runs: 1, balls: 1 },
    bowler: { name: "Jofra Archer", wickets: 3, runs: 31, overs: 3.3 },
    commentary: {
      te: "రెండు పరుగులు.. భువనేశ్వర్ మిడ్-వికెట్ గ్యాప్ లోకి ఆడి వేగంగా రెండు పరుగులు పూర్తి చేశారు.",
      en: "Bhuvneshwar Kumar clips Jofra past short midwicket, runs hard and completes a quick brace.",
      hi: "दो रन.. भुवनेश्वर ने सूझबूझ से शॉर्ट मिडविकेट के पास खेला और दो रन पूरे किए।",
      ta: "இரண்டு ரன்கள்.. புவனேஷ்வர் குமார் மிட்விக்கெட்டில் தட்டிவிட்டு வேகமாக இரண்டு ரன்கள் ஓடினார்.",
      kn: "ಎರಡು ರನ್.. ಭುವನೇಶ್ವರ್ ಕುಮಾರ್ ಮಿಡ್-ವಿಕೆಟ್ ಕಡೆಗೆ ಹೊಡೆದು ಚುರುಕಾಗಿ ಎರಡು ರನ್ ಕಲೆಹಾಕಿದರು."
    },
    type: "run"
  },
  {
    overs: 18.4,
    runs: 187,
    wickets: 9,
    batter1: { name: "Bhuvneshwar Kumar", runs: 4, balls: 3 },
    batter2: { name: "Praful Hinge", runs: 1, balls: 1 },
    bowler: { name: "Jofra Archer", wickets: 3, runs: 32, overs: 3.4 },
    commentary: {
      te: "ఒక్క పరుగు.. షార్ట్ లెంగ్త్ బంతిని భువనేశ్వర్ ఫైన్ లెగ్ దిశగా తరలించాడు.",
      en: "Jofra Archer to Bhuvneshwar, 1 run, rising bouncer, controlled pull down to fine leg.",
      hi: "एक रन.. बाउंसर गेंद को भुवनेश्वर ने फाइन लेग की तरफ कंट्रोल के साथ खेला।",
      ta: "ஒரு ரன்.. ஆர்ச்சரின் பவுன்சர் பந்தை புவனேஷ்வர் ஃபைன் லெக் திசையில் தட்டி சிங்கிள் எடுத்தார்.",
      kn: "ಒಂದು ರನ್.. ಆರ್ಚರ್ ಬೌನ್ಸರ್ ಎಸೆತವನ್ನು ಭುವನೇಶ್ವರ್ ಫೈನ್ ಲೆಗ್ ಕಡೆಗೆ ತಳ್ಳಿ ಸಿಂಗಲ್ ಪಡೆದರು."
    },
    type: "run"
  },
  {
    overs: 18.5,
    runs: 191,
    wickets: 9,
    batter1: { name: "Bhuvneshwar Kumar", runs: 4, balls: 3 },
    batter2: { name: "Praful Hinge", runs: 5, balls: 2 },
    bowler: { name: "Jofra Archer", wickets: 3, runs: 36, overs: 3.5 },
    commentary: {
      te: "ఫోర్!! హింగే బ్యాట్ అవుట్ సైడ్ ఎడ్జ్ తగిలి బంతి థర్డ్ స్లిప్ మీదుగా బౌండరీ దాటింది! ఎస్ఆర్హెచ్ లక్!",
      en: "FOUR! Praful Hinge swings hard, gets a thick outside edge that flies over the vacant slip region into the boundary!",
      hi: "चौका!! हिंगे ने तेजी से बल्ला घुमाया, बाहरी किनारा लेकर गेंद स्लिप के ऊपर से सीमा रेखा पार!",
      ta: "பவுண்டரி!! ஹிங்கே பேட்டை சுழற்ற, அவுட்சைட் எட்ஜ் ஆகி பந்து ஸ்லிப் பகுதிக்கு மேல் பவுண்டரிக்குச் சென்றது!",
      kn: "ಬೌಂಡರಿ!! ಹಿಂಗೆ ಬ್ಯಾಟ್ ಬೀಸಿದರು, ಹೊರ ಅಂಚು ಪಡೆದ ಚೆಂಡು ಸ್ಲಿಪ್ ಮೇಲೆ ಹಾರಿ ಬೌಂಡರಿ ಗೆರೆ ದಾಟಿತು!"
    },
    type: "four"
  },
  {
    overs: 18.6,
    runs: 192,
    wickets: 9,
    batter1: { name: "Bhuvneshwar Kumar", runs: 4, balls: 3 },
    batter2: { name: "Praful Hinge", runs: 6, balls: 3 },
    bowler: { name: "Jofra Archer", wickets: 3, runs: 37, overs: 4.0 },
    commentary: {
      te: "ఒక్క పరుగు.. సింగిల్ తో ఆర్చర్ స్పెల్ ముగిసింది (3/37). ఎస్ఆర్హెచ్ విజయానికి చివరి ఓవర్ లో 52 పరుగులు కావాలి.",
      en: "Jofra Archer completes an exceptional match-winning spell of 4-0-37-3. SRH need 52 off the final over.",
      hi: "एक रन.. आर्चर का बेहतरीन स्पैल समाप्त (3/37)। हैदराबाद को आखिरी ओवर में जीत के लिए 52 रन चाहिए।",
      ta: "ஒரு ரன்.. ஆர்ச்சரின் அருமையான ஸ்பெல் நிறைவடைந்தது (3/37). கடைசி ஓவரில் ஹைதராபாத் வெற்றிக்கு 52 ரன்கள் தேவை.",
      kn: "ಒಂದು ರನ್.. ಆರ್ಚರ್ ಅತ್ಯುತ್ತಮ ಸ್ಪೆಲ್ ಮುಕ್ತಾಯಗೊಳಿಸಿದರು (3/37). ಹೈದರಾಬಾದ್ ಗೆಲುವಿಗೆ ಕೊನೆಯ ಓವರ್‌ನಲ್ಲಿ 52 ರನ್ ಅಗತ್ಯವಿದೆ."
    },
    type: "run"
  },
  {
    overs: 19.1,
    runs: 196,
    wickets: 9,
    batter1: { name: "Bhuvneshwar Kumar", runs: 4, balls: 3 },
    batter2: { name: "Praful Hinge", runs: 10, balls: 4 },
    bowler: { name: "Sandeep Sharma", wickets: 2, runs: 45, overs: 4.1 },
    commentary: {
      te: "ఫోర్!!! ఫుల్ టాస్ బంతిని హింగే లాఫ్టెడ్ డ్రైవ్ ద్వారా బౌలర్ తల మీదుగా బౌండరీ కొట్టాడు!",
      en: "FOUR! Overpitched delivery, Praful Hinge clears his front leg and lofts it straight over Sandeep's head for a boundary!",
      hi: "चौका!!! हिंगे ने फुल टॉस गेंद को सीधे गेंदबाज के सिर के ऊपर से सीमा रेखा पार भेजा!",
      ta: "பவுண்டரி!!! ஹிங்கே ஃபுல் டாஸ் பந்தை நேராக பவுலரின் தலைக்கு மேல் தூக்கி அடித்து பவுண்டரி பெற்றார்!",
      kn: "ಬೌಂಡರಿ!!! ಫುಲ್ ಟಾಸ್ ಎಸೆತವನ್ನು ಹಿಂಗೆ ಬೌಲರ್ ತಲೆಯ ಮೇಲಿಂದ ನೇರವಾಗಿ ಬೌಂಡರಿಗೆ ಅಟ್ಟಿದರು!"
    },
    type: "four"
  },
  {
    overs: 19.2,
    runs: 196,
    wickets: 10,
    batter1: { name: "Bhuvneshwar Kumar", runs: 4, balls: 3 },
    batter2: { name: "Praful Hinge", runs: 10, balls: 5 },
    bowler: { name: "Sandeep Sharma", wickets: 3, runs: 45, overs: 4.2 },
    commentary: {
      te: "వికెట్!!! క్లీన్ బౌల్డ్!!! సందీప్ శర్మ అద్భుతమైన యార్కర్ సంధించాడు.. హింగే డిఫెండ్ చేసే లోపే వికెట్లు ఎగిరిపడ్డాయి! రాజస్థాన్ రాయల్స్ 47 పరుగుల తేడాతో ఎలిమినేటర్ పోరులో విజయం సాధించింది! 🏆🔥",
      en: "WICKET!!! CLEAN BOWLED!!! Sandeep Sharma delivers a spectacular, perfect-length yorker! Praful Hinge is late and the middle stump is uprooted! Rajasthan Royals win by 47 runs and advance to Qualifier 2! 🏆🔥",
      hi: "विकट!!! क्लीन बोल्ड!!! संदीप शर्मा ने फेंकी बेहतरीन यॉर्कर, हिंगे पूरी तरह चूके और स्टंप्स उखड़ गए! राजस्थान रॉयल्स 47 रनों से जीता! 🏆🔥",
      ta: "விக்கெட்!!! கிளீன் போல்டு!!! சந்தீப் சர்மாவின் துல்லியமான யார்க்கரில் ஹிங்கே போல்டானார்! ராஜஸ்தான் ராயல்ஸ் 47 ரன்கள் வித்தியாசத்தில் அபார வெற்றி பெற்றது! 🏆🔥",
      kn: "ವಿಕೆಟ್!!! ಕ್ಲೀನ್ ಬೌಲ್ಡ್!!! ಸಂದೀಪ್ ಶರ್ಮಾ ಎಸೆದ ನಿಖರ ಯಾರ್ಕರ್‌ಗೆ ಹಿಂಗೆ ಬೌಲ್ಡ್! ರಾಜಸ್ಥಾನ ರಾಯಲ್ಸ್ 47 ರನ್‌ಗಳ ಭರ್ಜರಿ ಜಯ ಸಾಧಿಸಿ ಕ್ವಾಲಿಫೈಯರ್ 2ಕ್ಕೆ ಲಗ್ಗೆ ಇಟ್ಟಿದೆ! 🏆🔥"
    },
    type: "wicket"
  }
];

// ============================================================================
// MATCH 2: IPL QUALIFIER 2 - GT vs RR (Scheduled for May 29, 2026)
// ============================================================================
const QUALIFIER_REPLAY_BALLS: ReplayBall[] = [
  {
    overs: 18.1,
    runs: 183,
    wickets: 4,
    batter1: { name: "Shubman Gill", runs: 84, balls: 45 },
    batter2: { name: "Rahul Tewatia", runs: 19, balls: 9 },
    bowler: { name: "Sandeep Sharma", wickets: 1, runs: 35, overs: 3.1 },
    commentary: {
      te: "ఒక్క పరుగు.. తెవాటియా కవర్స్ దిశగా నెట్టి సింగిల్ పూర్తి చేసాడు.",
      en: "Sandeep Sharma to Tewatia, 1 run, guided away softly to deep point for a single.",
      hi: "एक रन.. तेवतिया ने गेंद को डीप पॉइंट की तरफ खेलकर सिंगल लिया।",
      ta: "ஒரு ரன்.. திவேதியா பாயிண்ட் திசையில் தட்டி சிங்கிள் எடுத்தார்.",
      kn: "ಒಂದು ರನ್.. ತೇವಾಟಿಯಾ ಕವರ್ಸ್ ಕಡೆಗೆ ತಳ್ಳಿ ಸಿಂಗಲ್ ಗಳಿಸಿದರು."
    },
    type: "run"
  },
  {
    overs: 18.2,
    runs: 189,
    wickets: 4,
    batter1: { name: "Shubman Gill", runs: 90, balls: 46 },
    batter2: { name: "Rahul Tewatia", runs: 19, balls: 9 },
    bowler: { name: "Sandeep Sharma", wickets: 1, runs: 41, overs: 3.2 },
    commentary: {
      te: "సిక్సర్!!! గిల్ మోకాళ్లపై కూర్చుని అద్భుతమైన ఫ్లిక్ షాట్ తో బంతిని డీప్ స్క్వేర్ లెగ్ బౌండరీ దాటించాడు!",
      en: "SIX! Stand and deliver! Shubman Gill clips the low full toss cleanly over deep square-leg into the crowd!",
      hi: "छक्का!!! गिल ने शानदार फ्लिक शॉट लगाया, गेंद डीप स्क्वायर लेग बाउंड्री के पार!",
      ta: "சிக்சர்!!! கில் லோ ஃபுல் டாஸ் பந்தை லாவகமாக டீப் ஸ்கொயர் லெக் திசையில் சிக்ஸருக்கு பறக்கவிட்டார்!",
      kn: "ಸಿಕ್ಸರ್!!! ಗಿಲ್ ಅದ್ಭುತ ಫ್ಲಿಕ್ ಹೊಡೆತದ ಮೂಲಕ ಚೆಂಡನ್ನು ಡೀಪ್ ಸ್ಕ್ವೇರ್ ಲೆಗ್ ಗೆರೆ ದಾಟಿಸಿದರು!"
    },
    type: "six"
  },
  {
    overs: 18.3,
    runs: 189,
    wickets: 5,
    batter1: { name: "Shubman Gill", runs: 90, balls: 47 },
    batter2: { name: "Rahul Tewatia", runs: 19, balls: 9 },
    bowler: { name: "Sandeep Sharma", wickets: 2, runs: 41, overs: 3.3 },
    commentary: {
      te: "అవుట్!! గిల్ అవుట్! సందీప్ వైడ్ యార్కర్ ను కట్ చేసే ప్రయత్నంలో గిల్ కీపర్ సంజు శాంసన్‌కు క్యాచ్ ఇచ్చాడు! మ్యాచ్ లో భారీ మలుపు!",
      en: "OUT! The big fish is caught! Shubman Gill tries to carve a wide yorker, gets a thick edge straight to Sanju Samson! A heroic 90 off 47 ends!",
      hi: "आउट!! शुभमन गिल आउट! यॉर्कर गेंद पर बड़ा शॉट खेलने के प्रयास में कीपर संजू सैमसन को आसान कैच थमा बैठे।",
      ta: "அவுட்!! சுப்மன் கில் அவுட்! வைடு யார்க்கர் பந்தில் எட்ஜ் ஆகி விக்கெட் கீப்பர் சஞ்சு சாம்சனிடம் கேட்ச் கொடுத்தார்.",
      kn: "ಔಟ್!! ಶುಭ್‌ಮನ್ ಗಿಲ್ ಔಟ್! ವೈಡ್ ಯಾರ್ಕರ್ ಚೆಂಡನ್ನು ಕಟ್ ಮಾಡಲು ಹೋಗಿ ಕೀಪರ್ ಸಂಜು ಸ್ಯಾಮ್ಸನ್‌ಗೆ ಕ್ಯಾಚ್ ನೀಡಿದರು."
    },
    type: "wicket"
  },
  {
    overs: 18.4,
    runs: 190,
    wickets: 5,
    batter1: { name: "Rashid Khan", runs: 1, balls: 1 },
    batter2: { name: "Rahul Tewatia", runs: 19, balls: 9 },
    bowler: { name: "Sandeep Sharma", wickets: 2, runs: 42, overs: 3.4 },
    commentary: {
      te: "ఒక్క పరుగు.. రషీద్ ఖాన్ మిడ్-ఆన్ వైపు సింగిల్ తీసి ఖాతా తెరిచాడు.",
      en: "Sandeep to Rashid Khan, 1 run, pushed down to long-on to get off the mark immediately.",
      hi: "एक रन.. राशिद खान ने लॉन्ग-ऑन की तरफ खेलकर अपना खाता खोला।",
      ta: "ஒரு ரன்.. ரஷீத் கான் லாங்-ஆன் திசையில் தட்டி தனது கணக்கைத் தொடங்கினார்.",
      kn: "ಒಂದು ರನ್.. ರಶೀದ್ ಖಾನ್ ಲಾಂಗ್-ಆನ್ ಕಡೆಗೆ ತಳ್ಳಿ ಸಿಂಗಲ್ ಮೂಲಕ ಖಾತೆ ತೆರೆದರು."
    },
    type: "run"
  },
  {
    overs: 19.0,
    runs: 196,
    wickets: 5,
    batter1: { name: "Rashid Khan", runs: 1, balls: 1 },
    batter2: { name: "Rahul Tewatia", runs: 25, balls: 11 },
    bowler: { name: "Sandeep Sharma", wickets: 2, runs: 48, overs: 4.0 },
    commentary: {
      te: "సిక్సర్!!! తెవాటియా లెగ్ సైడ్ వేసిన స్లో బంతిని డీప్ మిడ్-వికెట్ మీదుగా భారీ సిక్స్ బాదాడు! మ్యాచ్ ఉత్కంఠగా మారింది!",
      en: "SIX! Rahul Tewatia is doing it again! He launches the slower ball high and handsome over deep midwicket! GT need 20 off the final over!",
      hi: "छक्का!!! तेवतिया ने धीमी गेंद को डीप मिडविकेट के ऊपर से दर्शकों के बीच भेजा! गुजरात को आखिरी ओवर में 20 रन चाहिए।",
      ta: "சிக்சர்!!! திவேதியா லெக் சைடில் வந்த பந்தை டீப் மிட்விக்கெட் திசையில் பிரம்மாண்ட சிக்ஸருக்கு தூக்கினார்! கடைசி ஓவரில் 20 ரன்கள் தேவை!",
      kn: "ಸಿಕ್ಸರ್!!! ತೇವಾಟಿಯಾ ನಿಧಾನಗತಿಯ ಎಸೆತವನ್ನು ಡೀಪ್ ಮಿಡ್-ವಿಕೆಟ್ ಮೇಲೆ ಭರ್ಜರಿ ಸಿಕ್ಸರ್‌ಗೆ ಅಟ್ಟಿದರು! ಕೊನೆ ಓವರ್‌ನಲ್ಲಿ ಜಿಟಿಗೆ 20 ರನ್ ಅಗತ್ಯವಿದೆ!"
    },
    type: "six"
  },
  {
    overs: 19.1,
    runs: 197,
    wickets: 5,
    batter1: { name: "Rashid Khan", runs: 2, balls: 2 },
    batter2: { name: "Rahul Tewatia", runs: 25, balls: 11 },
    bowler: { name: "Trent Boult", wickets: 1, runs: 33, overs: 3.1 },
    commentary: {
      te: "ఒక్క పరుగు.. బౌల్ట్ అద్భుతమైన యార్కర్ వేయగా రషీద్ సింగిల్ మాత్రమే తీయగలిగాడు.",
      en: "Trent Boult to Rashid Khan, 1 run, pinpoint yorker on middle stump, squeezed out to square-leg.",
      hi: "एक रन.. ट्रेंट बोल्ट की सटीक यॉर्कर, राशिद ने मुश्किल से स्क्वायर लेग पर खेलकर एक रन लिया।",
      ta: "ஒரு ரன்.. போல்ட்டின் துல்லியமான யார்க்கர் பந்தை ரஷீத் ஸ்கொயர் லெக் திசையில் தட்டி சிங்கிள் எடுத்தார்.",
      kn: "ಒಂದು ರನ್.. ಟ್ರೆಂಟ್ ಬೌಲ್ಟ್ ನಿಖರ ಯಾರ್ಕರ್ ಎಸೆತವನ್ನು ರಶೀದ್ ಸ್ಕ್ವೇರ್-ಲೆಗ್ ಕಡೆಗೆ ತಳ್ಳಿ ಸಿಂಗಲ್ ಪಡೆದರು."
    },
    type: "run"
  },
  {
    overs: 19.2,
    runs: 203,
    wickets: 5,
    batter1: { name: "Rashid Khan", runs: 2, balls: 2 },
    batter2: { name: "Rahul Tewatia", runs: 31, balls: 12 },
    bowler: { name: "Trent Boult", wickets: 1, runs: 39, overs: 3.2 },
    commentary: {
      te: "సిక్సర్!!! తెవాటియా ఆఫ్-స్టంప్ వెలుపలి బంతిని ఫైన్ లెగ్ మీదుగా వింతైన స్కూప్ షాట్ తో సిక్సర్ కొట్టాడు! మైదానం హోరెత్తిపోతోంది!",
      en: "SIX! Incredible scoop from Tewatia! He anticipates the full-toss outside off and scoops it over fine-leg for a sensational six!",
      hi: "छक्का!!! तेवतिया ने ऑफ स्टंप के बाहर की गेंद पर स्कूप शॉट खेला और फाइन लेग के ऊपर से छक्का लगाया!",
      ta: "சிக்சர்!!! திவேதியா ஆஃப் ஸ்டம்பிற்கு வெளியே வந்த பந்தை ஃபைன் லெக் திசையில் ஸ்கூப் செய்து சிக்ஸர் அடித்தார்!",
      kn: "ಸಿಕ್ಸರ್!!! ತೇವಾಟಿಯಾ ಅದ್ಭುತ ಸ್ಕೂಪ್ ಹೊಡೆತದ ಮೂಲಕ ಫೈನ್ ಲೆಗ್ ಮೇಲೆ ಸಿಕ್ಸರ್ ಚಚ್ಚಿದರು! ಪಂದ್ಯ ರೋಚಕ ಹಂತಕ್ಕೆ!"
    },
    type: "six"
  },
  {
    overs: 19.3,
    runs: 203,
    wickets: 6,
    batter1: { name: "Rashid Khan", runs: 2, balls: 2 },
    batter2: { name: "Rahul Tewatia", runs: 31, balls: 13 },
    bowler: { name: "Trent Boult", wickets: 2, runs: 39, overs: 3.3 },
    commentary: {
      te: "అవుట్!!! తెవాటియా అవుట్! బౌల్ట్ అద్భుతమైన స్లో బంతికి తెవాటియా లాంగ్-ఆన్ లో ట్రెంట్ బౌల్ట్ క్యాచ్ ఇవ్వగా జైస్వాల్ అద్భుతంగా క్యాచ్ పట్టాడు!",
      en: "OUT! High drama! Tewatia tries to repeat the heroics but slices the slower-ball high to deep midwicket where Yashasvi Jaiswal takes a brilliant running catch!",
      hi: "आउट!!! तेवतिया आउट! एक और बड़ा शॉट खेलने के प्रयास में हवा में मार बैठे, यशस्वी जायसवाल ने लपका शानदार कैच!",
      ta: "அவுட்!!! திவேதியா அவுட்! மற்றொரு பெரிய ஷாட் அடிக்க முயன்று டீப் மிட்விக்கெட்டில் யஷஸ்வி ஜெய்ஸ்வாலிடம் கேட்ச் கொடுத்தார்.",
      kn: "ಔಟ್!!! ತೇವಾಟಿಯಾ ಔಟ್! ಮತ್ತೊಂದು ಭಾರಿ ಹೊಡೆತಕ್ಕೆ ಯತ್ನಿಸಿ ಡೀಪ್ ಮಿಡ್-ವಿಕೆಟ್‌ನಲ್ಲಿ ಯಶಸ್ವಿ ಜೈಸ್ವಾಲ್‌ಗೆ ಕ್ಯಾಚ್ ನೀಡಿದರು."
    },
    type: "wicket"
  },
  {
    overs: 19.4,
    runs: 205,
    wickets: 6,
    batter1: { name: "Rashid Khan", runs: 4, balls: 3 },
    batter2: { name: "Sai Kishore", runs: 0, balls: 0 },
    bowler: { name: "Trent Boult", wickets: 2, runs: 41, overs: 3.4 },
    commentary: {
      te: "రెండు పరుగులు! రషీద్ ఖాన్ మిడ్-వికెట్ లో గ్యాప్ చూసి వేగంగా పరిగెత్తి రెండు పరుగులు రాబట్టాడు. జీటీకి 2 బంతుల్లో 11 పరుగులు కావాలి!",
      en: "Two runs! Rashid Khan drives Boult past midwicket, runs like lightning, and gets a vital double! GT need 11 off 2 balls!",
      hi: "दो रन! राशिद खान ने गेंद को मिडविकेट के पास धकेला और तेजी से दौड़कर दो रन पूरे किए। गुजरात को 2 गेंदों में 11 रन चाहिए।",
      ta: "இரண்டு ரன்கள்! ரஷீத் கான் மிட்விக்கெட்டில் தட்டிவிட்டு அதிவேகமாக இரண்டு ரன்கள் ஓடினார். ஜிடி வெற்றிக்கு 2 பந்துகளில் 11 ரன்கள் தேவை!",
      kn: "ಎರಡು ರನ್! ರಶೀದ್ ಖಾನ್ ಮಿಡ್-ವಿಕೆಟ್ ಕಡೆಗೆ ಹೊಡೆದು ಮಿಂಚಿನಂತೆ ಓಡಿ ಎರಡು ರನ್ ಗಳಿಸಿದರು. ಜಿಟಿಗೆ 2 ಎಸೆತಗಳಲ್ಲಿ 11 ರನ್ ಬೇಕು!"
    },
    type: "run"
  },
  {
    overs: 19.5,
    runs: 211,
    wickets: 6,
    batter1: { name: "Rashid Khan", runs: 10, balls: 4 },
    batter2: { name: "Sai Kishore", runs: 0, balls: 0 },
    bowler: { name: "Trent Boult", wickets: 2, runs: 47, overs: 3.5 },
    commentary: {
      te: "సిక్సర్!!! రషీద్ ఖాన్ హెలికాప్టర్ షాట్!!! లో ఫుల్ టాస్ ను లాంగ్-ఆన్ స్టాండ్స్ లోకి రషీద్ బాదాడు! ఉత్కంఠ క్లైమాక్స్.. చివరి బంతికి 5 పరుగులు కావాలి!",
      en: "SIX! Helicopter from Rashid Khan! He whips the low full-toss high over the long-on boundary! Unbelievable scenes, GT need 5 off the last ball!",
      hi: "छक्का!!! राशिद खान का हेलीकॉप्टर शॉट!!! लॉन्ग-ऑन बाउंड्री के बाहर अविश्वसनीय छक्का! गुजरात को आखिरी गेंद पर 5 रन चाहिए।",
      ta: "சிக்சர்!!! ரஷீத் கானின் ஹெலிகாப்டர் ஷாட்!!! லோ ஃபுல் டாஸ் பந்தை லாங்-ஆன் திசையில் சிக்ஸருக்கு வீசினார்! கடைசி பந்தில் 5 ரன்கள் தேவை!",
      kn: "ಸಿಕ್ಸರ್!!! ರಶೀದ್ ಖಾನ್ ಹೆಲಿಕಾಪ್ಟರ್ ಶಾಟ್!!! ಲೋ ಫುಲ್ ಟಾಸ್ ಎಸೆತವನ್ನು ಲಾಂಗ್-ಆನ್ ಸ್ಟ್ಯಾಂಡ್ಸ್ ಗೆ ಅಟ್ಟಿದರು! ಕೊನೆ ಎಸೆತದಲ್ಲಿ ಜಿಟಿಗೆ 5 ರನ್ ಬೇಕು!"
    },
    type: "six"
  },
  {
    overs: 19.6,
    runs: 217,
    wickets: 6,
    batter1: { name: "Rashid Khan", runs: 16, balls: 5 },
    batter2: { name: "Sai Kishore", runs: 0, balls: 0 },
    bowler: { name: "Trent Boult", wickets: 2, runs: 53, overs: 4.0 },
    commentary: {
      te: "సిక్సర్!!! నమ్మశక్యం కాని విజయం!!! రషీద్ ఖాన్ చివరి బంతికి సిక్సర్ కొట్టాడు! బౌల్ట్ వేసిన హాఫ్-ట్రాకర్ ని డీప్ స్క్వేర్ లెగ్ మీదుగా మైదానం వెలుపలికి బాదాడు! గుజరాత్ టైటాన్స్ 4 వికెట్ల తేడాతో గెలిచి ఐపీఎల్ 2026 ఫైనల్స్ కు దూసుకెళ్లింది! 🏆🎉🎉",
      en: "SIX!!! RASHID KHAN HAS DONE IT ON THE LAST BALL!!! He pulls the short bouncer high over deep square leg into the night sky! Gujarat Titans win by 4 wickets and book their spot in the IPL 2026 Finals! 🏆🎉🎉",
      hi: "छक्का!!! राशिद खान ने आखिरी गेंद पर छक्का मारकर गुजरात को जिताया!!! ऐतिहासिक जीत के साथ गुजरात टाइटंस आईपीएल 2026 के फाइनल में! 🏆🎉🎉",
      ta: "சிக்சர்!!! நம்பமுடியாத வெற்றி!!! ரஷீத் கான் கடைசி பந்தில் சிக்ஸர் அடித்து சாதித்தார்! குஜராத் டைட்டன்ஸ் 4 விக்கெட்டுகள் வித்தியாசத்தில் வெற்றி பெற்று இறுதிப்போட்டிக்கு தகுதி பெற்றது! 🏆🎉🎉",
      kn: "ಸಿಕ್ಸರ್!!! ಅಸಾಧ್ಯವಾದದ್ದನ್ನು ಸಾಧಿಸಿದ ರಶೀದ್ ಖಾನ್!!! ಕೊನೆ ಎಸೆತದಲ್ಲಿ ಭರ್ಜರಿ ಸಿಕ್ಸರ್ ಸಿಡಿಸಿ ಗುಜರಾತ್ ಟೈಟನ್ಸ್ ತಂಡಕ್ಕೆ 4 ವಿಕೆಟ್‌ಗಳ ರೋಚಕ ಜಯ ತಂದುಕೊಟ್ಟರು! ಜಿಟಿ ಫೈನಲ್ಸ್ ಪ್ರವೇಶಿಸಿದೆ! 🏆🎉🎉"
    },
    type: "six"
  }
];

export function StickyCricketWidget({ mode = "floating", onOpenLiveView }: StickyCricketWidgetProps) {
  const { lang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"tracker" | "scorecard" | "highlights" | "poll">("tracker");
  const [scorecardTeam, setScorecardTeam] = useState<"RR" | "OPP">("OPP");
  
  // State: "completed" | "replay"
  const [matchState, setMatchState] = useState<"completed" | "replay">("replay");
  const [replayIndex, setReplayIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(true);
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Dynamic Date-Based Match Matchup Selector
  const isQualifier2 = useMemo(() => {
    // Current Local Date is 2026-05-27. Tomorrow is Rest Day (28th). May 29th is Qualifier 2.
    // If the local date is May 29, 2026 or later, switch automatically to Qualifier 2.
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth(); // 0-indexed, May is 4
    const date = today.getDate();
    return year >= 2026 && month === 4 && date >= 29;
  }, []);

  // Match configurations depending on matchup
  const matchConfig = useMemo(() => {
    if (isQualifier2) {
      return {
        title: {
          te: "🏏 ఐపీఎల్ క్వాలిఫైయర్ 2 (Qualifier 2)",
          en: "🏏 IPL Qualifier 2 Live",
          hi: "🏏 आईपीएल क्वालिफायर 2 लाइव",
          ta: "🏏 ஐபிஎல் தகுதிச்சுற்று 2 நேரடி",
          kn: "🏏 ಐಪಿಎಲ್ ಕ್ವಾಲಿಫೈಯರ್ 2 ಲೈವ್"
        },
        venueText: {
          te: "అహ్మదాబాద్ స్టేడియం • క్వాలిఫైయర్ 2",
          en: "Ahmedabad Stadium • Qualifier 2",
          hi: "अहमदाबाद स्टेडियम • क्वालिफायर 2",
          ta: "அகமதாபாத் மைதானம் • தகுதிச்சுற்று 2",
          kn: "ಅಹಮದಾಬಾದ್ ಕ್ರೀಡಾಂಗಣ • ಕ್ವಾಲಿಫೈಯರ್ 2"
        },
        team1: { name: "Gujarat Titans", short: "GT", colorFrom: "from-slate-900", colorTo: "to-blue-950", finalScore: "217/6 (20.0)" },
        team2: { name: "Rajasthan Royals", short: "RR", colorFrom: "from-pink-600", colorTo: "to-purple-950", finalScore: "215/6 (20.0)" },
        target: 216,
        targetText: {
          te: "రాజస్థాన్ రాయల్స్ 215/6 (20 ఓవర్లు)",
          en: "Rajasthan Royals 215/6 (20 overs)",
          hi: "राजस्थान रॉयल्स 215/6 (20 ओवर)",
          ta: "ராஜஸ்தான் ராயல்ஸ் 215/6 (20 ஓவர்கள்)",
          kn: "ರಾಜಸ್ಥಾನ ರಾಯಲ್ಸ್ 215/6 (20 ಓವರ್‌ಗಳು)"
        },
        initialRuns: 182,
        initialWickets: 4,
        initialOvers: 18.0,
        finalRuns: 217,
        finalWickets: 6,
        finalOvers: 20.0,
        initialBatter1: { name: "Shubman Gill", runs: 84, balls: 44, status: "batting" },
        initialBatter2: { name: "Rahul Tewatia", runs: 18, balls: 8, status: "batting" },
        initialBowler: { name: "Sandeep Sharma", wickets: 1, runs: 34, overs: 3.0 },
        finalBatter1: { name: "Rashid Khan", runs: 16, balls: 5, status: "not out" },
        finalBatter2: { name: "Rahul Tewatia", runs: 31, balls: 13, status: "c Jaiswal b Boult" },
        finalBowler: { name: "Trent Boult", wickets: 2, runs: 53, overs: 4.0 },
        statusCompleted: {
          te: "మ్యాచ్ ముగిసింది • గుజరాత్ టైటాన్స్ 4 వికెట్ల తేడాతో విజయం సాధించి ఫైనల్స్ కు దూసుకెళ్లింది! 🏆",
          en: "MATCH COMPLETED • GT won by 4 wickets to reach the Finals! 🏆",
          hi: "मैच समाप्त • गुजरात टाइटंस 4 विकेट से जीतकर फाइनल में पहुंचा! 🏆",
          ta: "போட்டி முடிந்தது • ஜிடி 4 விக்கெட்டுகள் வித்தியாசத்தில் வென்று இறுதிப்போட்டிக்கு தகுதி பெற்றது! 🏆",
          kn: "ಪಂದ್ಯ ಮುಕ್ತಾಯ • ಜಿಟಿ 4 ವಿಕೆಟ್‌ಗಳಿಂದ ಗೆದ್ದು ಫೈನಲ್ ತಲುಪಿದೆ! 🏆"
        },
        commentaryInitial: [
          {
            ball: "18.0",
            descTe: "చహల్ షార్ట్ లెంగ్త్ బంతిని గిల్ డీప్ మిడ్-వికెట్ వైపు సింగిల్ కి ఆడి స్ట్రైక్ నిలుపుకున్నాడు.",
            descEn: "Yuzvendra Chahal to Shubman Gill, 1 run, pushed soft to deep midwicket to retain strike.",
            type: "run" as const
          },
          {
            ball: "17.5",
            descTe: "సిక్సర్!!! తెవాటియా స్లాగ్ స్వీప్ తో బంతిని లెగ్ సైడ్ బౌండరీ లైన్ దాటించాడు!",
            descEn: "SIX! Pulled in style! Rahul Tewatia launches Chahal high over midwicket for a maximum!",
            type: "six" as const
          }
        ],
        replayBalls: QUALIFIER_REPLAY_BALLS,
        rrBattingData: [
          { name: "Yashasvi Jaiswal", status: "c Gill b Rashid", runs: 74, balls: 41, fours: 6, sixes: 5, sr: "180.49", isStar: true },
          { name: "Sanju Samson (c & wk)", status: "c Tewatia b Kishore", runs: 58, balls: 32, fours: 4, sixes: 4, sr: "181.25", isStar: true },
          { name: "Riyan Parag", status: "b Mohit", runs: 24, balls: 18, fours: 2, sixes: 1, sr: "133.33" },
          { name: "Dhruv Jurel", status: "not out", runs: 32, balls: 19, fours: 2, sixes: 2, sr: "168.42" },
          { name: "Shimron Hetmyer", status: "run out (Gill)", runs: 12, balls: 6, fours: 1, sixes: 1, sr: "200.00" },
          { name: "Rovman Powell", status: "c Miller b Rashid", runs: 8, balls: 4, fours: 1, sixes: 0, sr: "200.00" }
        ],
        oppBowlingData: [
          { name: "Umesh Yadav", overs: "4.0", maidens: 0, runs: 42, wickets: 0, econ: "10.50" },
          { name: "Rashid Khan", overs: "4.0", maidens: 0, runs: 32, wickets: 2, econ: "8.00", isStar: true },
          { name: "Mohit Sharma", overs: "4.0", maidens: 0, runs: 48, wickets: 1, econ: "12.00" },
          { name: "Sai Kishore", overs: "4.0", maidens: 0, runs: 36, wickets: 1, econ: "9.00" },
          { name: "Rahul Tewatia", overs: "4.0", maidens: 0, runs: 50, wickets: 0, econ: "12.50" }
        ],
        oppBattingData: [
          { name: "Shubman Gill (c)", status: "c Samson b Sandeep", runs: 90, balls: 47, fours: 7, sixes: 4, sr: "191.49", isStar: true },
          { name: "Wriddhiman Saha (wk)", status: "c Parag b Boult", runs: 21, balls: 14, fours: 3, sixes: 0, sr: "150.00" },
          { name: "Sai Sudharsan", status: "b Ashwin", runs: 34, balls: 24, fours: 2, sixes: 1, sr: "141.67" },
          { name: "David Miller", status: "c Samson b Chahal", runs: 15, balls: 11, fours: 1, sixes: 1, sr: "136.36" },
          { name: "Rahul Tewatia", status: "c Jaiswal b Boult", runs: 31, balls: 13, fours: 2, sixes: 3, sr: "238.46" },
          { name: "Rashid Khan", status: "not out", runs: 16, balls: 5, fours: 0, sixes: 2, sr: "320.00", isStar: true },
          { name: "Sai Kishore", status: "not out", runs: 0, balls: 0, fours: 0, sixes: 0, sr: "0.00" }
        ],
        rrBowlingData: [
          { name: "Trent Boult", overs: "4.0", maidens: 0, runs: 53, wickets: 2, econ: "13.25" },
          { name: "Sandeep Sharma", overs: "4.0", maidens: 0, runs: 48, wickets: 2, econ: "12.00" },
          { name: "Ravichandran Ashwin", overs: "4.0", maidens: 0, runs: 35, wickets: 1, econ: "8.75" },
          { name: "Yuzvendra Chahal", overs: "4.0", maidens: 0, runs: 40, wickets: 1, econ: "10.00" },
          { name: "Jofra Archer", overs: "4.0", maidens: 0, runs: 36, wickets: 0, econ: "9.00" }
        ],
        highlights: [
          {
            title: "Rashid Khan's Epic Climax Heroics",
            desc: "Needing 20 off the final over bowled by Trent Boult, Rashid Khan plays a legendary innings, hitting two back-to-back sixes on the last two balls to secure a historic 4-wicket victory off the final delivery!"
          },
          {
            title: "Shubman Gill's Captain's Special (90 off 47)",
            desc: "Shubman Gill anchors the run-chase beautifully at Narendra Modi Stadium. Smashing 7 boundaries and 4 towering sixes, he kept the Titans highly active throughout the high-stakes chase."
          },
          {
            title: "Yashasvi's Explosive Playoff Launchpad",
            desc: "For the Royals, Yashasvi Jaiswal showcased outstanding intent, smashing 74 off just 41 balls in the first innings, laying the foundation for RR's formidable total of 215/6."
          }
        ]
      };
    }

    // Default: IPL Eliminator Match (SRH vs RR)
    return {
      title: {
        te: "🏏 ఐపీఎల్ ఎలిమినేటర్ 2026 (IPL 2026)",
        en: "🏏 IPL 2026 Eliminator",
        hi: "🏏 आईपीएल 2026 एलिमिनेटर",
        ta: "🏏 ஐபிஎல் 2026 எலிமினேட்டர்",
        kn: "🏏 ಐಪಿಎಲ್ 2026 ಎಲಿಮಿನೇಟರ್"
      },
      venueText: {
        te: "ముల్లన్‌పూర్ స్టేడియం • ప్లేఆఫ్స్ ఎలిమినేటర్",
        en: "Mullanpur Stadium • Playoffs Eliminator",
        hi: "मुल्लनपुर स्टेडियम • प्लेऑफ़ एलिमिनेटर",
        ta: "முல்லன்பூர் மைதானம் • பிளேஆஃப்ஸ் எலிமினேட்டர்",
        kn: "ಮುಲ್ಲನ್‌ಪುರ ಕ್ರೀಡಾಂಗಣ • ಪ್ಲೇಆಫ್ ಎಲಿಮಿನೇಟರ್"
      },
      team1: { name: "Sunrisers Hyderabad", short: "SRH", colorFrom: "from-orange-500", colorTo: "to-amber-600", finalScore: "196 All Out (19.2)" },
      team2: { name: "Rajasthan Royals", short: "RR", colorFrom: "from-pink-600", colorTo: "to-purple-950", finalScore: "243/8 (20.0)" },
      target: 244,
      targetText: {
        te: "రాజస్థాన్ రాయల్స్ 243/8 (20 ఓవర్లు)",
        en: "Rajasthan Royals 243/8 (20 overs)",
        hi: "राजस्थान रॉयल्स 243/8 (20 ओवर)",
        ta: "ராஜஸ்தான் ராயல்ஸ் 243/8 (20 ஓவர்கள்)",
        kn: "ರಾಜಸ್ಥಾನ ರಾಯಲ್ಸ್ 243/8 (20 ஓவர்‌ಗಳು)"
      },
      initialRuns: 170,
      initialWickets: 7,
      initialOvers: 17.0,
      finalRuns: 196,
      finalWickets: 10,
      finalOvers: 19.2,
      initialBatter1: { name: "Heinrich Klaasen", runs: 62, balls: 30, status: "batting" },
      initialBatter2: { name: "Pat Cummins", runs: 10, balls: 6, status: "batting" },
      initialBowler: { name: "Sandeep Sharma", wickets: 1, runs: 28, overs: 3.0 },
      finalBatter1: { name: "Heinrich Klaasen", runs: 62, balls: 31, status: "c Powell b Chahal" },
      finalBatter2: { name: "Praful Hinge", runs: 10, balls: 5, status: "b Sandeep" },
      finalBowler: { name: "Sandeep Sharma", wickets: 3, runs: 45, overs: 4.2 },
      statusCompleted: {
        te: "మ్యాచ్ ముగిసింది • రాజస్థాన్ రాయల్స్ 47 పరుగుల తేడాతో విజయం సాధించింది! 🏆",
        en: "MATCH COMPLETED • RR won by 47 runs! 🏆",
        hi: "मैच समाप्त • राजस्थान रॉयल्स 47 रनों से जीता! 🏆",
        ta: "போட்டி முடிந்தது • ஆர்ஆர் 47 ரன்கள் வித்தியாசத்தில் வெற்றி பெற்றது! 🏆",
        kn: "ಪಂದ್ಯ ಮುಕ್ತಾಯ • ಆರ್‌ಆರ್ 47 ರನ್‌ಗಳ ಜಯ ಸಾಧಿಸಿದೆ! 🏆"
      },
      commentaryInitial: [
        {
          ball: "17.0",
          descTe: "సందీప్ శర్మ స్లో బౌన్సర్ వేయగా కమ్మీన్స్ డీప్ వికెట్ వైపు నెట్టి రెండు పరుగులు సాధించాడు.",
          descEn: "Sandeep Sharma to Pat Cummins, 2 runs, slower bouncer pulled away to deep midwicket for a couple.",
          type: "run" as const
        },
        {
          ball: "16.5",
          descTe: "చహల్ ఆఫ్-స్టంప్ లైన్ పై వేసిన బంతిని క్లాసెన్ స్వీప్ షాట్ తో చక్కటి సింగిల్ రాబట్టాడు.",
          descEn: "Yuzvendra Chahal to Klaasen, 1 run, swept fine down to deep backward square leg to retain strike.",
          type: "run" as const
        }
      ],
      replayBalls: ELIMINATOR_REPLAY_BALLS,
      rrBattingData: [
        { name: "Vaibhav Sooryavanshi", status: "b Cummins", runs: 97, balls: 29, fours: 5, sixes: 12, sr: "334.48", isStar: true },
        { name: "Yashasvi Jaiswal", status: "c Head b Bhuvneshwar", runs: 12, balls: 8, fours: 2, sixes: 0, sr: "150.00" },
        { name: "Sanju Samson (c & wk)", status: "c Kishan b Hinge", runs: 18, balls: 12, fours: 1, sixes: 1, sr: "150.00" },
        { name: "Riyan Parag", status: "c Samad b Natarajan", runs: 22, balls: 15, fours: 2, sixes: 1, sr: "146.67" },
        { name: "Dhruv Jurel", status: "c Cummins b Hinge", runs: 50, balls: 21, fours: 3, sixes: 5, sr: "238.10", isStar: true },
        { name: "Shimron Hetmyer", status: "b Hinge", runs: 8, balls: 6, fours: 1, sixes: 0, sr: "133.33" },
        { name: "Rovman Powell", status: "c & b Cummins", runs: 15, balls: 11, fours: 1, sixes: 1, sr: "136.36" },
        { name: "Ravichandran Ashwin", status: "c Klaasen b Shahbaz", runs: 6, balls: 4, fours: 1, sixes: 0, sr: "150.00" },
        { name: "Jofra Archer", status: "not out", runs: 4, balls: 2, fours: 0, sixes: 0, sr: "200.00" }
      ],
      oppBowlingData: [
        { name: "Bhuvneshwar Kumar", overs: "4.0", maidens: 0, runs: 35, wickets: 1, econ: "8.75" },
        { name: "Pat Cummins", overs: "4.0", maidens: 0, runs: 44, wickets: 2, econ: "11.00" },
        { name: "T. Natarajan", overs: "4.0", maidens: 0, runs: 48, wickets: 1, econ: "12.00" },
        { name: "Praful Hinge", overs: "4.0", maidens: 0, runs: 54, wickets: 3, econ: "13.50" },
        { name: "Shahbaz Ahmed", overs: "4.0", maidens: 0, runs: 40, wickets: 1, econ: "10.00" }
      ],
      oppBattingData: [
        { name: "Travis Head", status: "c Archer b Boult", runs: 14, balls: 10, fours: 2, sixes: 1, sr: "140.00" },
        { name: "Abhishek Sharma", status: "c Samson b Archer", runs: 8, balls: 6, fours: 1, sixes: 0, sr: "133.33" },
        { name: "Ishan Kishan (wk)", status: "c Jaiswal b Archer", runs: 18, balls: 11, fours: 2, sixes: 1, sr: "163.64" },
        { name: "Heinrich Klaasen", status: "c Powell b Chahal", runs: 62, balls: 31, fours: 4, sixes: 5, sr: "200.00", isStar: true },
        { name: "Nitish Kumar Reddy", status: "b Ashwin", runs: 34, balls: 20, fours: 2, sixes: 2, sr: "170.00" },
        { name: "Abdul Samad", status: "c Jurel b Ashwin", runs: 24, balls: 12, fours: 1, sixes: 2, sr: "200.00" },
        { name: "Pat Cummins (c)", status: "c Parag b Archer", runs: 15, balls: 9, fours: 1, sixes: 1, sr: "166.67" },
        { name: "Bhuvneshwar Kumar", status: "not out", runs: 4, balls: 3, fours: 0, sixes: 0, sr: "133.33" },
        { name: "Praful Hinge", status: "b Sandeep", runs: 10, balls: 5, fours: 2, sixes: 0, sr: "200.00" },
        { name: "T. Natarajan", status: "c Samson b Archer", runs: 0, balls: 2, fours: 0, sixes: 0, sr: "0.00" }
      ],
      rrBowlingData: [
        { name: "Trent Boult", overs: "3.0", maidens: 0, runs: 32, wickets: 1, econ: "10.67" },
        { name: "Jofra Archer", overs: "4.0", maidens: 0, runs: 37, wickets: 3, econ: "9.25", isStar: true },
        { name: "Sandeep Sharma", overs: "4.2", maidens: 0, runs: 45, wickets: 3, econ: "10.38" },
        { name: "Ravichandran Ashwin", overs: "4.0", maidens: 0, runs: 32, wickets: 2, econ: "8.00" },
        { name: "Yuzvendra Chahal", overs: "4.0", maidens: 0, runs: 38, wickets: 1, econ: "9.50" }
      ],
      highlights: [
        {
          title: "Vaibhav Sooryavanshi's Record Blitz",
          desc: "At just 15 years of age, Vaibhav Sooryavanshi plays one of the greatest T20 knocks in playoff history! Smashed 97 runs off 29 balls, including 12 towering sixes, dismantling SRH's premium bowling attack."
        },
        {
          title: "Jofra's Powerplay Triple-Strike",
          desc: "Jofra Archer completely broke the back of the Sunrisers run chase inside the powerplay. Striking at extreme speeds, he removed SRH's explosive top three - Abhishek Sharma, Travis Head, and Ishan Kishan."
        },
        {
          title: "Klaasen's Valiant Counter-Attack",
          desc: "Sunrisers Hyderabad's Heinrich Klaasen fought a lone, heroic battle in the middle. Smashing 5 sixes in a stunning 62 off 31 balls, keeping the orange army's dreams alive before falling to Chahal."
        }
      ]
    };
  }, [isQualifier2]);

  // Dynamic values depending on matchState and replayIndex
  const currentRuns = useMemo(() => {
    if (matchState === "completed") return matchConfig.finalRuns;
    if (replayIndex === -1) return matchConfig.initialRuns;
    return matchConfig.replayBalls[replayIndex].runs;
  }, [matchState, replayIndex, matchConfig]);

  const currentWickets = useMemo(() => {
    if (matchState === "completed") return matchConfig.finalWickets;
    if (replayIndex === -1) return matchConfig.initialWickets;
    return matchConfig.replayBalls[replayIndex].wickets;
  }, [matchState, replayIndex, matchConfig]);

  const currentOvers = useMemo(() => {
    if (matchState === "completed") return matchConfig.finalOvers;
    if (replayIndex === -1) return matchConfig.initialOvers;
    return matchConfig.replayBalls[replayIndex].overs;
  }, [matchState, replayIndex, matchConfig]);

  const currentBatter1 = useMemo(() => {
    if (matchState === "completed") return matchConfig.finalBatter1;
    if (replayIndex === -1) return matchConfig.initialBatter1;
    return { 
      name: matchConfig.replayBalls[replayIndex].batter1.name, 
      runs: matchConfig.replayBalls[replayIndex].batter1.runs, 
      balls: matchConfig.replayBalls[replayIndex].batter1.balls,
      status: "batting" 
    };
  }, [matchState, replayIndex, matchConfig]);

  const currentBatter2 = useMemo(() => {
    if (matchState === "completed") return matchConfig.finalBatter2;
    if (replayIndex === -1) return matchConfig.initialBatter2;
    return { 
      name: matchConfig.replayBalls[replayIndex].batter2.name, 
      runs: matchConfig.replayBalls[replayIndex].batter2.runs, 
      balls: matchConfig.replayBalls[replayIndex].batter2.balls,
      status: "batting" 
    };
  }, [matchState, replayIndex, matchConfig]);

  const currentBowler = useMemo(() => {
    if (matchState === "completed") return matchConfig.finalBowler;
    if (replayIndex === -1) return matchConfig.initialBowler;
    return matchConfig.replayBalls[replayIndex].bowler;
  }, [matchState, replayIndex, matchConfig]);

  // Generate dynamic ball-by-ball feed
  const commentaryFeed = useMemo(() => {
    const defaultCommentary = matchConfig.commentaryInitial.map(c => ({
      ball: c.ball,
      descTe: c.descTe,
      descEn: c.descEn,
      type: c.type
    }));

    if (matchState === "completed") {
      const items = matchConfig.replayBalls.map(b => ({
        ball: b.overs.toFixed(1),
        descTe: b.commentary.te,
        descEn: b.commentary[lang as "te" | "en" | "hi" | "ta" | "kn"] || b.commentary.en,
        type: b.type
      }));
      return [...items].reverse();
    }

    if (replayIndex === -1) {
      return defaultCommentary;
    }

    // Accumulate from replayIndex down to 0
    const activeItems = [];
    for (let i = replayIndex; i >= 0; i--) {
      const b = matchConfig.replayBalls[i];
      activeItems.push({
        ball: b.overs.toFixed(1),
        descTe: b.commentary.te,
        descEn: b.commentary[lang as "te" | "en" | "hi" | "ta" | "kn"] || b.commentary.en,
        type: b.type
      });
    }

    return [...activeItems, ...defaultCommentary];
  }, [matchState, replayIndex, lang, matchConfig]);

  // Math remaining runs/balls
  const ballsRemaining = useMemo(() => {
    if (matchState === "completed") return 0;
    const completedOvers = Math.floor(currentOvers);
    const ballsInCurrentOver = Math.round((currentOvers - completedOvers) * 10);
    const totalBallsBowled = (completedOvers * 6) + ballsInCurrentOver;
    return Math.max(0, 120 - totalBallsBowled);
  }, [matchState, currentOvers]);

  const runsNeeded = useMemo(() => {
    if (matchState === "completed") return 0;
    return Math.max(0, matchConfig.target - currentRuns);
  }, [matchState, currentRuns, matchConfig]);

  // Prediction voting poll states
  const [prediction, setPrediction] = useState<"OPP" | "RR" | null>(null);
  const [oppVotes, setOppVotes] = useState(48);
  const [rrVotes, setRrVotes] = useState(52);

  const totalVotes = oppVotes + rrVotes;
  const oppPercent = Math.round((oppVotes / totalVotes) * 100);
  const rrPercent = Math.round((rrVotes / totalVotes) * 100);

  const handleVote = (team: "OPP" | "RR") => {
    if (prediction) return;
    setPrediction(team);
    if (team === "OPP") {
      setOppVotes((v) => v + 1);
    } else {
      setRrVotes((v) => v + 1);
    }
  };

  // Replay Control Logic
  const handleNextBall = () => {
    setReplayIndex((prev) => {
      const next = prev + 1;
      if (next >= matchConfig.replayBalls.length) {
        setIsPlaying(false);
        setMatchState("completed");
        return prev;
      }
      return next;
    });
  };

  const handleResetReplay = () => {
    setIsPlaying(false);
    setReplayIndex(-1);
    setMatchState("replay");
  };

  const handleTogglePlay = () => {
    if (matchState === "completed") {
      setMatchState("replay");
      setReplayIndex(-1);
      setIsPlaying(true);
      return;
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setReplayIndex((prev) => {
          const next = prev + 1;
          if (next >= matchConfig.replayBalls.length) {
            // Show match completed celebration
            setMatchState("completed");
            setIsPlaying(false);
            
            // Auto-restart the live simulation loop after 10 seconds
            setTimeout(() => {
              setReplayIndex(-1);
              setMatchState("replay");
              setIsPlaying(true);
            }, 10000);
            
            return prev;
          }
          return next;
        });
      }, 4000);
    } else {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    }

    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, [isPlaying, matchConfig]);

  // Multilingual UI texts
  const ui = {
    needText: {
      te: (runs: number, balls: number) => `${matchConfig.team1.short} విజయానికి ${balls} బంతుల్లో ${runs} పరుగులు కావాలి`,
      en: (runs: number, balls: number) => `${matchConfig.team1.short} needs ${runs} runs in ${balls} balls to win`,
      hi: (runs: number, balls: number) => `${matchConfig.team1.short} को जीत के लिए ${balls} गेंदों में ${runs} रन चाहिए`,
      ta: (runs: number, balls: number) => `${matchConfig.team1.short} வெற்றிபெற ${balls} பந்துகளில் ${runs} ரன்கள் தேவை`,
      kn: (runs: number, balls: number) => `${matchConfig.team1.short} ಗೆಲುವಿಗೆ ${balls} ಎಸೆತಗಳಲ್ಲಿ ${runs} ರನ್ ಅಗತ್ಯವಿದೆ`
    },
    detailedBtn: {
      te: "వివరణాత్మక స్కోర్‌బోర్డ్ & కామెంటరీ 🎙️",
      en: "Detailed Scoreboard & Commentary 🎙️",
      hi: "विस्तृत स्कोरबोर्ड और कॉमेंट्री 🎙️",
      ta: "விரிவான ஸ்கோர்போர்டு & கருத்துரை 🎙️",
      kn: "ವಿವರವಾದ ಸ್ಕೋರ್‌ಬೋರ್ಡ್ ಮತ್ತು ವಿವರಣೆ 🎙️"
    },
    replayThriller: {
      te: "థ్రిల్లర్ క్లైమాక్స్ రీప్లే చేయండి 🔴",
      en: "Replay Thrilling Climax 🔴",
      hi: "रोमांचक क्लाइमेक्स रीप्ले करें 🔴",
      ta: "திரில்லர் கிளைமாக்ஸ் ரீப்ளே 🔴",
      kn: "ರೋಮಾಂಚಕ ಕ್ಲೈಮ್ಯಾಕ್ಸ್ ಮರುಪ್ರಸಾರ 🔴"
    },
    stopReplay: {
      te: "ఫలితాన్ని చూపించు 🏆",
      en: "View Final Result 🏆",
      hi: "अंतिम परिणाम देखें 🏆",
      ta: "இறுதி முடிவைக் காட்டு 🏆",
      kn: "ಅಂತಿಮ ಫಲಿತಾಂಶ ವೀಕ್ಷಿಸಿ 🏆"
    },
    predictionTitle: {
      te: "మ్యాచ్ టర్నింగ్ పాయింట్ ఎవరు? (Predict Turning Point)",
      en: "Who was the turning point? (Predict Turning Point)",
      hi: "मैच का टर्निंग पॉइंट कौन था? (Predict)",
      ta: "போட்டியின் திருப்புமுனை யார்? (Predict)",
      kn: "ಪಂದ್ಯದ ಟರ್ನಿಂಗ್ ಪಾಯಿಂಟ್ ಯಾರು? (Predict)"
    },
    votedSuccess: {
      te: "మీ ఓటు నమోదైంది! థాంక్స్.",
      en: "Your prediction recorded! Thanks.",
      hi: "आपका अनुमान दर्ज हो गया है! धन्यवाद।",
      ta: "உங்கள் கணிப்பு பதிவாகியுள்ளது! நன்றி.",
      kn: "ನಿಮ್ಮ ಭವಿಷ್ಯವಾಣಿ ದಾಖಲಾಗಿದೆ! ಧನ್ಯವಾದಗಳು."
    }
  };

  // ==========================================
  // MODE A: HOMEPAGE INTEGRATED BANNER CARD
  // ==========================================
  if (mode === "banner") {
    return (
      <section className="relative overflow-hidden rounded-[2.5rem] border border-white/20 dark:border-white/10 bg-gradient-to-br from-slate-950 via-zinc-950 to-neutral-950 p-6 md:p-8 shadow-2xl backdrop-blur-2xl animate-in fade-in duration-700">
        {/* Decorative ambient lighting elements */}
        <div className="absolute -left-20 -top-20 -z-10 size-56 rounded-full bg-orange-600/10 blur-[90px] animate-pulse" />
        <div className="absolute -right-20 -bottom-20 -z-10 size-56 rounded-full bg-blue-600/10 blur-[90px] animate-pulse" />

        {/* Top Info Header */}
        <div className="flex flex-wrap justify-between items-center gap-3 border-b border-white/10 pb-4 mb-5">
          <div className="flex items-center gap-2">
            <span className="relative flex size-3">
              {matchState === "replay" && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75"></span>
              )}
              <span className={`relative inline-flex size-3 rounded-full ${matchState === "replay" ? "bg-red-600" : "bg-emerald-500"}`}></span>
            </span>
            <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${matchState === "replay" ? "text-red-500 bg-red-500/10 border-red-500/20" : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"}`}>
              {matchState === "replay" ? "THRILLER CLIMAX REPLAY" : "MATCH COMPLETED"}
            </span>
            <span className="text-xs font-black text-zinc-400">
              {matchConfig.venueText[lang as "te" | "en"] || matchConfig.venueText.en}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (matchState === "completed") {
                  handleResetReplay();
                } else {
                  setMatchState("completed");
                }
              }}
              className="text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full border border-white/10 hover:border-white/20 bg-white/5 active:scale-95 transition text-white"
            >
              {matchState === "completed" ? ui.replayThriller[lang] : ui.stopReplay[lang]}
            </button>
          </div>
        </div>

        {/* Teams and Score Presentation */}
        <div className="grid gap-6 md:grid-cols-[1fr_auto_1fr] items-center text-center py-2">
          {/* Team 1: Gujarat Titans or Sunrisers */}
          <div className="flex flex-col md:flex-row items-center justify-end gap-4">
            <div className="text-right hidden md:block">
              <h3 className="text-lg font-black text-white">{matchConfig.team1.name}</h3>
              <p className="text-xs text-zinc-400 font-extrabold">{matchConfig.team1.short} • Chasing {matchConfig.target}</p>
            </div>
            <div className={`size-16 rounded-2xl bg-gradient-to-br ${matchConfig.team1.short === "GT" ? "from-indigo-600 to-slate-900 shadow-indigo-500/20" : "from-orange-500 to-amber-600 shadow-orange-500/20"} p-0.5 shadow-lg border border-white/15 flex items-center justify-center font-black text-white text-2xl relative`}>
              {matchConfig.team1.short}
              <div className="absolute -bottom-1 -right-1 bg-amber-500 text-black text-[9px] font-black px-1.5 rounded-full">
                {currentRuns}
              </div>
            </div>
            <h3 className="text-base font-black text-white md:hidden">{matchConfig.team1.short}</h3>
          </div>

          {/* Central Scoreboard Display */}
          <div className="space-y-1">
            <div className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
              {currentRuns}/{currentWickets}
            </div>
            <div className="text-xs md:text-sm text-zinc-400 font-extrabold flex items-center justify-center gap-1.5">
              Overs: <span className="text-orange-500 font-black">{currentOvers.toFixed(1)}</span> / 20.0
            </div>
          </div>

          {/* Team 2: Rajasthan Royals */}
          <div className="flex flex-col md:flex-row-reverse items-center justify-start gap-4">
            <div className="text-left hidden md:block">
              <h3 className="text-lg font-black text-white">{matchConfig.team2.name}</h3>
              <p className="text-xs text-zinc-400 font-extrabold">{matchConfig.team2.short} • Innings Completed</p>
            </div>
            <div className="size-16 rounded-2xl bg-gradient-to-br from-pink-600 to-purple-950 p-0.5 shadow-lg shadow-pink-500/20 border border-white/15 flex items-center justify-center font-black text-white text-2xl relative">
              {matchConfig.team2.short}
              <div className="absolute -bottom-1 -left-1 bg-pink-500 text-white text-[9px] font-black px-1.5 rounded-full">
                {matchConfig.team2.short === "RR" && !isQualifier2 ? "243" : "215"}
              </div>
            </div>
            <h3 className="text-base font-black text-white md:hidden">{matchConfig.team2.short}</h3>
          </div>
        </div>

        {/* Dynamic Interactive Banner Alert */}
        <div className="bg-white/5 border border-white/10 p-4 rounded-3xl text-center text-xs md:text-sm font-black text-white tracking-wide mt-6 flex flex-col md:flex-row items-center justify-center gap-4 shadow-inner">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] md:text-xs text-left">
              {matchState === "completed" 
                ? (matchConfig.statusCompleted[lang as "te" | "en" | "hi" | "ta" | "kn"] || matchConfig.statusCompleted.en)
                : ui.needText[lang](runsNeeded, ballsRemaining)
              }
            </span>
          </div>

          {/* Action Trigger Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {matchState === "replay" && (
              <div className="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-2xl border border-white/5">
                <button
                  onClick={handleTogglePlay}
                  className="p-1 rounded-lg hover:bg-white/10 active:scale-90 transition text-yellow-500"
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
                </button>
                <button
                  onClick={handleNextBall}
                  className="text-[9px] font-black bg-orange-600 hover:bg-orange-700 text-white px-2.5 py-1 rounded-xl transition active:scale-95 flex items-center gap-0.5"
                >
                  <Zap className="size-3" /> NEXT BALL
                </button>
                <button
                  onClick={handleResetReplay}
                  className="p-1 rounded-lg hover:bg-white/10 active:scale-90 transition text-zinc-400"
                  title="Reset Replay"
                >
                  <RotateCcw className="size-3.5" />
                </button>
              </div>
            )}

            <button
              onClick={() => {
                setIsOpen(true);
                if (onOpenLiveView) onOpenLiveView();
              }}
              className="h-8 px-4 rounded-xl bg-gradient-to-r from-orange-600 via-purple-600 to-pink-600 hover:opacity-90 text-white font-black text-[10px] uppercase tracking-wider shadow-lg active:scale-95 transition duration-200"
            >
              {ui.detailedBtn[lang] || ui.detailedBtn.en}
            </button>
          </div>
        </div>

        {/* Modal Overlay Scoreboard Dashboard */}
        {isOpen && renderDetailedScoreboardOverlay()}
      </section>
    );
  }

  // ==========================================
  // MODE B: FLOATING LIVE STATUS BUBBLE
  // ==========================================
  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-[999] flex items-center gap-3 rounded-full border border-orange-500/30 bg-zinc-950/80 p-3.5 pr-5 shadow-[0_8px_32px_rgba(249,115,22,0.3)] backdrop-blur-xl transition-all duration-300 hover:scale-105 active:scale-95 group animate-bounce-slow"
        >
          <span className="relative flex size-3">
            {matchState === "replay" && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-500 opacity-85"></span>
            )}
            <span className={`relative inline-flex size-3 rounded-full ${matchState === "replay" ? "bg-orange-600" : "bg-emerald-500"}`}></span>
          </span>
          <div className="text-left font-black tracking-wide">
            <span className="block text-[9px] text-orange-500 uppercase tracking-widest font-black">
              {matchState === "replay" ? "IPL REPLAY LIVE" : "IPL MATCH RESULT"}
            </span>
            <span className="block text-xs text-white">
              {matchConfig.team1.short} <span className="text-orange-500 font-extrabold">{currentRuns}/{currentWickets}</span> <span className="text-[10px] text-zinc-400">({currentOvers.toFixed(1)} ov)</span>
            </span>
          </div>
          <ChevronUp className="size-4 ml-1 text-zinc-400 group-hover:text-orange-500 transition" />
        </button>
      )}

      {isOpen && renderDetailedScoreboardOverlay()}
    </>
  );

  // ==========================================
  // RENDER DETAILED PREMIUM SCOREBOARD OVERLAY
  // ==========================================
  function renderDetailedScoreboardOverlay() {
    return (
      <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
        <div className="w-full max-w-2xl bg-zinc-950/90 border border-white/10 rounded-[2.5rem] p-6 shadow-2xl backdrop-blur-3xl animate-in zoom-in-95 duration-300 my-8 relative max-h-[92vh] overflow-y-auto no-scrollbar text-white">
          
          {/* Ambient Glows */}
          <div className="absolute -left-20 -top-20 -z-10 size-60 rounded-full bg-orange-600/10 blur-[80px]" />
          <div className="absolute -right-20 -bottom-20 -z-10 size-60 rounded-full bg-pink-600/10 blur-[80px]" />

          {/* Close Header */}
          <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="relative flex size-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex size-2.5 rounded-full bg-red-600"></span>
              </span>
              <h4 className="text-sm font-black uppercase tracking-wider text-orange-500">
                {matchConfig.title[lang as "te" | "en" | "hi" | "ta" | "kn"] || matchConfig.title.en}
              </h4>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                setIsPlaying(false);
              }}
              className="rounded-full p-2 text-zinc-400 hover:bg-white/10 hover:text-white transition"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Immersive Match Summary Card */}
          <div className="bg-gradient-to-r from-orange-500/10 via-transparent to-pink-500/10 border border-white/5 p-4 md:p-6 rounded-3xl text-center space-y-3 shadow-inner relative overflow-hidden">
            <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
              {matchConfig.venueText[lang as "te" | "en"] || matchConfig.venueText.en}
            </div>

            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
              {/* GT or SRH */}
              <div className="text-right">
                <div className="text-2xl font-black tracking-tight">{matchConfig.team1.short}</div>
                <div className="text-xs text-zinc-400 font-extrabold">{matchConfig.team1.finalScore}</div>
              </div>

              {/* VS Ribbon */}
              <div className="px-4 py-1.5 rounded-2xl bg-white/5 border border-white/10 text-xs font-black text-amber-500">
                VS
              </div>

              {/* RR */}
              <div className="text-left">
                <div className="text-2xl font-black tracking-tight">{matchConfig.team2.short}</div>
                <div className="text-xs text-zinc-400 font-extrabold">{matchConfig.team2.finalScore}</div>
              </div>
            </div>

            <div className="text-xs font-black text-yellow-500 py-1 px-4 rounded-full bg-yellow-500/5 border border-yellow-500/10 inline-block">
              {matchState === "completed" 
                ? (matchConfig.statusCompleted[lang as "te" | "en" | "hi" | "ta" | "kn"] || matchConfig.statusCompleted.en)
                : ui.needText[lang](runsNeeded, ballsRemaining)
              }
            </div>

            {/* Live Replay controls embedded within the card */}
            <div className="flex justify-center gap-2 mt-2">
              {matchState === "replay" ? (
                <div className="flex items-center gap-2 bg-black/60 px-4 py-2 rounded-2xl border border-white/10">
                  <span className="text-[9.5px] font-black text-red-500 flex items-center gap-1">
                    <span className="size-2 bg-red-600 rounded-full animate-ping shrink-0" />
                    CLIMAX REPLAY
                  </span>
                  <div className="h-4 w-px bg-white/10 mx-1" />
                  <button
                    onClick={handleTogglePlay}
                    className="p-1 rounded-lg hover:bg-white/10 active:scale-90 transition text-yellow-500"
                    title={isPlaying ? "Pause Simulation" : "Play Simulation"}
                  >
                    {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
                  </button>
                  <button
                    onClick={handleNextBall}
                    className="text-[9px] font-black bg-orange-600 hover:bg-orange-700 text-white px-2.5 py-1 rounded-xl transition active:scale-95 flex items-center gap-0.5"
                  >
                    <Zap className="size-3" /> NEXT
                  </button>
                  <button
                    onClick={handleResetReplay}
                    className="p-1 rounded-lg hover:bg-white/10 active:scale-90 transition text-zinc-400"
                    title="Reset Replay"
                  >
                    <RotateCcw className="size-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleResetReplay}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-2xl text-xs font-black tracking-wider transition active:scale-95 flex items-center gap-1.5 shadow-md shadow-orange-600/20"
                >
                  <RotateCcw className="size-3.5" /> {ui.replayThriller[lang]}
                </button>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-white/10 my-5 overflow-x-auto no-scrollbar">
            {[
              { id: "tracker", label: { te: "మ్యాచ్ ట్రాకర్ 🎯", en: "Live Tracker 🎯" } },
              { id: "scorecard", label: { te: "స్కోర్‌బోర్డ్ 📊", en: "Scorecard 📊" } },
              { id: "highlights", label: { te: "హైలైట్స్ 🌟", en: "Highlights 🌟" } },
              { id: "poll", label: { te: "పోల్ అంచనా 📈", en: "Fan Poll 📈" } }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-5 py-2.5 text-xs font-black tracking-wide border-b-2 whitespace-nowrap transition-all duration-300 ${
                  activeTab === tab.id
                    ? "border-orange-500 text-orange-500 bg-orange-500/5"
                    : "border-transparent text-zinc-400 hover:text-white"
                }`}
              >
                {lang === "te" ? tab.label.te : tab.label.en}
              </button>
            ))}
          </div>

          {/* Tab 1: Tracker & Interactive Replay */}
          {activeTab === "tracker" && (
            <div className="space-y-4">
              {/* Miniature Active Scoreboard */}
              <div className="grid gap-3 md:grid-cols-2">
                {/* Active Batters */}
                <div className="bg-zinc-900/60 border border-white/5 p-4 rounded-2xl space-y-3">
                  <h5 className="text-[10px] font-black uppercase tracking-wider text-orange-500 flex items-center gap-1.5 border-b border-white/5 pb-2">
                    <span className="size-1.5 rounded-full bg-orange-500 animate-pulse" />
                    Active Batters
                  </h5>
                  <div className="space-y-2 text-xs font-bold">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1 truncate max-w-[150px]">
                        {currentBatter1.name} {currentBatter1.status === "batting" && <span className="text-orange-500 font-black">*</span>}
                      </span>
                      <span className="font-black text-zinc-200">
                        {currentBatter1.runs} <span className="text-[10px] text-zinc-400 font-normal">({currentBatter1.balls})</span>
                      </span>
                    </div>
                    {currentBatter1.status !== "batting" && (
                      <div className="text-[9px] text-zinc-500 font-extrabold italic pl-1">
                        ↳ Out: {currentBatter1.status}
                      </div>
                    )}

                    <div className="flex justify-between items-center text-zinc-300">
                      <span className="flex items-center gap-1 truncate max-w-[150px]">
                        {currentBatter2.name} {currentBatter2.status === "batting" && <span className="text-orange-500 font-black">*</span>}
                      </span>
                      <span className="font-black text-zinc-200">
                        {currentBatter2.runs} <span className="text-[10px] text-zinc-400 font-normal">({currentBatter2.balls})</span>
                      </span>
                    </div>
                    {currentBatter2.status !== "batting" && (
                      <div className="text-[9px] text-zinc-500 font-extrabold italic pl-1">
                        ↳ Out: {currentBatter2.status}
                      </div>
                    )}
                  </div>
                </div>

                {/* Current Bowler */}
                <div className="bg-zinc-900/60 border border-white/5 p-4 rounded-2xl space-y-3">
                  <h5 className="text-[10px] font-black uppercase tracking-wider text-pink-400 flex items-center gap-1.5 border-b border-white/5 pb-2">
                    <span className="size-1.5 rounded-full bg-pink-500" />
                    Current Bowler
                  </h5>
                  <div className="space-y-2 text-xs font-bold">
                    <div className="flex justify-between items-center">
                      <span className="truncate max-w-[150px]">{currentBowler.name}</span>
                      <span className="font-black text-zinc-200">
                        {currentBowler.wickets}/{currentBowler.runs} 
                        <span className="text-[10px] text-zinc-400 font-normal ml-1">({currentBowler.overs.toFixed(1)} ov)</span>
                      </span>
                    </div>
                    <div className="flex justify-between text-[10px] text-zinc-400 font-extrabold uppercase pt-2 border-t border-white/5">
                      <span>Econ: {((currentBowler.runs / (currentBowler.overs || 1)) || 0).toFixed(2)}</span>
                      <span>SR: {currentBowler.wickets > 0 ? ((currentBowler.overs * 6) / currentBowler.wickets).toFixed(1) : "-"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Commentary Scroll */}
              <div className="bg-zinc-900/40 border border-white/5 p-4 rounded-3xl space-y-3">
                <h5 className="text-[10px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 border-b border-white/5 pb-2">
                  <Activity className="size-3.5 text-orange-500" />
                  Ball-by-Ball Commentary Feed 🎙️
                </h5>
                
                <div className="max-h-[220px] overflow-y-auto no-scrollbar space-y-3 pr-1.5">
                  {commentaryFeed.map((c, i) => {
                    let badgeClass = "bg-zinc-800 text-zinc-200 border-white/5";
                    if (c.type === "six") badgeClass = "bg-yellow-500/10 text-yellow-400 border-yellow-500/20 font-black scale-105";
                    if (c.type === "four") badgeClass = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-black";
                    if (c.type === "wicket") badgeClass = "bg-red-500/10 text-red-400 border-red-500/20 font-black";
                    
                    return (
                      <div key={i} className={`text-xs leading-relaxed border-b border-white/5 pb-2.5 last:border-0 last:pb-0 flex gap-2.5 items-start ${c.type === "wicket" || c.type === "six" ? "font-black text-white" : "font-semibold text-zinc-300"}`}>
                        <span className={`inline-flex shrink-0 w-11 h-6 rounded-lg text-[10px] items-center justify-center border shadow-sm ${badgeClass}`}>
                          {c.ball}
                        </span>
                        <div className="flex-1 mt-0.5">
                          {c.descEn}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Detailed Scorecard Tables */}
          {activeTab === "scorecard" && (
            <div className="space-y-5">
              {/* Scorecard Team Toggles */}
              <div className="flex gap-2 bg-zinc-900 p-1 rounded-2xl border border-white/5">
                <button
                  onClick={() => setScorecardTeam("OPP")}
                  className={`flex-1 py-2 text-[10.5px] font-black tracking-wider uppercase rounded-xl transition ${
                    scorecardTeam === "OPP"
                      ? "bg-orange-600 text-white shadow"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {matchConfig.team1.name} Innings
                </button>
                <button
                  onClick={() => setScorecardTeam("RR")}
                  className={`flex-1 py-2 text-[10.5px] font-black tracking-wider uppercase rounded-xl transition ${
                    scorecardTeam === "RR"
                      ? "bg-pink-600 text-white shadow"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {matchConfig.team2.name} Innings
                </button>
              </div>

              {/* Render RR Innings */}
              {scorecardTeam === "RR" && (
                <div className="space-y-4">
                  {/* RR Batting Table */}
                  <div className="overflow-x-auto rounded-2xl border border-white/5 bg-zinc-900/40">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 bg-zinc-900/60 font-black text-zinc-400 uppercase text-[9px] tracking-wider">
                          <th className="p-3">Batter</th>
                          <th className="p-3">Dismissal</th>
                          <th className="p-3 text-right">R</th>
                          <th className="p-3 text-right">B</th>
                          <th className="p-3 text-right">4s</th>
                          <th className="p-3 text-right">6s</th>
                          <th className="p-3 text-right">SR</th>
                        </tr>
                      </thead>
                      <tbody>
                        {matchConfig.rrBattingData.map((b: any, idx: number) => (
                          <tr key={idx} className={`border-b border-white/5 last:border-0 hover:bg-white/5 ${b.isStar ? "bg-pink-950/20" : ""}`}>
                            <td className="p-3 font-black text-white flex items-center gap-1.5">
                              {b.name}
                              {b.isStar && <Trophy className="size-3 text-yellow-500 shrink-0" />}
                            </td>
                            <td className="p-3 text-[10px] text-zinc-400 font-extrabold truncate max-w-[120px]">{b.status}</td>
                            <td className="p-3 font-black text-right">{b.runs}</td>
                            <td className="p-3 text-zinc-300 text-right">{b.balls}</td>
                            <td className="p-3 text-zinc-300 text-right">{b.fours}</td>
                            <td className="p-3 text-zinc-300 text-right">{b.sixes}</td>
                            <td className="p-3 text-zinc-400 font-black text-right">{b.sr}</td>
                          </tr>
                        ))}
                        <tr className="bg-zinc-900/30 text-white font-black">
                          <td className="p-3 uppercase tracking-wider text-[10px]" colSpan={2}>Extras / Total</td>
                          <td className="p-3 text-right">{isQualifier2 ? "215/6" : "243/8"}</td>
                          <td className="p-3 text-right" colSpan={4}>Overs: 20.0</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Opponent Bowling Table */}
                  <div className="overflow-x-auto rounded-2xl border border-white/5 bg-zinc-900/40">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 bg-zinc-900/60 font-black text-zinc-400 uppercase text-[9px] tracking-wider">
                          <th className="p-3">{matchConfig.team1.short} Bowler</th>
                          <th className="p-3 text-right">O</th>
                          <th className="p-3 text-right">M</th>
                          <th className="p-3 text-right">R</th>
                          <th className="p-3 text-right">W</th>
                          <th className="p-3 text-right">Econ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {matchConfig.oppBowlingData.map((bl: any, idx: number) => (
                          <tr key={idx} className={`border-b border-white/5 last:border-0 hover:bg-white/5 ${bl.isStar ? "bg-blue-950/20" : ""}`}>
                            <td className="p-3 font-black text-white flex items-center gap-1">{bl.name} {bl.isStar && <Trophy className="size-3 text-yellow-500 shrink-0" />}</td>
                            <td className="p-3 text-right">{bl.overs}</td>
                            <td className="p-3 text-right">{bl.maidens}</td>
                            <td className="p-3 text-right font-semibold">{bl.runs}</td>
                            <td className="p-3 text-right font-black text-orange-400">{bl.wickets}</td>
                            <td className="p-3 text-right text-zinc-400 font-bold">{bl.econ}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Render Opponent Innings */}
              {scorecardTeam === "OPP" && (
                <div className="space-y-4">
                  {/* Opponent Batting Table */}
                  <div className="overflow-x-auto rounded-2xl border border-white/5 bg-zinc-900/40">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 bg-zinc-900/60 font-black text-zinc-400 uppercase text-[9px] tracking-wider">
                          <th className="p-3">Batter</th>
                          <th className="p-3">Dismissal</th>
                          <th className="p-3 text-right">R</th>
                          <th className="p-3 text-right">B</th>
                          <th className="p-3 text-right">4s</th>
                          <th className="p-3 text-right">6s</th>
                          <th className="p-3 text-right">SR</th>
                        </tr>
                      </thead>
                      <tbody>
                        {matchConfig.oppBattingData.map((b: any, idx: number) => (
                          <tr key={idx} className={`border-b border-white/5 last:border-0 hover:bg-white/5 ${b.isStar ? "bg-orange-950/20" : ""}`}>
                            <td className="p-3 font-black text-white flex items-center gap-1.5">
                              {b.name}
                              {b.isStar && <Trophy className="size-3 text-yellow-500 shrink-0" />}
                            </td>
                            <td className="p-3 text-[10px] text-zinc-400 font-extrabold truncate max-w-[120px]">{b.status}</td>
                            <td className="p-3 font-black text-right">{b.runs}</td>
                            <td className="p-3 text-zinc-300 text-right">{b.balls}</td>
                            <td className="p-3 text-zinc-300 text-right">{b.fours}</td>
                            <td className="p-3 text-zinc-300 text-right">{b.sixes}</td>
                            <td className="p-3 text-zinc-400 font-black text-right">{b.sr}</td>
                          </tr>
                        ))}
                        <tr className="bg-zinc-900/30 text-white font-black">
                          <td className="p-3 uppercase tracking-wider text-[10px]" colSpan={2}>Extras / Total</td>
                          <td className="p-3 text-right">{isQualifier2 ? "217/6" : "196/10"}</td>
                          <td className="p-3 text-right" colSpan={4}>{isQualifier2 ? "Overs: 20.0" : "Overs: 19.2 (All Out)"}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* RR Bowling Table */}
                  <div className="overflow-x-auto rounded-2xl border border-white/5 bg-zinc-900/40">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 bg-zinc-900/60 font-black text-zinc-400 uppercase text-[9px] tracking-wider">
                          <th className="p-3">RR Bowler</th>
                          <th className="p-3 text-right">O</th>
                          <th className="p-3 text-right">M</th>
                          <th className="p-3 text-right">R</th>
                          <th className="p-3 text-right">W</th>
                          <th className="p-3 text-right">Econ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {matchConfig.rrBowlingData.map((bl: any, idx: number) => (
                          <tr key={idx} className={`border-b border-white/5 last:border-0 hover:bg-white/5 ${bl.isStar ? "bg-pink-950/20" : ""}`}>
                            <td className="p-3 font-black text-white flex items-center gap-1.5">
                              {bl.name}
                              {bl.isStar && <Trophy className="size-3 text-yellow-500 shrink-0" />}
                            </td>
                            <td className="p-3 text-right">{bl.overs}</td>
                            <td className="p-3 text-right">{bl.maidens}</td>
                            <td className="p-3 text-right font-semibold">{bl.runs}</td>
                            <td className="p-3 text-right font-black text-pink-400">{bl.wickets}</td>
                            <td className="p-3 text-right text-zinc-400 font-bold">{bl.econ}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Key Innings Highlights */}
          {activeTab === "highlights" && (
            <div className="space-y-4">
              {matchConfig.highlights.map((h, i) => (
                <div key={i} className={`p-4 rounded-2xl border ${i === 0 ? "border-yellow-500/10 bg-gradient-to-r from-yellow-950/20" : i === 1 ? "border-blue-500/10 bg-gradient-to-r from-blue-950/20" : "border-pink-500/10 bg-gradient-to-r from-pink-950/20"} to-transparent flex gap-4 items-start`}>
                  <div className="size-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    {i === 0 ? <Trophy className="size-6 text-yellow-500" /> : i === 1 ? <Award className="size-6 text-blue-400" /> : <Activity className="size-6 text-pink-400" />}
                  </div>
                  <div className="space-y-1">
                    <h6 className={`text-xs font-black ${i === 0 ? "text-yellow-400" : i === 1 ? "text-blue-400" : "text-pink-400"} flex items-center gap-1.5 uppercase tracking-wide`}>
                      {h.title}
                    </h6>
                    <p className="text-[11px] leading-relaxed text-zinc-300 font-semibold">
                      {h.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 4: Turning Point Prediction Poll */}
          {activeTab === "poll" && (
            <div className="space-y-4 py-2">
              <h5 className="text-xs font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <TrendingUp className="size-4 text-emerald-500" />
                {ui.predictionTitle[lang] || ui.predictionTitle.en}
              </h5>

              {!prediction ? (
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleVote("OPP")}
                    className="p-5 rounded-2xl border border-orange-500 bg-orange-500/10 hover:bg-orange-500/15 text-orange-400 font-black text-sm transition active:scale-95 shadow flex flex-col items-center justify-center gap-2"
                  >
                    <span className="text-2xl">🟠</span>
                    <span>{isQualifier2 ? "Shubman Gill" : "Heinrich Klaasen"}</span>
                    <span className="text-[9px] text-zinc-400 font-normal">{isQualifier2 ? "Sensational 90" : "Valiant 62 off 31"}</span>
                  </button>
                  <button
                    onClick={() => handleVote("RR")}
                    className="p-5 rounded-2xl border border-pink-500 bg-pink-500/10 hover:bg-pink-500/15 text-pink-400 font-black text-sm transition active:scale-95 shadow flex flex-col items-center justify-center gap-2"
                  >
                    <span className="text-2xl">💗</span>
                    <span>{isQualifier2 ? "Yashasvi Jaiswal" : "Vaibhav Sooryavanshi"}</span>
                    <span className="text-[9px] text-zinc-400 font-normal">{isQualifier2 ? "Explosive 74" : "Explosive 97 off 29"}</span>
                  </button>
                </div>
              ) : (
                <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-3xl space-y-4">
                  <div className="flex justify-between font-black text-xs">
                    <span className="text-orange-400">{isQualifier2 ? "GT Captain Fans" : "Klaasen Fans"}: {oppPercent}%</span>
                    <span className="text-pink-400">{isQualifier2 ? "Jaiswal Fans" : "Sooryavanshi Fans"}: {rrPercent}%</span>
                  </div>

                  {/* Elegant Animating Progress Bar */}
                  <div className="h-3 w-full rounded-full bg-zinc-800 overflow-hidden flex shadow-inner">
                    <div className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-700" style={{ width: `${oppPercent}%` }} />
                    <div className="h-full bg-gradient-to-r from-pink-500 to-purple-600 transition-all duration-700" style={{ width: `${rrPercent}%` }} />
                  </div>

                  <div className="text-xs font-black text-center text-emerald-400 flex items-center justify-center gap-1.5 bg-emerald-500/10 py-2 rounded-2xl border border-emerald-500/20">
                    <Check className="size-4" /> {ui.votedSuccess[lang] || ui.votedSuccess.en}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    );
  }
}
