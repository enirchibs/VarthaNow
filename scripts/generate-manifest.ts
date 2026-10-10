import * as fs from "fs";
import * as path from "path";

export interface ImageSpec {
  asset_code: string;
  kind: "person" | "place" | "topic" | "category";
  category: string;
  subcategory: string;
  title: string;
  prompt: string;
  negative_prompt: string;
  keywords_en: string[];
  keywords_te: string[];
  location_tags: string[];
  person_tags: string[];
  topic_tags: string[];
  intended_topics: string[];
  image_style: string;
  aspect_ratio: "16:9" | "1:1";
  focus: "center" | "left" | "right" | "top";
  conceptual: boolean;
}

const NEGATIVE_PROMPT = "text, letters, words, numbers, logo, watermark, signature, identifiable real person, political party flag, party symbols, party colours, fake government seals";
const BASE_STYLE_16_9 = "Editorial news photograph style, natural lighting, 16:9 landscape, main subject framed with clean composition and calm space in the lower third for a news headline band. Generic non-identifiable people only, no direct face close-ups. No text, letters, numbers, logos, watermarks, party flags or insignia.";
const BASE_STYLE_1_1 = "Editorial news category icon tile, modern photographic and graphic illustration style, balanced 1:1 square framing. Vibrant colours, clean background. No text, letters, logos or watermarks.";

function buildPrompt(title: string, scene: string, location: string, is1x1 = false): string {
  if (is1x1) {
    return `${title}. ${scene}. ${location}. ${BASE_STYLE_1_1}`;
  }
  return `${title}. ${scene}. ${location}. ${BASE_STYLE_16_9}`;
}

// ═══════════════════════════════════════════════════════════════════
// 1. Political & Civic Events (100 specs) - Prefix: EVT-POL
// ═══════════════════════════════════════════════════════════════════
const polSubcategories = [
  {
    sub: "assembly-legislature",
    topic: "politics",
    kind: "topic" as const,
    locations: ["Amaravati", "Hyderabad", "Andhra Pradesh", "Telangana"],
    scenes: [
      { t: "Legislative Assembly Hall chamber from press gallery", s: "Spacious democratic legislative assembly hall with rows of wooden desks, green seating, and speaker podium under warm interior hall lighting", l: "State Assembly Complex" },
      { t: "Legislative Council debating chamber wide view", s: "Grand legislative council hall with red carpeted aisle, wooden benches and empty debate floor under chandelier lighting", l: "Legislature Building" },
      { t: "State Secretariat administrative building exterior at sunrise", s: "Grand modern administrative state secretariat building with manicured lawns, national tricolor flagstaff and glass facade", l: "State Secretariat Corridor" },
      { t: "All-party meeting round table discussion room", s: "Large oval conference table with microphones, empty leather chairs, water glasses and note pads before high-level government discussion", l: "Cabinet Hall" },
      { t: "Assembly media point podium setup before briefing", s: "Cluster of broadcast microphones and recording devices mounted on a wooden podium against an official plain press backdrop", l: "Assembly Media Point" },
      { t: "Secretariat entrance gate with security checking", s: "Security personnel at modern automated entry gates of state government secretariat checking entry passes under morning sunlight", l: "Secretariat Main Gate" },
      { t: "Legislative committee room table setup", s: "Formal committee room with microphones, leather folders and document binders arranged around a rectangular boardroom table", l: "Assembly Committee Hall" },
      { t: "Old heritage assembly building architecture", s: "Historic white colonial-style assembly heritage building with arched corridors and lush palm gardens at dusk", l: "Heritage Assembly Complex" },
      { t: "Assembly library and archives hall", s: "Silent spacious legislative library with tall wooden bookshelves, legal archives and study desks with green reading lamps", l: "Assembly Reference Library" },
      { t: "Legislative speaker chamber corridor", s: "Dignified high-ceilinged corridor outside presiding officer office with marble pillars and warm directional lighting", l: "Legislative Secretariat" }
    ],
    kw_en: ["assembly", "legislature", "vidhan sabha", "secretariat", "session", "cabinet"],
    kw_te: ["అసెంబ్లీ", "శాసనసభ", "సచివాలయం", "కేబినెట్", "సమావేశాలు", "ప్రభుత్వం"]
  },
  {
    sub: "press-conference",
    topic: "politics",
    kind: "topic" as const,
    locations: ["Vijayawada", "Hyderabad", "Visakhapatnam", "Tirupati"],
    scenes: [
      { t: "Press conference podium seen from behind speakers", s: "Speaker hands gesturing at a podium with multiple media microphones, facing a room filled with news reporters and camera flashes", l: "Media Press Club" },
      { t: "Journalists in newsroom briefing with cameras on tripods", s: "Row of television news video cameras on tripods focused on empty briefing stage with studio light beams", l: "Press Conference Room" },
      { t: "Official government spokesperson briefing stage", s: "Government media briefing room with navy blue backdrop, wooden podium and row of reporter chairs with notebooks", l: "Information & Public Relations Hall" },
      { t: "Reporters holding microphones and audio recorders", s: "Hands of diverse journalists holding audio recording devices, phones and mics forward during an urgent press statement", l: "Media Corridor" },
      { t: "Emergency media briefing table with microphones", s: "Long desk covered with official microphones, water bottles and statement papers ready for official press briefing", l: "District Press Club" },
      { t: "Live telecast broadcast control monitors at briefing", s: "Television crew operating video switchers and audio consoles behind the cameras during a live news briefing", l: "Broadcast OB Van" },
      { t: "Press conference hall waiting for announcement", s: "Media hall illuminated by soft key lights with empty podium and media risers at the rear", l: "State Media Center" },
      { t: "Open-air press interaction under shade canopy", s: "Outdoor media interaction setup with battery lights, reporter crowd holding boom mics in natural evening light", l: "Field Media Point" },
      { t: "District collector addressing local press corps", s: "Distant view of district administration briefing room with PowerPoint projection screen and seated journalists", l: "Collectorate Media Hall" },
      { t: "Breaking news flash media cluster", s: "Dense group of photojournalists with telephoto lenses pointing towards the briefing entrance in anticipation", l: "Secretariat Media Enclosure" }
    ],
    kw_en: ["press conference", "media briefing", "reporters", "press meet", "spokesperson", "announcement"],
    kw_te: ["విలేకరుల సమావేశం", "ప్రెస్ మీట్", "మీడియా", "ప్రకటన", "వార్తలు", "జర్నలిస్టులు"]
  },
  {
    sub: "elections-voting",
    topic: "politics",
    kind: "topic" as const,
    locations: ["Andhra Pradesh", "Telangana", "Guntur", "Warangal"],
    scenes: [
      { t: "Citizens standing in orderly voting queue at polling station", s: "Diverse Indian citizens waiting patiently in a shaded outdoor queue with voter identification cards in hand at a local government school", l: "Polling Booth" },
      { t: "Electronic Voting Machine EVM setup in voting compartment", s: "Electronic voting machine and VVPAT printer inside a private cardboard voting booth on a wooden desk", l: "Polling Station Booth" },
      { t: "Voter finger marked with indelible blue election ink", s: "Close-up of a generic Indian citizen showing their left index finger marked with fresh purple-blue voting ink", l: "Polling Station Exit" },
      { t: "Election polling officers checking voter registration ledger", s: "Polling officials sitting behind wooden desks verifying voter list records and identity cards inside classroom booth", l: "Polling Station Room" },
      { t: "Sealed ballot box and EVM secure strong room lock", s: "Heavy steel door of election strong room with red wax seals, CCTV surveillance and armed security guard silhouette", l: "District Strong Room" },
      { t: "Election vote counting center hall with counting tables", s: "Spacious counting hall with wire-mesh partitions, numbered tables and election agents watching ballot tallying", l: "Vote Counting Center" },
      { t: "Elderly citizen assisted by volunteer at polling booth ramp", s: "Senior citizen in traditional attire walking up an accessible wheelchair ramp supported by a youth volunteer", l: "Model Polling Station" },
      { t: "Rural polling station with early morning voter turnout", s: "Village government primary school polling center in morning fog with villagers arriving to cast votes", l: "Rural Polling Station" },
      { t: "Returning officer verifying election nomination papers", s: "Desk with official election nomination files, verification stamp and legal registers in returning officer chamber", l: "Returning Officer Office" },
      { t: "Election commission mock poll demonstration setup", s: "Demonstration table with transparent ballot display box, test EVM unit and training pamphlets", l: "Election Training Hall" }
    ],
    kw_en: ["voting", "election", "polling booth", "evm", "vote count", "voter id", "democracy"],
    kw_te: ["ఎన్నికలు", "ఓటింగ్", "పోలింగ్ బూత్", "ఓటు", "ఈవీఎం", "కౌంటింగ్", "ఓటర్లు"]
  },
  {
    sub: "civic-collectorate",
    topic: "politics",
    kind: "topic" as const,
    locations: ["Visakhapatnam", "Vijayawada", "Khammam", "Karimnagar", "Kurnool"],
    scenes: [
      { t: "District Collectorate administrative complex facade", s: "Stately white district administrative office complex with Ashoka emblem silhouette, Indian flag and entrance portico", l: "District Collectorate" },
      { t: "Grievance redressal day Spandana Prajavani public hall", s: "Public hall where citizens sit on chairs waiting to submit petition letters to district administrative officers", l: "Prajavani Grievance Hall" },
      { t: "Revenue divisional officer RDO courtroom desk", s: "Formal wooden court desk with land revenue record registers, official seal and government reference books", l: "Revenue Division Office" },
      { t: "District disaster management control room monitors", s: "Operation center with digital maps of rainfall, cyclone tracks, weather radars and telecom operator desks", l: "Disaster Management Center" },
      { t: "Tahsildar office citizen service token counter", s: "Glass partition citizen assistance counter in mandal revenue office with token display screen and application forms", l: "Mandal Revenue Office" },
      { t: "Municipal corporation council hall seating arrangement", s: "Semicircular civic municipal council hall with mayor podium, corporator desks and digital sound systems", l: "Municipal Corporation Hall" },
      { t: "Village secretariat Grama Ward Sachivalayam exterior", s: "Clean two-storey rural ward secretariat building painted in subtle pastel green with service boards", l: "Grama Sachivalayam" },
      { t: "Village revenue officer reviewing village land maps", s: "Large cadastral land survey map laid out on wooden table with brass scale and survey measuring instruments", l: "Village Revenue Desk" },
      { t: "District review meeting with department officers", s: "Large conference room with district collector at head of table reviewing presentation on developmental targets", l: "Collectorate Meeting Hall" },
      { t: "Public information facilitation counter MeeSeva center", s: "Computer workstations in a citizen facilitation center where operators help citizens with digital certificates", l: "MeeSeva Civic Center" }
    ],
    kw_en: ["collectorate", "spandana", "prajavani", "sachivalayam", "mro", "administration", "district collector"],
    kw_te: ["కలెక్టరేట్", "స్పందన", "ప్రజావాణి", "సచివాలయం", "తహశీల్దార్", "పరిపాలన", "జిల్లా కలెక్టర్"]
  },
  {
    sub: "panchayat-local-body",
    topic: "politics",
    kind: "topic" as const,
    locations: ["Andhra Pradesh", "Telangana", "Godavari", "Nalgonda"],
    scenes: [
      { t: "Grama Sabha village assembly meeting under banyan tree", s: "Village residents seated on woven mats in circle under shade of grand banyan tree discussing local development works", l: "Village Panchayat Square" },
      { t: "Panchayat office building with solar rooftop panels", s: "Rural gram panchayat administrative office with clean whitewashed walls, national flag mast and rooftop solar array", l: "Gram Panchayat Bhavan" },
      { t: "Zilla Parishad general body meeting hall", s: "Spacious district zilla parishad conference hall with elected representatives seated around central podium", l: "Zilla Parishad Bhavan" },
      { t: "Mandal Parishad development office MPDO courtyard", s: "Rural block development administrative building courtyard with tractors and agricultural equipment on display", l: "Mandal Parishad Complex" },
      { t: "Sanitation drive review by village sarpanch and ward members", s: "Panchayat team inspecting clean village cement road, drainage canal and green tree plantation along roadside", l: "Model Village Road" },
      { t: "Drinking water overhead tank inspection by local body", s: "Tall concrete overhead potable water storage reservoir surrounded by greenery and water pipeline valves", l: "Rural Water Supply Works" },
      { t: "Village solar street lighting installation inspection", s: "Rural road with modern solar street lamps lighting up village path during evening twilight", l: "Panchayat Village Main Road" },
      { t: "Solid waste management recycling shed in rural panchayat", s: "Organized rural waste segregation shed with composting pits, dry waste bins and battery collection vehicle", l: "Panchayat Resource Center" },
      { t: "Panchayat computer lab for digital land records", s: "Rural computer workstation setup with printer, scanner and digital land passbooks ready for distribution", l: "Panchayat Digital Seva" },
      { t: "Community center hall inauguration setup with floral entrance", s: "New community multipurpose hall decorated with fresh marigold flower garlands and mango leaves at doorway", l: "Village Community Bhavan" }
    ],
    kw_en: ["panchayat", "grama sabha", "sarpanch", "zilla parishad", "mandal", "local body", "rural development"],
    kw_te: ["పంచాయతీ", "గ్రామ సభ", "సర్పంచ్", "జిల్లా పరిషత్", "మండల పరిషత్", "గ్రామాభివృద్ధి", "స్థానిక సంస్థలు"]
  },
  {
    sub: "welfare-distribution",
    topic: "politics",
    kind: "topic" as const,
    locations: ["Andhra Pradesh", "Telangana", "Anantapur", "Mahabubnagar"],
    scenes: [
      { t: "Government welfare scheme beneficiary certificate distribution", s: "Official stage with generic officials handing over financial assistance sanction certificates to smiling generic rural women", l: "Community Welfare Hall" },
      { t: "Social security pension distribution door-to-door", s: "Village volunteer using biometric fingerprint scanner at generic senior citizen doorstep under morning light", l: "Village Street" },
      { t: "Ration distribution fair price shop PDS counter", s: "Government fair price ration depot with electronic weighing scale, bags of fortified rice and biometric e-PoS device", l: "Fair Price Ration Shop" },
      { t: "Student school kit and uniform distribution ceremony", s: "Neatly stacked bundles of school bags, textbooks, notebooks and school uniform sets on display tables", l: "Government High School Stage" },
      { t: "Farmer input subsidy passbook distribution event", s: "Neat display of agricultural subsidy debit sanction cards and organic seed kits arranged on velvet-covered table", l: "Rythu Bharosa Kendra" },
      { t: "Women self-help group revolving fund bank cheque handover", s: "Group of generic rural women in sarees receiving a large ceremonial bank draft for micro-enterprise credit", l: "Mandal Community Hall" },
      { t: "Housing scheme house site patta distribution camp", s: "Official camp desk with neat stacks of legal land title deed pattas with state seal stamped on stamp paper", l: "Housing Revenue Camp" },
      { t: "Free healthcare scheme card distribution counter", s: "Hospital help desk with digital smart health cards being distributed to rural families by health assistants", l: "Aarogyasri Help Desk" },
      { t: "Agricultural borewell and motor subsidy delivery", s: "High-efficiency electric water pump motor sets and drip irrigation pipes stacked for farmer beneficiary delivery", l: "Agricultural Depot" },
      { t: "Free bicycle distribution for rural girl students", s: "Long neat row of brand new bicycles with baskets lined up on school playground under clear blue sky", l: "Zilla Parishad School Ground" }
    ],
    kw_en: ["welfare", "scheme", "pension", "ration", "subsidy", "rythu bharosa", "aarogyasri", "patta"],
    kw_te: ["సంక్షేమం", "పథకాలు", "పింఛన్", "రేషన్", "రైతు భరోసా", "ఆరోగ్యశ్రీ", "పట్టా", "ప్రభుత్వ సాయం"]
  },
  {
    sub: "public-rallies-civic",
    topic: "politics",
    kind: "topic" as const,
    locations: ["Vijayawada", "Hyderabad", "Tirupati", "Warangal"],
    scenes: [
      { t: "Massive public meeting crowd waving from distance", s: "Vast sea of generic public attendees seen from behind the stage lighting towers on an open parade ground at dusk", l: "Parade Grounds" },
      { t: "Peaceful citizen candlelight march for social awareness", s: "Silhouette of citizens holding glowing white candles in dusk procession along a tree-lined city boulevard", l: "City Boulevard" },
      { t: "National Independence Day parade celebration march", s: "Ceremonial parade contingent in crisp uniforms marching past saluting base under fluttering tricolor flags", l: "Police Parade Ground" },
      { t: "Republic Day cultural tableau float procession", s: "Colorfully decorated state cultural tableau float showcasing traditional art and architecture in ceremonial procession", l: "Rajpath Style Ceremonial Road" },
      { t: "Youth run marathon for health and civic voting awareness", s: "Large energetic crowd of runners in white t-shirts crossing start line arch under golden morning sunlight", l: "Beach Road Corridor" },
      { t: "Civic cleanliness Swachhata rally with banners", s: "Students and volunteers with green brooms and awareness placards walking along clean village street", l: "Panchayat Main Road" },
      { t: "Public meeting stage lighting truss and giant LED screens", s: "Massive stage setup with towering aluminum lighting trusses, giant LED video screens and empty central podium", l: "Exhibition Grounds" },
      { t: "Traffic police road safety awareness human chain rally", s: "School children and traffic wardens forming a continuous human chain holding reflective safety batons", l: "City Central Junction" },
      { t: "Dignitary official motorcade convoy on highway", s: "Black escort SUVs and white official sedan convoy moving steadily along a wide modern expressway with motorcycle outriders", l: "National Highway Flyover" },
      { t: "Police ceremonial guard of honour rehearsal", s: "Uniformed police personnel standing at perfect attention with ceremonial rifles in precision drill formation", l: "Police Training Academy" }
    ],
    kw_en: ["rally", "public meeting", "parade", "convoy", "human chain", "procession", "awareness", "swachh bharat"],
    kw_te: ["ర్యాలీ", "బహిరంగ సభ", "కవాతు", "కాన్వాయ్", "మానవహారం", "అవగాహన", "పోలీస్ పెరేడ్"]
  },
  {
    sub: "peaceful-protest-dharna",
    topic: "politics",
    kind: "topic" as const,
    locations: ["Vijayawada", "Hyderabad", "Visakhapatnam", "Tirupati"],
    scenes: [
      { t: "Peaceful dharna sit-in protest with placards from back", s: "Seated group of generic citizens on white cloth canopy dharna tent holding non-partisan demand placards from rear angle", l: "Dharna Chowk" },
      { t: "Advocates peaceful representation march at court complex", s: "Silhouettes of lawyers in black coats walking up stone stairs of high court holding legal petition folders", l: "Court Complex Approach" },
      { t: "Employees union peaceful badge-wearing protest", s: "Office staff at work wearing black protest ribbons on collars while typing on computers at government office", l: "Collectorate Office" },
      { t: "Farmers tractor peace rally on rural bypass road", s: "Line of agricultural tractors parked orderly along grassy highway shoulder with farmers standing nearby in peaceful discussion", l: "Rural Highway Bypass" },
      { t: "Teachers union peaceful demonstration for demands", s: "Educators holding plain placards with book symbols standing peacefully outside district education office", l: "District Education Office" },
      { t: "Anganwadi workers peaceful relay hunger strike camp", s: "Shaded pandal tent with generic women volunteers seated on cotton dhurries holding informational demand sheets", l: "Civic Square" },
      { t: "Citizen delegation submitting memorandum to official", s: "Four-person citizen committee presenting written petition folder across office desk to administrative official", l: "Collectorate Chamber" },
      { t: "Auto drivers association peaceful meeting at stand", s: "Line of clean green-and-yellow auto rickshaws with drivers gathered under shade tree in union discussion", l: "Auto Stand Complex" },
      { t: "Electricity employees peaceful demonstration at substation", s: "Technicians in safety helmets standing outside regional electrical power distribution center holding safety charter", l: "Transco Substation" },
      { t: "Trade union silent relay fast under shamiana tent", s: "Community organizers seated quietly on elevated stage under striped canvas tent with water urns", l: "Industrial Area Gate" }
    ],
    kw_en: ["protest", "dharna", "strike", "petition", "memorandum", "dharna chowk", "peaceful demonstration"],
    kw_te: ["ధర్నా", "నిరసన", "సమ్మె", "వినతిపత్రం", "ధర్నా చౌక్", "ఆందోళన", "శాంతియుత నిరసన"]
  },
  {
    sub: "cabinet-meetings",
    topic: "politics",
    kind: "topic" as const,
    locations: ["Amaravati", "Hyderabad", "Andhra Pradesh", "Telangana"],
    scenes: [
      { t: "State cabinet conference hall with empty chairs and agenda", s: "Formal horseshoe conference table with high-back leather chairs, digital tablet displays and green agenda folders", l: "Cabinet Hall" },
      { t: "Cabinet sub-committee review desk with blueprints", s: "Long meeting desk with infrastructure blueprints, budget calculation sheets and digital projection monitors", l: "Secretariat Boardroom" },
      { t: "Chief secretary state level coordination meeting hall", s: "Executive conference room with state emblem wall backdrop, microphone consoles and administrative files", l: "Conference Room 1" },
      { t: "Official gazette notification signing desk", s: "Polished teakwood desk with brass fountain pen, state official gazette seal and printed white paper notification", l: "Governor Office Secretariat" },
      { t: "Government advisory council conference setup", s: "Boardroom with glass walls overlooking city skyline, equipped with teleconferencing camera setup", l: "Planning Board Hall" },
      { t: "Bipartisan council chamber negotiation table", s: "Formal negotiation table with water carafes, leather blotters and bilingual constitution reference books", l: "Council Secretariat" },
      { t: "State treasury financial review meeting room", s: "Financial planning meeting desk with annual budget volumes, fiscal deficit charts and accounting files", l: "Finance Department Boardroom" },
      { t: "Infrastructure project task force monitoring center", s: "War room with multi-screen video wall displaying live satellite feeds and highway progress charts", l: "Project Monitoring Unit" },
      { t: "State civil services executive briefing auditorium", s: "Tiered auditorium with IAS and IPS probationers seated with laptops listening to administrative lecture", l: "Administrative Staff College" },
      { t: "Cabinet press briefing podium with national flag", s: "Neat wooden press briefing dais flanked by official tricolor flag and state emblem backdrop", l: "Media Briefing Center" }
    ],
    kw_en: ["cabinet", "meeting", "gazette", "chief secretary", "governance", "policy", "secretariat"],
    kw_te: ["కేబినెట్", "మంత్రిమండలి", "జీవో", "ప్రభుత్వ నిర్ణయం", "సమీక్ష", "పరిపాలన", "సచివాలయం"]
  },
  {
    sub: "protocol-governor-dignitaries",
    topic: "politics",
    kind: "topic" as const,
    locations: ["Raj Bhavan Hyderabad", "Raj Bhavan Vijayawada", "Amaravati", "New Delhi"],
    scenes: [
      { t: "Raj Bhavan grand ceremonial durbar hall", s: "Magnificent high-ceilinged ceremonial hall with crystal chandeliers, red velvet carpet and gilded chairs on stage", l: "Raj Bhavan Durbar Hall" },
      { t: "Swearing-in oath ceremony dais preparation", s: "Formal ceremonial dais decorated with brass lamps, fresh jasmine flowers and national emblem backdrop", l: "Ceremonial Lawns" },
      { t: "Governor office chamber with constitution book", s: "Stately executive office desk with bound copy of Constitution of India and national flag stand", l: "Raj Bhavan Study" },
      { t: "Official state banquet table setting with fine chinaware", s: "Long banquet table decorated with silverware, fresh floral arrangements and menu cards in formal dining room", l: "Banquet Hall" },
      { t: "Dignitary airport tarmac guard of honour reception", s: "Red carpet rolled out on airport tarmac with ceremonial guard of honour standing at present arms", l: "State Airport VIP Apron" },
      { t: "Inter-state border coordination conference room", s: "Bilateral meeting hall with state seals of AP and Telangana displayed behind negotiating tables", l: "Interstate Guest House" },
      { t: "Raj Bhavan manicured heritage gardens and fountain", s: "Lush botanical gardens of gubernatorial estate with stone fountains, peacock silhouettes and heritage portico", l: "Raj Bhavan Gardens" },
      { t: "State award medal presentation velvet display tray", s: "Polished wooden tray with velvet cushions displaying gold state merit medals and parchment citations", l: "State Awards Hall" },
      { t: "High court chief justice oath ceremony dias", s: "Dignified courtroom with rich wood paneling, judge bench with gavel and ceremonial red carpets", l: "High Court Main Courtroom" },
      { t: "VVIP convoy helicopter landing on helipad", s: "White official twin-engine helicopter rotor blades spinning slowly on painted tarmac helipad with security ring", l: "VIP Helipad Grounds" }
    ],
    kw_en: ["raj bhavan", "governor", "oath", "swearing in", "protocol", "dignitary", "durbar hall"],
    kw_te: ["రాజ్ భవన్", "గవర్నర్", "ప్రమాణ స్వీకారం", "దర్బార్ హాల్", "ప్రోటోకాల్", "అధికారిక వేడుక"]
  }
];

// ═══════════════════════════════════════════════════════════════════
// 2. People, Professions & Community Life (100 specs) - Prefix: PPL-PRF
// ═══════════════════════════════════════════════════════════════════
const peopleSubcategories = [
  {
    sub: "farmers-agriculture",
    topic: "agriculture",
    kind: "person" as const,
    locations: ["Godavari Delta", "Krishna District", "Guntur", "Karimnagar", "Nalgonda"],
    scenes: [
      { t: "Farmer in green paddy field checking crop health", s: "Generic Indian farmer in cotton dhoti standing amidst emerald green lush paddy crop inspecting grain heads in morning light", l: "Paddy Field" },
      { t: "Farmers using modern tractor for field tilling", s: "Red tractor tilling rich black cotton soil in open countryside under dramatic monsoon clouds", l: "Farmland Plains" },
      { t: "Rythu Bharosa Kendra agricultural scientist advising farmer", s: "Agriculture officer showing soil health test report to generic farmer at village farmer center", l: "Rythu Bharosa Kendra" },
      { t: "Farmers harvesting golden ripe paddy with sickles", s: "Group of generic farm workers in field cutting ripe golden rice crop stalks under clear harvest sky", l: "Harvest Field" },
      { t: "Cotton farmer picking fluffy white cotton bolls", s: "Field of blooming white cotton plants with generic farmer placing harvested cotton into cloth sack", l: "Cotton Plantation" },
      { t: "Mirchi chilli farmer inspecting bright red dried chillies", s: "Vast drying yard carpeted with glowing bright red Guntur chillies under brilliant afternoon sun", l: "Chilli Drying Yard" },
      { t: "Drip irrigation pipe system installation in orchard", s: "Farmer connecting precision black drip micro-irrigation lines around mango saplings in neat orchard rows", l: "Horticulture Orchard" },
      { t: "Farmer operating solar-powered borewell water pump", s: "Generic farmer switching on solar water pump controller beside gushing clean irrigation canal pipe", l: "Solar Pump Station" },
      { t: "Agricultural drone spraying bio-fertiliser over crops", s: "High-tech agricultural quadcopter drone hovering over green fields spraying fine mist in evening golden hour", l: "Smart Farming Field" },
      { t: "Farmers gathering at wholesale vegetable market yard", s: "Busy early morning agricultural produce market with crates of fresh tomatoes, brinjals and green leafy vegetables", l: "Rythu Bazar Market Yard" }
    ],
    kw_en: ["farmer", "agriculture", "paddy field", "rythu", "tractor", "harvest", "crops", "farming", "chilli", "cotton"],
    kw_te: ["రైతు", "వ్యవసాయం", "వరి పొలం", "రైతు భరోసా", "ట్రాక్టర్", "పంటలు", "మిర్చి", "పత్తి", "సాగు"]
  },
  {
    sub: "fishermen-coastal",
    topic: "marine-life",
    kind: "person" as const,
    locations: ["Visakhapatnam", "Kakinada", "Machilipatnam", "Bhavanapadu", "Nizampatnam"],
    scenes: [
      { t: "Fishermen mending large blue nylon fishing nets on beach", s: "Group of generic coastal fishermen sitting on clean sand untangling and repairing ocean nets with wooden shuttles", l: "Fishing Harbour Coast" },
      { t: "Traditional wooden motorised fishing boat returning at sunrise", s: "Colourful wooden fishing boat with small Indian flag cutting through golden ocean surf near shore", l: "Bay of Bengal Shore" },
      { t: "Fisherwomen sorting fresh sea catch into bamboo baskets", s: "Generic coastal women in colourful sarees sorting fresh pomfret, prawns and mackerel on clean harbor pier", l: "Fisheries Jetty" },
      { t: "Deep sea trawler fleet moored at fishing harbour", s: "Dense line of blue and yellow steel fishing trawlers docked along concrete quay under morning mist", l: "Visakhapatnam Fishing Harbour" },
      { t: "Shrimp aquaculture farm aerator water wheels spinning", s: "Large brackish water prawn cultivation pond with mechanical paddle wheel aerators churning foamy white water", l: "Aquaculture Farm" },
      { t: "Coastal lighthouse beacon at twilight with fishing vessels", s: "Tall red-and-white striped maritime lighthouse casting bright revolving beam over calm ocean waters", l: "Coastal Lighthouse Point" },
      { t: "Fisherman casting traditional throw net from shore", s: "Dramatic silhouette of generic fisherman in mid-cast throwing circular fishing net into breaking ocean waves", l: "Sea Coastline" },
      { t: "Fish drying racks along coastal village beach", s: "Rows of elevated wooden mesh racks with salted fish drying in sea breeze under sunny blue sky", l: "Coastal Village" },
      { t: "Modern seafood processing and cold storage facility", s: "Workers in white hygienic coats and caps packaging frozen export-grade shrimp in stainless steel facility", l: "Seafood Cold Chain Plant" },
      { t: "Boat builders shaping teak hull at traditional boatyard", s: "Skilled carpenters using wooden mallets and chisels shaping strong wooden frame of fishing vessel", l: "Harbour Boatyard" }
    ],
    kw_en: ["fisherman", "fisheries", "fishing boat", "harbour", "prawns", "aquaculture", "marine", "sea catch"],
    kw_te: ["మత్స్యకారులు", "చేపల వేట", "హార్బర్", "చేపలు", "రొయ్యలు", "సముద్రం", "తీరప్రాంతం"]
  },
  {
    sub: "handloom-weavers",
    topic: "crafts",
    kind: "person" as const,
    locations: ["Mangalagiri", "Dharmavaram", "Pochampally", "Venkatagiri", "Gadwal", "Uppada"],
    scenes: [
      { t: "Master weaver operating traditional pit loom with silk threads", s: "Artisan sitting at wooden pit loom rhythmically tossing wooden flying shuttle through vibrant dyed silk warp", l: "Weavers Colony" },
      { t: "Pochampally Ikkat tie-and-dye yarn processing", s: "Artisan carefully tying geometric thread patterns on wooden frame before natural colour dip-dyeing", l: "Ikkat Workshop" },
      { t: "Mangalagiri cotton fabric weaving with Nizam zari border", s: "Loom creating crisp pure cotton textile with shimmering gold zari border under soft window light", l: "Handloom Cooperative" },
      { t: "Dharmavaram silk saree folding and quality check", s: "Weaver family inspecting intricate floral pallu of rich maroon and gold wedding silk saree on clean table", l: "Silk Saree Workshop" },
      { t: "Yarn dyeing vat with bubbling natural plant colours", s: "Artisan submerging cotton yarn hanks into copper dyeing vat producing rich turmeric yellow and indigo hues", l: "Natural Dyeing Unit" },
      { t: "Spinning charkha wheel winding cotton yarn onto bobbins", s: "Generic artisan turning traditional wooden spinning wheel winding fine thread onto wooden bobbins", l: "Khadi Village Unit" },
      { t: "Uppada Jamdani fine translucent saree weaving", s: "Intricate hand-drawn floral motifs being woven directly into gossamer cotton fabric using bamboo needles", l: "Uppada Weaving Center" },
      { t: "Kalamkari block printing on cotton fabric", s: "Artisan pressing carved teakwood printing block dipped in black fermented jaggery ink onto cotton cloth", l: "Kalamkari Craft Center" },
      { t: "Handloom cooperative society showroom display", s: "Modern showroom displaying folded stacks of handwoven sarees, dress materials and organic fabrics", l: "APCO Showroom" },
      { t: "Silk cocoon sorting at government sericulture market", s: "Baskets filled with fluffy golden and white natural mulberry silk cocoons being weighed on balance scales", l: "Sericulture Market" }
    ],
    kw_en: ["handloom", "weaver", "saree", "pochampally", "mangalagiri", "dharmavaram", "silk", "khadi", "textile"],
    kw_te: ["చేనేత", "నేతన్న", "చేనేత కార్మికులు", "చీరలు", "మంగళగిరి", "ధర్మవరం", "పోచంపల్లి", "పట్టు", "ఖాదీ"]
  },
  {
    sub: "education-teachers-students",
    topic: "education",
    kind: "person" as const,
    locations: ["Visakhapatnam", "Hyderabad", "Vijayawada", "Tirupati", "Warangal"],
    scenes: [
      { t: "Teacher explaining science concept on interactive smart board", s: "Enthusiastic generic teacher pointing at digital interactive board in bright modern government school classroom", l: "Modern Smart School" },
      { t: "School students in neat uniforms reading books in library", s: "Group of cheerful Indian school children in blue uniforms reading colorful illustrated storybooks at library table", l: "School Library" },
      { t: "College engineering students collaborating on robotics project", s: "Undergraduate university students testing robotic vehicle and circuit boards in electronics engineering lab", l: "Engineering College Lab" },
      { t: "Government school mid-day meal clean dining hall", s: "School children sitting in organized rows enjoying nutritious hot meal and boiled eggs from clean steel plates", l: "School Dining Hall" },
      { t: "University graduation convocation students tossing mortarboards", s: "Happy graduates in black academic gowns and robes celebrating on grand university lawn", l: "University Campus Quad" },
      { t: "High school physics lab students using optical prisms", s: "Students in white lab coats observing rainbow light spectrum passing through glass prism on optical bench", l: "Science Laboratory" },
      { t: "Medical students in anatomy dissection demonstration hall", s: "Medical college students in white coats and stethoscopes listening to professor around 3D anatomical model", l: "Medical College Hall" },
      { t: "Rural students using digital tablets under tree in school yard", s: "Children gathered on clean stone bench outdoors using educational learning tablets together", l: "Rural High School" },
      { t: "School sports day sprint race finish line excitement", s: "Athletic school students running fast toward red ribbon finish line on grassy track with cheering classmates", l: "School Sports Ground" },
      { t: "Tenth class public examination hall seating setup", s: "Organized examination hall with spaced single desks, hall ticket numbers chalked on desks under ceiling fans", l: "Examination Center" }
    ],
    kw_en: ["students", "teacher", "school", "college", "education", "classroom", "exams", "university", "degrees"],
    kw_te: ["విద్యార్థులు", "ఉపాధ్యాయులు", "పాఠశాల", "కాలేజీ", "విద్యావ్యవస్థ", "తరగతి గది", "పరీక్షలు", "చదువు"]
  },
  {
    sub: "doctors-healthcare-workers",
    topic: "health",
    kind: "person" as const,
    locations: ["Hyderabad", "Visakhapatnam", "Guntur", "Tirupati", "Kurnool"],
    scenes: [
      { t: "Doctor with stethoscope consulting patient in clean OPD clinic", s: "Generic caring doctor in white lab coat reviewing prescription chart with patient in bright consultation room", l: "Hospital OPD Clinic" },
      { t: "Hospital ICU intensive care monitoring nursing station", s: "Dedicated nursing team monitoring digital ECG heart rate displays and infusion pumps at central station", l: "Hospital ICU Ward" },
      { t: "Surgical team in sterile operating theatre under overhead lights", s: "Surgeons and scrub nurses in blue surgical gowns, masks and caps focused on delicate laparoscopic surgery", l: "Hospital Operation Theatre" },
      { t: "ASHA health worker checking blood pressure of rural mother", s: "Village healthcare worker in pink saree measuring blood pressure with digital cuff at rural home veranda", l: "Village Health Sub-center" },
      { t: "Hospital pharmacy dispensing generic medicines counter", s: "Pharmacist in lab coat selecting medicine boxes from neatly organized shelving racks with computer scanner", l: "Hospital Pharmacy" },
      { t: "Emergency 108 ambulance with paramedics rushing stretcher", s: "High-tech ambulance with flashing blue beacon lights and paramedic team transferring patient stretcher", l: "Hospital Emergency Trauma Bay" },
      { t: "Dialysis center with modern kidney care machines in row", s: "Spotless dialysis ward with clean beds and advanced hemodialysis filter equipment running smoothly", l: "Government Super Specialty Hospital" },
      { t: "Blood donation camp voluntary donors on comfortable recliners", s: "Volunteers donating blood under supervision of red cross phlebotomist team with juice packs ready", l: "Blood Bank Camp" },
      { t: "Pediatric ward with colorful murals and gentle nurses", s: "Friendly nurse administering routine oral polio drops to infant held by mother in cheerful children clinic", l: "Primary Health Center PHC" },
      { t: "Diagnostic laboratory technician operating automated hematology analyzer", s: "Lab scientist in safety glasses loading blood sample test tubes into computerized diagnostic machine", l: "Pathology Diagnostic Lab" }
    ],
    kw_en: ["doctor", "nurse", "hospital", "healthcare", "asha worker", "ambulance", "medicine", "health clinic"],
    kw_te: ["వైద్యులు", "డాక్టర్", "నర్సులు", "ఆసుపత్రి", "వైద్యం", "ఆరోగ్యం", "ఆశా వర్కర్", "అంబులెన్స్"]
  },
  {
    sub: "police-law-enforcement",
    topic: "civic-safety",
    kind: "person" as const,
    locations: ["Visakhapatnam", "Vijayawada", "Hyderabad", "Tirupati", "Guntur"],
    scenes: [
      { t: "Traffic police officer directing vehicle flow at busy junction", s: "Smart traffic constable in white and khaki uniform with reflective gloves signaling traffic on city road", l: "City Traffic Junction" },
      { t: "Modern police command and control center video surveillance wall", s: "High-tech command center with police officers monitoring high-resolution CCTV traffic and safety cameras", l: "Police Command Center" },
      { t: "Police patrol highway vehicle with emergency light bar", s: "White police interceptor patrol car parked with flashing red-and-blue LED light bar along scenic coastal road", l: "Highway Patrol Point" },
      { t: "Disha women police protection wing mobile counseling vehicle", s: "Specially equipped pink-and-blue women safety help van with friendly women police officers", l: "Disha Police Station" },
      { t: "Police dog squad handler with trained labrador sniffer dog", s: "Uniformed handler walking alongside alert canine wearing police harness at railway security check", l: "Railway Station Security" },
      { t: "Community policing friendly interaction at village choupal", s: "Sub-inspector sitting with village elders and youth explaining cybercrime safety and helpline numbers", l: "Village Police Outreach" },
      { t: "Forensic investigation team examining mock evidence scene", s: "Forensic officers in white shoe covers and gloves placing yellow evidence markers on ground with measuring tape", l: "Forensic Training Center" },
      { t: "Mounted police cavalry unit on parade ground", s: "Magnificent dark horses with police riders in ceremonial uniforms trotting in perfect alignment on grass", l: "Police Academy Grounds" },
      { t: "Police band playing brass trumpets during state ceremony", s: "Regimental brass band in scarlet tunics playing trumpets and side drums with polished instruments", l: "Ceremonial Parade Grounds" },
      { t: "Reception desk at modern friendly police station", s: "Welcoming reception counter with citizen visitor log, digital complaint kiosk and glass partition", l: "Model Police Station" }
    ],
    kw_en: ["police", "traffic police", "cops", "law and order", "security", "disha police", "patrol"],
    kw_te: ["పోలీసులు", "ట్రాఫిక్ పోలీస్", "భద్రత", "రక్షణ", "దిశ పోలీస్", "శాంతిభద్రతలు", "పోలీస్ స్టేషన్"]
  },
  {
    sub: "it-tech-professionals",
    topic: "technology",
    kind: "person" as const,
    locations: ["HITEC City Hyderabad", "Madhapur", "Gachibowli", "Rushikonda IT SEZ Vizag"],
    scenes: [
      { t: "Software engineers collaborating at standing desk in modern IT office", s: "Diverse tech team discussing code architecture on multiple ultrawide monitors in bright open-plan tech hub", l: "IT Tech Park" },
      { t: "Data scientist analyzing AI charts on high-resolution displays", s: "Professional reviewing neural network training accuracy graphs and data flow diagrams on dual 4K screens", l: "AI Research Lab" },
      { t: "Cybersecurity team monitoring threat dashboard in server room", s: "Engineers with laptops inside modern data center with blue glowing server rack towers and cable trays", l: "Cloud Data Center" },
      { t: "Tech startup founders brainstorming on glass whiteboard", s: "Creative team drawing app wireframes and flowcharts with neon dry-erase markers on transparent glass wall", l: "Startup Incubator Hub" },
      { t: "Cloud DevOps engineer managing cluster deployment terminal", s: "Over-the-shoulder view of clean dark-theme code terminal with green deployment status text", l: "Tech Innovation Center" },
      { t: "Mobile app UI/UX designers testing prototypes on smartphones", s: "Designer arranging Figma design components on large drawing tablet beside mobile phone test devices", l: "Product Design Studio" },
      { t: "Tech professionals having coffee in modern corporate cafeteria", s: "Young employees chatting around espresso bar with large floor-to-ceiling glass windows overlooking cyber towers", l: "IT Campus Cafeteria" },
      { t: "Global tech conference keynote audience with laptops", s: "Audience of tech delegates in dimmed auditorium with glowing laptop screens facing blue illuminated main stage", l: "Convention Center Auditorium" },
      { t: "Hardware IoT engineers soldering sensor board prototype", s: "Engineer using precision soldering iron and digital oscilloscope to assemble smart IoT microchip board", l: "Hardware Prototyping Lab" },
      { t: "Hybrid tech worker on video call in quiet acoustic pod", s: "Software developer wearing noise-canceling headset speaking to remote team inside modern wooden privacy booth", l: "Co-working Space" }
    ],
    kw_en: ["software", "tech", "it employees", "hitec city", "engineers", "coding", "startup", "data center", "technology"],
    kw_te: ["సాఫ్ట్‌వేర్", "ఐటీ ఉద్యోగులు", "హైటెక్ సిటీ", "ఇంజనీర్లు", "టెక్నాలజీ", "స్టార్టప్", "డేటా సెంటర్"]
  },
  {
    sub: "transport-auto-drivers",
    topic: "transport",
    kind: "person" as const,
    locations: ["Visakhapatnam", "Hyderabad", "Vijayawada", "Tirupati"],
    scenes: [
      { t: "Auto rickshaw driver in khaki uniform beside clean vehicle", s: "Proud generic auto driver standing beside bright yellow-and-green auto rickshaw parked under shade tree", l: "City Auto Stand" },
      { t: "APSRTC RTC bus driver in uniform behind steering wheel", s: "Experienced state transport bus driver in khaki shirt holding large steering wheel ready to depart terminal bay", l: "RTC Central Bus Station" },
      { t: "Electric auto rickshaw e-rickshaw charging at battery station", s: "Row of green eco-friendly electric passenger autos plugged into fast-charging station pedestals", l: "EV Charging Hub" },
      { t: "Locomotive train pilot in cab overlooking scenic railway tracks", s: "Indian Railways train driver looking out of front glass cab window as electric engine cruises through green hills", l: "Railway Main Line" },
      { t: "Heavy truck driver taking rest at modern highway dhaba", s: "Artfully painted multi-axle freight lorry parked outside clean highway rest plaza at twilight", l: "National Highway Dhaba" },
      { t: "City metro rail train operator in modern ergonomic cabin", s: "Metro driver in uniform operating digital touchscreen control console as train enters elevated glass station", l: "Metro Rail Line" },
      { t: "Delivery courier executive with thermal food bag on electric scooter", s: "Delivery person in bright helmet and jacket checking delivery GPS route on smartphone mount", l: "Urban City Street" },
      { t: "School bus driver conducting pre-trip safety vehicle check", s: "Driver inspecting yellow school bus emergency exit door, tire pressure and first-aid box in morning sun", l: "School Bus Yard" },
      { t: "Fleet of new state express buses lined up in depot", s: "Pristine line of newly delivered green-and-white Ultra Deluxe RTC buses parked at regional maintenance depot", l: "RTC Bus Depot" },
      { t: "Toll plaza operator greeting driver at automated FASTag lane", s: "Operator inside modern glass toll booth as boom barrier automatically rises for moving car", l: "Expressway Toll Plaza" }
    ],
    kw_en: ["auto driver", "rtc bus", "transport", "driver", "metro", "delivery", "fastag", "highways"],
    kw_te: ["ఆటో డ్రైవర్", "ఆర్టీసీ బస్సు", "రవాణా", "డ్రైవర్", "మెట్రో", "డెలివరీ బాయ్", "హైవే"]
  },
  {
    sub: "street-vendors-small-business",
    topic: "business",
    kind: "person" as const,
    locations: ["Visakhapatnam", "Hyderabad", "Vijayawada", "Rajahmundry"],
    scenes: [
      { t: "Street food vendor preparing fresh hot mirchi bajji and punugulu", s: "Vendor frying crispy golden mirchi bajjis in large iron kadai pan with steam rising in evening market", l: "Evening Street Food Lane" },
      { t: "Tender coconut vendor with machete and pile of green coconuts", s: "Street vendor expertly slicing top of fresh green tender coconut for customer on hot sunny afternoon", l: "Roadside Coconut Stall" },
      { t: "Flower market vendor threading fragrant jasmine marigold garlands", s: "Artisan sitting among piles of fragrant orange marigolds and white jasmine blossoms making floral garlands", l: "Flower Wholesale Bazar" },
      { t: "Street vendor displaying UPI QR code scanner for digital payments", s: "Close-up of laminated digital soundbox and QR payment code stand placed on pushcart with fresh fruits", l: "Street Fruit Cart" },
      { t: "Traditional sweet shop master making hot bandar laddu", s: "Confectioner stirring rich golden besan flour and pure ghee in large brass cauldron with wooden paddle", l: "Traditional Sweet Shop" },
      { t: "Clay potter shaping water pots on electric potter wheel", s: "Skilled hands of potter gently shaping wet red clay into smooth earthenware drinking pot", l: "Potters Colony" },
      { t: "Tailor sewing garment on classic pedal sewing machine", s: "Tailor guiding bright cotton cloth through presser foot of black vintage sewing machine in small shop", l: "Local Tailor Shop" },
      { t: "Fruit vendor arranging colorful rows of apples oranges mangoes", s: "Neatly stacked vibrant pyramids of fresh seasonal fruits on wooden pushcart with clean canopy", l: "City Fruit Market" },
      { t: "Small village grocery Kirana store counter with packed provisions", s: "Cozy neighborhood provision store with glass jars of spices, pulses and hanging snack packets", l: "Village Kirana Shop" },
      { t: "Blacksmith forging agricultural tool on glowing iron anvil", s: "Sparks flying as blacksmith strikes red-hot iron sickle blade with heavy hammer in open workshop", l: "Traditional Blacksmith Unit" }
    ],
    kw_en: ["street vendor", "small business", "kirana", "sweets", "upi payment", "potter", "bazaar", "market"],
    kw_te: ["చిరు వ్యాపారులు", "వీధి వ్యాపారులు", "కిరాణా", "మార్కెట్", "యూపీఐ పేమెంట్స్", "చేతివృత్తులు", "వ్యాపారం"]
  },
  {
    sub: "culture-festivals-community",
    topic: "culture",
    kind: "topic" as const,
    locations: ["Konaseema", "Hyderabad", "Tirupati", "Warangal", "Srikakulam"],
    scenes: [
      { t: "Sankranti harvest festival colorful muggu rangoli with gobbemmalu", s: "Intricate white chalk and colored powder floor mandala decorated with yellow marigolds and cowdung gobbemmalu at village doorstep", l: "Village Home Courtyard" },
      { t: "Bathukamma floral stack festival celebration in Telangana", s: "Exquisite conical arrangement of seasonal yellow gunugu and orange thangedu flowers placed on polished brass plate", l: "Temple Courtyard" },
      { t: "Ugadi festival traditional neem and jaggery pachadi bowl", s: "Decorative brass bowl containing fresh green raw mango, neem flowers, jaggery and tamarind pachadi beside mango leaves", l: "Traditional Kitchen" },
      { t: "Kuchipudi classical dancer footwork and brass plate", s: "Close-up of classical dancer feet adorned with red alta dye and brass bells dancing on edge of round brass plate", l: "Classical Dance Stage" },
      { t: "Village temple chariot Ratham car festival procession", s: "Gigantic carved wooden temple chariot decorated with colorful flags pulled by thousands of devotees along wide temple street", l: "Temple Car Street" },
      { t: "Carnatic classical musicians playing veena and mridangam", s: "Musicians seated on silk carpet playing traditional wooden Saraswati veena and two-headed mridangam drum", l: "Music Sabha Hall" },
      { t: "Deepavali earthen diyas oil lamps glowing in rows", s: "Terracotta clay oil lamps with warm golden flickering cotton wicks lined along veranda steps at twilight", l: "Home Veranda" },
      { t: "Traditional bullock cart race during rural festival", s: "Decorated white bullocks with painted horns and brass bells running along sandy track with cheering village crowd", l: "Rural Fairgrounds" },
      { t: "Haridasu wearing brass vessel singing Sankranti hymns", s: "Traditional devotee in saffron attire carrying copper akshaya patra on head and chiming cymbals along village lane", l: "Village Street" },
      { t: "Bonalu festival decorated brass pot carrying procession", s: "Women wearing silk sarees carrying brass pots adorned with neem leaves, turmeric and burning oil lamps on head", l: "Historic Old City Street" }
    ],
    kw_en: ["sankranti", "bathukamma", "ugadi", "kuchipudi", "festivals", "temple chariot", "culture", "tradition", "bonalu"],
    kw_te: ["సంక్రాంతి", "బతుకమ్మ", "ఉగాది", "కూచిపూడి", "పండుగలు", "రథోత్సవం", "బోనాలు", "తెలుగు సంస్కృతి"]
  }
];

// ═══════════════════════════════════════════════════════════════════
// 3. Places & Infrastructure (AP/TS) (100 specs) - Prefix: PLC-INF
// ═══════════════════════════════════════════════════════════════════
const placesSubcategories = [
  {
    sub: "visakhapatnam-coast-landmarks",
    topic: "places",
    kind: "place" as const,
    locations: ["Visakhapatnam", "Andhra Pradesh"],
    scenes: [
      { t: "RK Beach promenade at sunrise with morning walkers", s: "Scenic curved coastal boulevard alongside blue Bay of Bengal with paved walking track, palm trees and morning joggers", l: "RK Beach Road" },
      { t: "Kailasagiri hilltop panoramic view over Vizag city and ocean", s: "Breathtaking aerial hilltop view showing the sweeping green coastline, harbor breakwater and modern city skyline", l: "Kailasagiri Hill" },
      { t: "Rushikonda blue flag beach with rolling surf and rocky hills", s: "Pristine golden sand beach framed by verdant coastal headlands and clean turquoise ocean waves under sunny sky", l: "Rushikonda Beach" },
      { t: "Historic Simhachalam temple gopuram on wooded hillside", s: "Ancient stone temple architecture and tiered gopuram rising majestically amidst dense green forested Eastern Ghats", l: "Simhachalam Hills" },
      { t: "Araku Valley coffee plantations in morning mountain mist", s: "Lush green rolling mountain slopes with shade-grown coffee plants and tribal village huts in soft fog", l: "Araku Valley" },
      { t: "Visakhapatnam international sea port container terminal", s: "Heavy gantry cranes loading large container ships docked along deepwater port harbor basin", l: "Vizag Port Basin" },
      { t: "Visakhapatnam Steel Plant blast furnace complex at dusk", s: "Massive industrial blast furnace steel plant structures illuminated against twilight sky with smoke stacks", l: "Vizag Steel Plant Area" },
      { t: "Visakhapatnam central railway station entrance portico", s: "Busy modern railway terminal facade with passenger concourse, landscaped roundabout and auto stands", l: "Vizag Railway Station" },
      { t: "Dolphin Nose hill and coastal lighthouse promontory", s: "Massive rocky headland resembling a dolphin jutting out into deep blue ocean with lighthouse tower", l: "Dolphin Nose Promontory" },
      { t: "Bheemili Beach historic Dutch cemetery and estuary", s: "Serene estuary where river meets sea near quiet sandy beach with historic colonial stone watchtower", l: "Bheemunipatnam Coast" }
    ],
    kw_en: ["vizag", "visakhapatnam", "rk beach", "kailasagiri", "rushikonda", "araku", "simhachalam", "vizag port", "steel plant"],
    kw_te: ["విశాఖపట్నం", "వైజాగ్", "ఆర్కే బీచ్", "కైలాసగిరి", "రుషికొండ", "అరకు", "సింహాచలం", "వైజాగ్ పోర్ట్", "స్టీల్ ప్లాంట్"]
  },
  {
    sub: "bhogapuram-infrastructure-conceptual",
    topic: "infrastructure",
    kind: "place" as const,
    locations: ["Bhogapuram", "Vizianagaram", "Andhra Pradesh"],
    conceptual: true,
    scenes: [
      { t: "Bhogapuram International Airport modern passenger terminal design (Conceptual)", s: "Futuristic glass and steel airport terminal building with undulating wave roof architecture and landscaped gardens (Conceptual Rendering)", l: "Bhogapuram Airport Site" },
      { t: "Bhogapuram Airport runway construction and paving machinery", s: "Heavy asphalt pavers and earthmoving machinery laying long flat concrete aircraft runway in open coastal plains", l: "Bhogapuram Runway Site" },
      { t: "Bhogapuram air traffic control ATC tower design (Conceptual)", s: "Sleek aerodynamic air traffic control tower rising above airport apron with glass control cab (Conceptual Design)", l: "Airport Zone" },
      { t: "Six-lane express beach corridor highway to Bhogapuram", s: "Wide modern asphalt multi-lane expressway running parallel to sea coast with LED street lights and green median", l: "Coastal Express Highway" },
      { t: "Bhogapuram cargo logistics park and warehouse hub (Conceptual)", s: "High-capacity automated logistics warehousing complex with loading bays and solar panel rooftops (Conceptual)", l: "Aviation Logistics Park" },
      { t: "Bhogapuram passenger concourse interior with natural light (Conceptual)", s: "Spacious sunlit departure hall with high ceilings, indoor palm trees, check-in kiosks and flight info screens (Conceptual)", l: "Terminal Concourse" },
      { t: "Bhogapuram solar farm powering green airport operations (Conceptual)", s: "Vast field of tilted photovoltaic solar panels installed alongside airport boundary generating clean power", l: "Green Airport Solar Farm" },
      { t: "Multi-modal transport interchange at Bhogapuram (Conceptual)", s: "Integrated transit hub connecting airport terminal with high-speed bus transit bays and passenger drop-off loops", l: "Airport Transit Interchange" },
      { t: "Aircraft maintenance repair overhaul MRO hangar (Conceptual)", s: "Massive open-span aircraft hangar designed for widebody commercial jets with engineering equipment", l: "Aviation Maintenance Hub" },
      { t: "Aerial masterplan view of Bhogapuram greenfield airport (Conceptual)", s: "Expansive layout showing terminal buildings, dual parallel runways, taxiways and surrounding green buffer zone", l: "Bhogapuram Masterplan" }
    ],
    kw_en: ["bhogapuram", "airport", "international airport", "infrastructure", "construction", "runway", "conceptual", "vizianagaram"],
    kw_te: ["భోగాపురం", "విమానాశ్రయం", "ఎయిర్‌పోర్ట్", "రన్‌వే", "మౌలిక సదుపాయాలు", "నిర్మాణం", "విజయనగరం"]
  },
  {
    sub: "hyderabad-urban-landmarks",
    topic: "places",
    kind: "place" as const,
    locations: ["Hyderabad", "Telangana"],
    scenes: [
      { t: "Charminar historic monument in evening twilight with bustling market", s: "Magnificent 16th century four-minaret stone arch illuminated against indigo sky with street bazar around it", l: "Charminar Old City" },
      { t: "HITEC City cyber towers and modern glass skyscraper skyline", s: "Iconic Cyber Towers roundabout surrounded by gleaming glass tech skyscrapers and bustling flyovers at dusk", l: "HITEC City" },
      { t: "Hyderabad Metro train crossing elevated viaduct bridge", s: "Sleek red-and-silver metro rail train gliding on curved elevated concrete viaduct above busy city traffic", l: "Metro Corridor" },
      { t: "Hussain Sagar lake with monolithic Buddha statue at sunset", s: "Serene urban lake waters reflecting orange sunset with tall white granite Buddha statue on Gibraltar Rock", l: "Tank Bund" },
      { t: "Outer Ring Road ORR eight-lane expressway interchange", s: "Sweeping multi-level cloverleaf highway junction with smooth asphalt roads and landscaped center islands", l: "Hyderabad ORR" },
      { t: "Telangana Secretariat Dr BR Ambedkar building facade", s: "Stately white modern administrative building with grand domes and Ashoka pillars reflected in courtyard fountain", l: "State Secretariat" },
      { t: "Durgam Cheruvu cable-stayed suspension bridge illuminated at night", s: "Extravagant illuminated multi-strand cable bridge spanning dark waters with glowing purple and cyan lights", l: "Durgam Cheruvu" },
      { t: "Golconda Fort massive stone ramparts and royal pavilion", s: "Ancient hilltop fortress with acoustic stone arches, battlements and panoramic view of modern Hyderabad", l: "Golconda Fort" },
      { t: "Gachibowli financial district glass towers and corporate plazas", s: "Futuristic corporate tech campus plazas with glass curtain walls, reflection pools and manicured green lawns", l: "Financial District" },
      { t: "Rajiv Gandhi International Airport Shamshabad passenger terminal", s: "Vibrant international airport terminal front with vehicle ramp, landscaped canopies and glass facade", l: "RGIA Shamshabad" }
    ],
    kw_en: ["hyderabad", "charminar", "hitec city", "metro", "hussain sagar", "orr", "durgam cheruvu", "secretariat", "telangana"],
    kw_te: ["హైదరాబాద్", "చార్మినార్", "హైటెక్ సిటీ", "మెట్రో", "హుస్సేన్ సాగర్", "ఓఆర్ఆర్", "సచివాలయం", "తెలంగాణ"]
  },
  {
    sub: "amaravati-capital-region",
    topic: "places",
    kind: "place" as const,
    locations: ["Amaravati", "Andhra Pradesh"],
    scenes: [
      { t: "Amaravati Andhra Pradesh High Court building facade", s: "Distinctive modern Buddhist stupa-inspired high court complex with white stone portico and reflective pond", l: "Amaravati Justice City" },
      { t: "Amaravati Legislative Assembly interim complex", s: "Contemporary administrative government complex with manicured green lawns and state tricolor flagstaff", l: "Velagapudi Administrative City" },
      { t: "Seed access road expressway cutting through Amaravati green plains", s: "Wide six-lane blacktop arterial highway with green landscaped medians passing fertile Krishna river plains", l: "Amaravati Arterial Road" },
      { t: "Krishna river bank ghat at Amaravati historic town", s: "Ancient stone bathing steps leading down to wide flowing holy Krishna river with temple bells in background", l: "Amaravati River Ghat" },
      { t: "Amaravati government employee housing towers complex", s: "Cluster of modern multi-storey residential towers for civil servants with paved walkways and streetlights", l: "Amaravati Housing Zone" },
      { t: "E10 expressway overpass bridge construction in Amaravati", s: "Massive concrete bridge piers and precast girders being installed by heavy industrial cranes", l: "Infrastructure Corridor" },
      { t: "Amaravati historic Buddhist stupa archaeological site", s: "Ancient 2000-year-old carved limestone Buddhist stupa ruins and museum garden surrounded by greenery", l: "Archaeological Park" },
      { t: "Krishna river flood embankment protective bund road", s: "Reinforced stone-riprap river protective bund with paved road on top overlooking calm river waters", l: "Krishna River Bund" },
      { t: "Amaravati world-class university campus modern academic block", s: "Sprawling university campus with innovative sustainable architecture, solar shading and glass atriums", l: "Education City Amaravati" },
      { t: "Prakasam Barrage connecting Vijayawada and Amaravati capital region", s: "Historic road-cum-rail bridge over Krishna river with barrage gates illuminated with colorful night lights", l: "Prakasam Barrage" }
    ],
    kw_en: ["amaravati", "capital", "high court", "krishna river", "prakasam barrage", "velagapudi", "andhra pradesh"],
    kw_te: ["అమరావతి", "రాజధాని", "హైకోర్టు", "కృష్ణా నది", "ప్రకాశం బ్యారేజ్", "వెలగపూడి", "ఆంధ్రప్రదేశ్"]
  },
  {
    sub: "vijayawada-city-hub",
    topic: "places",
    kind: "place" as const,
    locations: ["Vijayawada", "NTR District", "Andhra Pradesh"],
    scenes: [
      { t: "Kanaka Durga temple on Indrakeeladri hill overlooking Krishna river", s: "Golden temple gopuram illuminated on rocky hilltop with ghat road and river bridge below", l: "Indrakeeladri Hill" },
      { t: "Benz Circle flyover intersection with smooth traffic flow", s: "Modern multi-tier elevated flyover passing through bustling commercial crossroads under clear blue sky", l: "Benz Circle" },
      { t: "Vijayawada railway junction busy platforms and footbridge", s: "Major railway hub with multiple express trains docked at platforms and passengers on footbridge", l: "Vijayawada Central Station" },
      { t: "Bhavani Island river resort tourism park in Krishna river", s: "Lush green island in the middle of wide river with wooden boardwalks, speedboats and palm trees", l: "Bhavani Island" },
      { t: "Gannavaram international airport terminal exterior", s: "Modern boutique airport terminal building with glass entrance canopy, passenger drop-off lanes and gardens", l: "Vijayawada Airport Gannavaram" },
      { t: "Bandar road commercial high-street shopping boulevard", s: "Vibrant city avenue lined with major commercial stores, neon signs, automobiles and evening shoppers", l: "MG Road Bandar Road" },
      { t: "Undavalli monolithic four-storey rock-cut cave temple", s: "Ancient 7th century sandstone rock-cut cave facade with sculpted pillars and lush green hillside surroundings", l: "Undavalli Caves" },
      { t: "Autonagar industrial manufacturing and automobile repair zone", s: "Sprawling industrial estate with transport hubs, engineering machine shops and heavy vehicle depots", l: "Jawahar Autonagar" },
      { t: "Kondapalli fort scenic ruins on forested hill ridge", s: "Historic hill fortress stone watchtowers and battlements overlooking scenic green valley plains", l: "Kondapalli Hills" },
      { t: "Krishna district collectorate complex at Chilakalapudi", s: "Traditional administrative office campus with colonial-style arches, manicured gardens and banyan trees", l: "Collectorate Complex" }
    ],
    kw_en: ["vijayawada", "kanaka durga", "indrakeeladri", "benz circle", "gannavaram", "bhavani island", "undavalli"],
    kw_te: ["విజయవాడ", "కనకదుర్గ", "ఇంద్రకీలాద్రి", "బెంజ్ సర్కిల్", "గన్నవరం", "భవాని ఐలాండ్", "ఉండవల్లి"]
  },
  {
    sub: "tirupati-spiritual-hub",
    topic: "places",
    kind: "place" as const,
    locations: ["Tirupati", "Tirumala", "Andhra Pradesh"],
    scenes: [
      { t: "Tirumala Seven Hills ghat road panoramic curves at sunset", s: "Smooth winding mountain road carved into rugged granite hills with stone safety walls and valley vistas", l: "Tirumala First Ghat Road" },
      { t: "Sri Venkateswara Swamy temple Anand Nilayam golden dome from distance", s: "Distant view of sacred temple towers rising behind hill forests under tranquil dawn light", l: "Tirumala Hills" },
      { t: "Alipiri foot-path pedestrian route stone arch entrance", s: "Grand traditional stone Gopuram arch at the base of the sacred hills with devotees beginning climb", l: "Alipiri Footpath Gate" },
      { t: "Tirupati international airport terminal with Garuda-wing roof", s: "Modern airport terminal designed in the shape of mythological Garuda wings with glass facade", l: "Tirupati International Airport" },
      { t: "Sri Padmavathi Ammavari temple at Tiruchanur", s: "Spiritual temple complex with tall stone gopuram and large sacred pushkarini stepped water tank", l: "Tiruchanur" },
      { t: "Sri City integrated industrial business city tech park", s: "Modern multi-national manufacturing plants, clean wide asphalt avenues and landscaped corporate offices", l: "Sri City Industrial Zone" },
      { t: "IIT Tirupati permanent campus modern academic complex", s: "Sustainable red-brick and concrete premier engineering university buildings in foot of Seshachalam hills", l: "Yerpedu Campus" },
      { t: "Chandragiri historic fort and Raja Mahal palace architecture", s: "Three-storey Vijayanagara royal palace building constructed of stone, brick and lime plaster in manicured park", l: "Chandragiri Fort" },
      { t: "Kapila Theertham sacred waterfall and temple tank", s: "Mountain stream cascading down sheer granite rock face into ancient stepped stone temple pond", l: "Kapila Theertham" },
      { t: "Tirupati central railway station renovated facade", s: "Grand station entrance designed with traditional architectural motifs and electronic train display boards", l: "Tirupati Central Station" }
    ],
    kw_en: ["tirupati", "tirumala", "alipiri", "sri city", "chandragiri", "temple", "spiritual", "andhra pradesh"],
    kw_te: ["తిరుపతి", "తిరుమల", "అలిపిరి", "శ్రీ సిటీ", "చంద్రగిరి", "దేవాలయం", "ఆధ్యాత్మికం", "ఆంధ్రప్రదేశ్"]
  },
  {
    sub: "godavari-rajahmundry-kakinada",
    topic: "places",
    kind: "place" as const,
    locations: ["Rajahmundry", "Kakinada", "East Godavari", "West Godavari"],
    scenes: [
      { t: "Godavari fourth rail-cum-road arch bridge across wide river", s: "Magnificent bowstring arch bridge spanning over the vast waters of sacred Godavari river at sunrise", l: "Godavari River Bridge" },
      { t: "Pushkar Ghat on Godavari river in Rajahmundry with devotees", s: "Vast stone bathing ghat steps on the river bank with morning mist rising from tranquil water", l: "Pushkar Ghat Rajahmundry" },
      { t: "Kakinada deep water commercial sea port and oil jetty", s: "Large cargo container vessels and liquid oil tankers docked at industrial deepwater berths", l: "Kakinada Deep Water Port" },
      { t: "Konaseema lush green coconut groves and backwater canals", s: "Serene emerald canal lined with dense coconut palms, water lilies and traditional country boats", l: "Konaseema Delta" },
      { t: "Dhavaleswaram Sir Arthur Cotton barrage with water gushing through sluices", s: "Historic irrigation barrage with series of open regulator gates releasing foaming water into canal", l: "Cotton Barrage Dhavaleswaram" },
      { t: "Hope Island natural sand spit barrier off Kakinada coast", s: "Curving natural sand spit peninsula protecting harbor waters from rough open sea under sunny sky", l: "Hope Island Coast" },
      { t: "Coringa mangrove wildlife sanctuary wooden boardwalk through swamp", s: "Elevated timber walking bridge winding through dense saltwater mangrove forest and creek channels", l: "Coringa Mangroves" },
      { t: "Papi Hills Papikondalu gorge river cruise between towering mountains", s: "Tourist passenger boat sailing through narrow dramatic forested mountain gorge of Godavari river", l: "Papikondalu River Gorge" },
      { t: "Kakinada Smart City beachfront promenade and park", s: "Modern beachfront walking path with colorful sculptures, solar street lights and park benches", l: "Kakinada Beach Promenade" },
      { t: "Historic Havelock railway bridge stone piers standing in Godavari", s: "Stone masonry piers of iconic decommissioned 19th century railway bridge spanning the wide river", l: "Old Godavari Bridge" }
    ],
    kw_en: ["rajahmundry", "kakinada", "godavari", "konaseema", "cotton barrage", "papikondalu", "coringa"],
    kw_te: ["రాజమండ్రి", "కాకినాడ", "గోదావరి", "కోనసీమ", "కాటన్ బ్యారేజ్", "పాపికొండలు", "కోరింగ"]
  },
  {
    sub: "warangal-karimnagar-telangana",
    topic: "places",
    kind: "place" as const,
    locations: ["Warangal", "Karimnagar", "Khammam", "Nizamabad", "Telangana"],
    scenes: [
      { t: "Kakatiya Thousand Pillar Temple carved granite architecture", s: "Star-shaped 12th century stone temple with richly carved black granite pillars and Nandi sculpture", l: "Hanamkonda Temple" },
      { t: "Warangal Fort historic stone Kakatiya Thoranam gateway arch", s: "Iconic ornate stone arch gateway standing proudly amidst green archaeological lawns under clear sky", l: "Warangal Fort Grounds" },
      { t: "Lower Manair Dam reservoir and spillway gates at Karimnagar", s: "Massive concrete gravity dam with gushing white water discharging down spillway into river channel", l: "Lower Manair Dam" },
      { t: "Karimnagar cable bridge across Manair river illuminated at night", s: "Modern multi-cable suspension bridge glowing with festive dynamic RGB LED lighting over calm water", l: "Manair River Bridge" },
      { t: "Ramappa Temple UNESCO World Heritage site sandstone carvings", s: "Magnificent ancient temple with floating brick shikara and intricate bracket dancer sculptures", l: "Palampet Ramappa" },
      { t: "Kaleshwaram Lift Irrigation Project Medigadda barrage complex", s: "Gigantic multi-gate concrete barrage across Godavari river with colossal pump houses on river bank", l: "Medigadda Barrage" },
      { t: "Khammam Fort on Stambhadri hill overlooking modern city", s: "Historic rock-fort ramparts and circular stone bastions perched atop monolithic granite hill", l: "Khammam Fort Hill" },
      { t: "Nizamabad historic Ashok Sagar lake and rock garden", s: "Scenic freshwater lake with illuminated water fountains, octagonal gazebo and landscaped boulder park", l: "Ashok Sagar" },
      { t: "Singareni coal open cast mine heavy dumpers and dragline shovels", s: "Massive open-pit coal mining excavators loading gigantic 100-ton dumper trucks on terraced dirt roads", l: "Godavarikhani Mining Zone" },
      { t: "NTPC Ramagundam floating solar power plant on water reservoir", s: "Thousands of blue photovoltaic solar panels floating on vast water reservoir surface under sun", l: "Ramagundam Floating Solar Hub" }
    ],
    kw_en: ["warangal", "karimnagar", "ramappa", "kaleshwaram", "kakatiya", "khammam", "nizamabad", "telangana"],
    kw_te: ["వరంగల్", "కరీంనగర్", "రామప్ప", "కాళేశ్వరం", "కాకతీయ", "ఖమ్మం", "నిజామాబాద్", "తెలంగాణ"]
  },
  {
    sub: "rayalaseema-kurnool-kadapa-anantapur",
    topic: "places",
    kind: "place" as const,
    locations: ["Kurnool", "Kadapa", "Anantapur", "Andhra Pradesh"],
    scenes: [
      { t: "Konda Reddy Buruju historic fortress tower in Kurnool center", s: "Iconic circular stone fort bastion tower standing tall at central city traffic circle under bright blue sky", l: "Kurnool City Center" },
      { t: "Gandikota Grand Canyon gorge of Penna river from cliff edge", s: "Dramatic deep red sandstone canyon with Penna river winding far below between towering rocky cliffs", l: "Gandikota Gorge" },
      { t: "Orvakal Rock Garden ancient natural silica boulder formations", s: "Surreal natural quartz and silica rock formations surrounding a tranquil lake with wooden walkways", l: "Orvakal Rock Garden" },
      { t: "Belum Caves subterranean limestone cavern with stalactites", s: "Illuminated underground limestone cave path with mysterious mineral formations and high vaulted ceilings", l: "Belum Caves" },
      { t: "Ultra Mega Solar Park in Kurnool vast sea of solar panels", s: "Endless rows of gleaming blue solar photovoltaic panels stretching across flat plateau to the horizon", l: "Kurnool Solar Park" },
      { t: "Lepakshi Veerabhadra temple monolithic Nandi bull sculpture", s: "Colossal monolithic granite Nandi bull statue intricately carved with bells and necklaces", l: "Lepakshi Temple Complex" },
      { t: "Tungabhadra river barrage and canal headworks at Kurnool", s: "Concrete irrigation barrage with gushing water supplying Rayalaseema agricultural canal network", l: "Tungabhadra River" },
      { t: "Srisailam dam hydro-electric power station between steep gorge hills", s: "Massive concrete dam holding back deep turquoise reservoir waters framed by Nallamala forest hills", l: "Srisailam Gorge" },
      { t: "YSR Kadapa airport new passenger terminal and apron", s: "Compact modern regional airport terminal building with ATR turboprop aircraft on tarmac apron", l: "Kadapa Airport" },
      { t: "Anantapur wind turbine farm along hill ridges", s: "Giant white wind turbines spinning gracefully along rolling arid mountain ridges under golden sunset", l: "Anantapur Wind Farm" }
    ],
    kw_en: ["kurnool", "kadapa", "anantapur", "gandikota", "belum caves", "srisailam", "lepakshi", "rayalaseema"],
    kw_te: ["కర్నూలు", "కడప", "అనంతపురం", "గండికోట", "బెలూం గుహలు", "శ్రీశైలం", "లేపాక్షి", "రాయలసీమ"]
  },
  {
    sub: "uttarandhra-srikakulam-vizianagaram",
    topic: "places",
    kind: "place" as const,
    locations: ["Srikakulam", "Vizianagaram", "Andhra Pradesh"],
    scenes: [
      { t: "Arasavalli Sun God Surya Deva temple gopuram architecture", s: "Ancient sacred sun temple with stone carved chariot wheels and gopuram catching first rays of dawn", l: "Arasavalli Srikakulam" },
      { t: "Vizianagaram historic fort entrance with majestic clock tower", s: "Gajamathi fort gate with British colonial architecture clock tower and stone moats in morning light", l: "Vizianagaram Fort" },
      { t: "Kalingapatnam historic lighthouse and beach where Vamsadhara river joins sea", s: "Red-and-white stone lighthouse overlooking vast sand dunes and roaring blue ocean waves", l: "Kalingapatnam Coast" },
      { t: "Vamsadhara river barrage and irrigation project canals at Gotta", s: "Long multi-sluice barrage regulating river water into green agricultural canals in North Andhra", l: "Gotta Barrage" },
      { t: "Salihundam ancient Buddhist hill monastery ruins with stupas", s: "Circular brick stupas and stone vihara foundations perched atop green hilltop overlooking river", l: "Salihundam Heritage Site" },
      { t: "Nagavali river road bridge connecting Srikakulam town", s: "Long multi-span concrete bridge spanning wide sandy riverbed with water flowing towards coast", l: "Nagavali Bridge" },
      { t: "Bobbili historic fort and battle memorial monument", s: "Heritage stone fort palace building surrounded by ancient cannons and royal durbar courtyards", l: "Bobbili Fort" },
      { t: "Mukhalingam ancient 8th century stone temple ornate sculptures", s: "Exquisitely carved red sandstone temple tower with deities and floral motifs in tranquil village", l: "Mukhalingam Complex" },
      { t: "Baruva beach scenic sand bar and coconut plantation coastline", s: "Pristine white sand beach where casuarina and coconut trees sway in ocean breeze", l: "Baruva Beach" },
      { t: "Cashew processing and agro-industrial clusters of Palasa", s: "Clean factory unit with workers grading premium whole cashew nuts on conveyor sorting tables", l: "Palasa Industrial Cluster" }
    ],
    kw_en: ["srikakulam", "vizianagaram", "arasavalli", "kalingapatnam", "vamsadhara", "uttarandhra", "bobbili"],
    kw_te: ["శ్రీకాకుళం", "విజయనగరం", "అరసవల్లి", "కళింగపట్నం", "వంశధార", "ఉత్తరాంధ్ర", "బొబ్బిలి"]
  }
];

// ═══════════════════════════════════════════════════════════════════
// 4. Combination Scenes, No Real Leaders (100 specs) - Prefix: SCN-CMB
// ═══════════════════════════════════════════════════════════════════
const combinationSubcategories = [
  {
    sub: "farmers-irrigation-canals",
    topic: "agriculture",
    kind: "topic" as const,
    locations: ["Godavari", "Krishna", "Tungabhadra", "Nagarjuna Sagar"],
    scenes: [
      { t: "Farmers inspecting flowing water at concrete irrigation canal gate", s: "Generic Indian farmers in cotton headwraps standing along paved canal bank as fresh irrigation water rushes through regulator sluice into paddy fields", l: "Irrigation Canal Network" },
      { t: "Lush green paddy fields with farmer operating electric water pump", s: "Clear stream of water gushing from pump pipe into mud furrows nourishing emerald rice saplings under sunny sky", l: "Agricultural Farmland" },
      { t: "Farmer family harvesting watermelons along river bed", s: "Generic rural family gathering ripe green striped watermelons onto wooden bullock cart on sandy river bank", l: "Riverbed Cultivation" },
      { t: "Modern canal siphon bridge passing over natural drainage creek", s: "Engineered concrete aqueduct carrying irrigation canal water high above a green valley with farmers walking along service road", l: "Canal Aqueduct" },
      { t: "Farmers monitoring drip irrigation manifold in vegetable polyhouse", s: "Greenhouse nursery with rows of capsicum and tomato plants nourished by automatic black drip tubing with digital pressure gauge", l: "Horticulture Polyhouse" },
      { t: "Check dam water reservoir with farmers filling sprayers", s: "Small stone check dam holding back crystal rainwater in rural watershed with green tree canopy", l: "Watershed Check Dam" },
      { t: "Community canal desilting work by village self-help group", s: "Generic villagers working together with shovels clearing silt and weeds from village feeder channel to restore water flow", l: "Village Feeder Canal" },
      { t: "Sprinkler irrigation system creating misty rainbow over groundnut field", s: "Rotating brass sprinkler nozzles spraying fine droplets over flowering peanut crop in morning sunlight", l: "Groundnut Farmland" },
      { t: "Farmer examining moisture sensor in smart agriculture plot", s: "Generic farmer holding electronic soil sensor connected to smartphone beside drip-irrigated chilli crop", l: "Smart Farming Demonstration" },
      { t: "Lift irrigation pipeline discharge chamber filling canal", s: "Massive twin steel water pipes discharging foaming river water into major concrete canal branch", l: "Lift Irrigation Headworks" }
    ],
    kw_en: ["irrigation", "canal", "water", "farmers", "paddy", "check dam", "polyhouse", "sprinklers"],
    kw_te: ["సాగునీరు", "కాలువ", "రైతులు", "వరి పంట", "చెరువు", "డ్రిప్ ఇరిగేషన్", "నీటిపారుదల"]
  },
  {
    sub: "fishermen-coastal-village-boats",
    topic: "marine-life",
    kind: "topic" as const,
    locations: ["Visakhapatnam", "Kakinada", "Bapatla", "Nellore Coast"],
    scenes: [
      { t: "Fishermen launching wooden catamaran into morning ocean surf", s: "Group of generic fishermen in shorts pushing colourful wooden country boat into breaking white waves at sunrise", l: "Coastal Beach Village" },
      { t: "Coastal village beachfront with rows of traditional boats and nets", s: "Scenic sandy shoreline with wooden fishing boats pulled onto dry sand, colorful drying nets and coconut palms swaying in breeze", l: "Fishing Village Shore" },
      { t: "Fishermen hauling in heavy shore seine net from breaking waves", s: "Line of generic coastal workers pulling long rope of giant fishing net onto golden sand beach", l: "Coastline Seashore" },
      { t: "Morning fish auction on harbor jetty with auctioneer and buyers", s: "Lively harbor gathering around fresh piles of silver fish and king prawns with auctioneer writing on slate", l: "Harbour Auction Shed" },
      { t: "Fisher family mending sails on sunny village beach", s: "Generic coastal family stitching durable white canvas boat sail spread across clean sand", l: "Fishing Settlement" },
      { t: "Coastal lighthouse beam illuminating fishing boats anchored in bay", s: "Night scene with lighthouse lamp shining across calm dark sea onto gentle silhouettes of anchored wooden boats", l: "Harbour Bay at Night" },
      { t: "Fishermen loading ice blocks into boat cold hold before voyage", s: "Crushed white ice being shoveled into wooden boat storage hold at harbor ice factory wharf", l: "Harbour Ice Wharf" },
      { t: "Modern fiberglass mechanised boat sailing through estuary mouth", s: "Sleek blue motor boat navigating through tranquil coastal river mouth into open Bay of Bengal", l: "Coastal Estuary" },
      { t: "Coastal village school overlooking sea with children playing", s: "Whitewashed seaside elementary school with students playing on sand under shade of casuarina trees", l: "Coastal Village School" },
      { t: "Fishermen receiving satellite weather radio alert devices", s: "Harbour fisheries officer demonstrating waterproof GPS and cyclone alert transceiver to generic boat captains", l: "Fisheries Department Post" }
    ],
    kw_en: ["coastal village", "boats", "fishermen", "beach", "nets", "fish auction", "harbour", "sea coast"],
    kw_te: ["తీరప్రాంతం", "మత్స్యకారులు", "పడవలు", "చేపల వేట", "వలలు", "హార్బర్", "సముద్రం"]
  },
  {
    sub: "students-laptops-smart-classroom",
    topic: "education",
    kind: "topic" as const,
    locations: ["Hyderabad", "Visakhapatnam", "Vijayawada", "Tirupati"],
    scenes: [
      { t: "Students in uniforms coding on laptops in bright computer lab", s: "Diverse Indian high school students focused on modern slim laptops typing code in clean, air-conditioned school lab", l: "Digital Classroom Lab" },
      { t: "Teacher demonstrating interactive physics 3D model on projection screen", s: "Instructor using digital pointer explaining planetary orbits on high-definition wall projection to attentive students", l: "Smart Science Classroom" },
      { t: "University students working together on robotics chassis in maker space", s: "College engineering team assembling metal chassis, sensors and wheels with hand tools and laptops nearby", l: "University Maker Lab" },
      { t: "Rural school students reading digital e-books in mobile library van", s: "Children seated inside air-conditioned bus converted into mobile digital library with tablet stations", l: "Mobile Digital Library" },
      { t: "Student hackathon coding marathon overnight workspace", s: "Excited tech students with coffee mugs and laptops surrounded by sticky notes and whiteboards during tech challenge", l: "Hackathon Arena" },
      { t: "High school language lab students wearing headsets at computer booths", s: "Students practicing bilingual pronunciation with microphone headsets at individual partitioned study booths", l: "Language Learning Lab" },
      { t: "School science exhibition student demonstrating solar water purifier", s: "Young student proudly standing behind table explaining working eco-friendly science model to visitors", l: "School Science Fair" },
      { t: "College campus open-air amphitheater study circle", s: "University students sitting on stone steps of shaded garden amphitheater discussing assignment notes", l: "Campus Amphitheater" },
      { t: "Vocational training institute students learning drone assembly", s: "Students in blue workshop aprons calibrating quadcopter drone motors and flight controllers on workbenches", l: "Skill Development Center" },
      { t: "Digital library reading hall with students and glowing computer monitors", s: "Silent high-ceilinged modern library with rows of students studying with laptops and reference books", l: "State Central Library" }
    ],
    kw_en: ["smart classroom", "students", "laptops", "digital education", "coding", "hackathon", "computer lab", "science fair"],
    kw_te: ["స్మార్ట్ క్లాస్‌రూమ్", "విద్యార్థులు", "ల్యాప్‌టాప్‌లు", "డిజిటల్ విద్య", "కంప్యూటర్ ల్యాబ్", "సైన్స్ ఫెయిర్", "చదువు"]
  },
  {
    sub: "police-school-children-road-safety",
    topic: "civic-safety",
    kind: "topic" as const,
    locations: ["Visakhapatnam", "Vijayawada", "Hyderabad", "Guntur"],
    scenes: [
      { t: "Traffic police officer helping school children cross zebra crossing", s: "Friendly traffic constable in white and khaki uniform holding stop sign as line of smiling school kids cross zebra line safely", l: "School Zone Crossing" },
      { t: "Police officer conducting road safety helmet awareness in school assembly", s: "Police officer holding full-face helmet explaining safety rules to attentive school children seated in school courtyard", l: "School Assembly Ground" },
      { t: "Police vehicle safety demonstration for young students", s: "Children eagerly looking inside patrol vehicle while friendly police officer shows wireless walkie-talkie radio", l: "Police Outreach Day" },
      { t: "Student road safety cadet junior police brigade drill", s: "School students wearing reflective orange junior traffic warden sashes marching in formation on playground", l: "Traffic Training Park" },
      { t: "Mock traffic signal park with children riding bicycles obeying lights", s: "Miniature traffic park with scaled-down traffic lights, zebra markings and children learning driving rules on cycles", l: "Children Traffic Park" },
      { t: "Community safety awareness drawing competition by police", s: "School children sitting on floor with crayons drawing road safety and anti-pollution posters with police officers judging", l: "Community Police Hall" },
      { t: "School bus safety inspection by transport and police team", s: "Inspectors checking yellow school bus speed governors, emergency exit doors and fire extinguishers in yard", l: "RTA Inspection Depot" },
      { t: "Police cyber safety workshop for high school teenagers", s: "Cybercrime cell officer displaying slide deck on internet safety and password protection to teenage students", l: "School Auditorium" },
      { t: "Children presenting thank you greeting cards to traffic police at junction", s: "Little school children handing colorful handmade thank-you cards to smiling on-duty traffic police officer", l: "City Traffic Post" },
      { t: "Pedestrian safety campaign human chain at major intersection", s: "Students holding reflective green 'Stop for Pedestrians' placards along sidewalk with police coordinators", l: "City Junction Boulevard" }
    ],
    kw_en: ["road safety", "traffic police", "school children", "zebra crossing", "awareness", "pedestrian", "helmet"],
    kw_te: ["రోడ్డు భద్రత", "ట్రాఫిక్ పోలీసులు", "పాఠశాల పిల్లలు", "జీబ్రా క్రాసింగ్", "అవగాహన", "ట్రాఫిక్ నిబంధనలు"]
  },
  {
    sub: "women-entrepreneurs-local-market",
    topic: "business",
    kind: "topic" as const,
    locations: ["Vijayawada", "Hyderabad", "Visakhapatnam", "Tirupati"],
    scenes: [
      { t: "Women self-help group DWCRA exhibition stall with handmade products", s: "Generic confident women entrepreneurs in sarees showcasing handmade pickles, snacks and organic textiles at brightly lit trade stall", l: "DWCRA Bazar Exhibition" },
      { t: "Women micro-enterprise group packaging organic spices", s: "Team of women wearing hygienic aprons and hairnets weighing, sealing and labeling turmeric powder bags in clean workshop", l: "Village Agro Processing Unit" },
      { t: "Women entrepreneurs learning digital accounting on smartphones", s: "Group of women sitting in training room practicing digital billing and UPI payments on smartphones with instructor", l: "Rural Enterprise Training Hub" },
      { t: "Millets processing unit operated by women cooperative", s: "Women running modern stainless steel dehusking and flour milling machines for ragi and jowar grains", l: "Millet Processing Center" },
      { t: "Women boutique owners designing embroidered dresses", s: "Tailors and designers working on Maggam embroidery frames with colorful silk threads and beads in small boutique", l: "Fashion Embroidery Studio" },
      { t: "Organic honey bottling unit managed by tribal women cooperative", s: "Clear golden wild honey being poured into glass jars with tamper-proof seals by cooperative members", l: "Girijan Honey Unit" },
      { t: "Handmade soap and eco-friendly cosmetics packing", s: "Artisanal soap bars made with neem, turmeric and cold-pressed coconut oil wrapped in recycled craft paper", l: "Eco-Products Workshop" },
      { t: "Solar dryer dried fruit snacks processing by women group", s: "Glass-topped solar greenhouse dryer containing sliced mangoes and bananas being monitored by women workers", l: "Solar Processing Center" },
      { t: "Women cooperative bank counter with rural depositors", s: "Clean village microfinance branch counter where women manage passbooks and savings accounts", l: "Stree Nidhi Bank Branch" },
      { t: "Food truck operated by women self-help group serving healthy millets", s: "Clean modern mobile food van with menu board serving hot ragi dosas and millet idlis to office crowd", l: "Urban Food Truck Plaza" }
    ],
    kw_en: ["women entrepreneurs", "dwcra", "self help group", "micro enterprise", "millets", "organic", "cooperative", "business"],
    kw_te: ["మహిళా సాధికారత", "డ్వాక్రా", "స్వయం సహాయక బృందాలు", "సూక్ష్మ వ్యాపారాలు", "మిల్లెట్స్", "మహిళా వ్యాపారాలు"]
  },
  {
    sub: "citizens-metro-station-urban",
    topic: "transport",
    kind: "topic" as const,
    locations: ["Hyderabad", "Visakhapatnam"],
    scenes: [
      { t: "Commuters boarding modern metro rail train on elevated glass platform", s: "Generic urban citizens in professional attire stepping through automatic sliding doors of clean air-conditioned metro train", l: "Elevated Metro Station" },
      { t: "Metro station concourse with automatic fare collection smart gates", s: "Commuters tapping contactless smart cards and QR mobile passes at automated turnstiles in bright modern station", l: "Metro Concourse Hall" },
      { t: "Passengers riding high-speed escalator inside multi-level transit station", s: "Sleek metallic escalator carrying commuters between concourse and platform level under modern geometric ceiling lights", l: "Metro Interchange Station" },
      { t: "Electric feeder bus arriving at metro station drop-off bay", s: "Green zero-emission electric bus picking up passengers at sheltered stop directly beneath elevated metro viaduct", l: "Metro Feeder Bus Bay" },
      { t: "Bicycle sharing rental dock at metro station exit", s: "Row of bright public rental smart bicycles docked in automated solar-powered station with commuter scanning QR code", l: "Metro Bike Share Station" },
      { t: "Panoramic view of city traffic flowing beneath elevated metro viaduct", s: "Modern multi-lane street with cars, buses and trees running smoothly under sleek concrete metro bridge piers", l: "City Arterial Corridor" },
      { t: "Metro passenger digital route display map screen and announcements", s: "Illuminated dynamic LED route map showing station stops with passengers waiting on platform benches", l: "Metro Platform Screen" },
      { t: "Accessible tactile paving and elevator for differently-abled commuters", s: "Modern glass elevator with braille buttons and yellow tactile ground guidance tiles inside clean metro station", l: "Accessible Metro Concourse" },
      { t: "Security baggage X-ray scanner check at metro station entrance", s: "Efficient security check with metal detector door frame and luggage scanning conveyor operated by security staff", l: "Metro Security Gate" },
      { t: "Evening rush hour crowd walking along illuminated skywalk bridge", s: "Covered pedestrian foot-over-bridge connecting metro station directly to adjacent office towers and shopping mall", l: "Pedestrian Skywalk" }
    ],
    kw_en: ["metro", "metro rail", "commuters", "metro station", "smart card", "urban transit", "public transport"],
    kw_te: ["మెట్రో", "మెట్రో రైలు", "ప్రయాణికులు", "మెట్రో స్టేషన్", "పట్టణ రవాణా", "పబ్లిక్ ట్రాన్స్‌పోర్ట్"]
  },
  {
    sub: "passengers-airport-terminal-travel",
    topic: "transport",
    kind: "topic" as const,
    locations: ["Hyderabad RGIA", "Visakhapatnam Airport", "Vijayawada Airport", "Tirupati Airport"],
    scenes: [
      { t: "Passengers walking through spacious airport departure terminal", s: "Air travelers with wheeled trolley luggage walking past airline check-in counters beneath soaring glass and steel ceilings", l: "Airport Departures Concourse" },
      { t: "Passengers using automated DigiYatra facial recognition biometric e-gate", s: "Traveler standing before contactless camera verification gate as green boarding pass indicator unlocks door", l: "DigiYatra Departure Gate" },
      { t: "Commercial jetliner taxiing past modern glass terminal boarding gates", s: "Large passenger aircraft connected to aerobridge on tarmac with ground service vehicles bustling in morning light", l: "Airport Apron Tarmac" },
      { t: "Airport baggage claim carousel with luggage arriving", s: "Smooth circulating luggage conveyor belt in arrivals hall with passengers waiting for suitcases under bright recessed lighting", l: "Baggage Claim Hall" },
      { t: "Flight information display system FIDS screens in terminal", s: "Large high-contrast digital flight status screens showing on-time departures to domestic and international destinations", l: "Terminal Information Hub" },
      { t: "Duty-free and local handicrafts retail promenade in airport", s: "Air travelers browsing premium boutique stores and traditional Andhra handloom souvenir shops in departure lounge", l: "Airport Retail Lounge" },
      { t: "Air traffic controllers monitoring radar screens in glass ATC tower", s: "Air traffic controller silhouettes working before dual radar approach monitors overlooking active runways", l: "ATC Tower Cab" },
      { t: "Ground service crew refueling airliner and loading cargo containers", s: "Airport ground personnel in high-visibility vests operating conveyor loaders and fuel hydrant trucks beside jet", l: "Aircraft Parking Bay" },
      { t: "Airport security CISF personnel at automated security screening lane", s: "Modern tray return body scanner lane with security officers ensuring safe and rapid passenger clearance", l: "Airport Security Enclosure" },
      { t: "Panoramic sunset view of airport runways from observation lounge", s: "Glass window lounge view of lit runway edge lights glowing against orange sunset sky as aircraft takes off", l: "Airport Departure Lounge" }
    ],
    kw_en: ["airport", "flight", "passengers", "digiyatra", "terminal", "aircraft", "travel", "aviation"],
    kw_te: ["విమానాశ్రయం", "విమానం", "ప్రయాణికులు", "డిజియాత్ర", "టెర్మినల్", "ఎయిర్‌పోర్ట్", "విమాన ప్రయాణం"]
  },
  {
    sub: "workers-construction-infrastructure",
    topic: "infrastructure",
    kind: "topic" as const,
    locations: ["Amaravati", "Visakhapatnam", "Hyderabad", "Bhogapuram", "National Highway"],
    scenes: [
      { t: "Construction engineers with blueprints at modern high-rise building site", s: "Engineers in yellow hard hats and safety vests reviewing technical architectural drawings before towering concrete structure", l: "Urban Construction Site" },
      { t: "Tower cranes lifting steel reinforcement cage on mega infrastructure project", s: "Giant yellow crane lifting steel rebar beams against blue sky with construction scaffolding in background", l: "Bridge Construction Site" },
      { t: "Heavy road paver machine laying smooth asphalt on multi-lane expressway", s: "Industrial asphalt spreader and heavy steel road roller compacting hot blacktop on newly laid highway", l: "National Highway Construction" },
      { t: "Tunnel boring machine TBM breakthrough on irrigation water canal tunnel", s: "Massive circular cutterhead of tunnel boring machine emerging through rock face in deep underground project", l: "Irrigation Tunnel Site" },
      { t: "Industrial welders in protective face shields joining pipeline joints", s: "Bright sparks flying as skilled welders weld large diameter steel water pipeline with safety guards", l: "Pipeline Infrastructure Project" },
      { t: "Flyover precast concrete girder launch over busy road intersection", s: "Specialized hydraulic launching gantry placing heavy precast concrete segment onto bridge pillars", l: "Flyover Construction Zone" },
      { t: "Solar panel mounting frame assembly on utility-scale solar farm", s: "Technicians in safety harnesses bolting galvanized steel mounting racks across vast open terrain", l: "Solar Power Project Site" },
      { t: "Automated concrete batching plant with mixer trucks lined up", s: "Modern industrial concrete mixing towers filling heavy transit mixer trucks at high-capacity batch plant", l: "Concrete Batching Plant" },
      { t: "Geotechnical survey team taking core soil samples with drill rig", s: "Engineers examining extracted rock soil core samples laid out in wooden test boxes beside hydraulic drilling rig", l: "Geotechnical Survey Site" },
      { t: "Industrial safety inspection and safety briefing before work shift", s: "Team of construction workers in full personal protective equipment PPE listening to safety officer toolbox talk", l: "Infrastructure Project Yard" }
    ],
    kw_en: ["construction", "infrastructure", "workers", "highway", "flyover", "engineers", "tower crane", "development"],
    kw_te: ["నిర్మాణం", "మౌలిక సదుపాయాలు", "కార్మికులు", "హైవే", "ఫ్లైఓవర్", "ఇంజనీర్లు", "అభివృద్ధి"]
  },
  {
    sub: "healthcare-community-camp",
    topic: "health",
    kind: "topic" as const,
    locations: ["Guntur", "Warangal", "Srikakulam", "Anantapur"],
    scenes: [
      { t: "Free rural mega health camp registration and vitals checkup desk", s: "Villagers waiting in organized queue under shaded canopy as nursing students record blood pressure, sugar and height", l: "Community Health Camp" },
      { t: "Mobile eye screening van conducting cataract tests in village", s: "Ophthalmologist examining elderly villager eyes using portable digital slit lamp inside specialized health bus", l: "Mobile Eye Clinic" },
      { t: "Child immunisation vaccination drive at village primary school", s: "Gentle healthcare worker preparing vaccine syringe from cold-chain icebox while mother comforts toddler", l: "Village Immunisation Center" },
      { t: "Dental awareness camp with dentists teaching toothbrushing technique", s: "Dentist using large tooth model and oversized brush showing proper brushing technique to enthusiastic children", l: "School Dental Camp" },
      { t: "Ayurveda and traditional herbal medicine consultation camp", s: "Ayurvedic doctor examining pulse and prescribing natural herbal powders stored in glass apothecary jars", l: "AYUSH Wellness Center" },
      { t: "Yoga and wellness morning session in public park", s: "Diverse group of citizens practicing morning Pranayama breathing exercises on green yoga mats on lawn", l: "Public City Park" },
      { t: "Mobile blood donation air-conditioned bus with donors", s: "Comfortable interior of blood collection bus with volunteers resting on recliners receiving post-donation refreshments", l: "Blood Donation Mobile Van" },
      { t: "Cancer early detection and mammography screening mobile bus", s: "Specialized clinical screening van parked outside village community hall with women waiting for consultation", l: "Preventive Health Camp" },
      { t: "Nutrition awareness camp demonstrating healthy millets and greens", s: "Dietitian displaying baskets of local leafy greens, pulses, millets and sprouts explaining balanced diet", l: "Anganwadi Center" },
      { t: "Disability aids and motorized tricycle distribution camp", s: "Beneficiaries receiving custom wheelchairs, walking calipers and battery tricycles from welfare officers", l: "Divyangjan Welfare Camp" }
    ],
    kw_en: ["health camp", "healthcare", "medical camp", "vaccination", "eye camp", "wellness", "yoga", "ayush"],
    kw_te: ["ఉచిత వైద్య శిబిరం", "వైద్యం", "ఆరోగ్యం", "కంటి వైద్యం", "టీకాలు", "యోగా", "ఆయుష్"]
  },
  {
    sub: "disaster-relief-emergency-response",
    topic: "emergency",
    kind: "topic" as const,
    locations: ["Visakhapatnam", "Kakinada", "Bapatla", "Krishna Delta"],
    scenes: [
      { t: "NDRF and SDRF rescue personnel with inflatable motorized rescue boats", s: "Trained disaster response team in orange lifejackets loading motorized rubber boats and ropes onto transport truck", l: "Disaster Response Base" },
      { t: "Cyclone storm warning high-wind radar tracking room", s: "Meteorologists in weather forecasting center analyzing satellite cloud imagery and cyclone landfall path", l: "Cyclone Warning Center" },
      { t: "Flood relief food and drinking water packet distribution", s: "Rescue volunteers handing sealed food packets and clean mineral water bottles to affected families from relief truck", l: "Flood Relief Camp" },
      { t: "Coastal cyclone shelter building with safety generators", s: "Sturdy reinforced concrete multi-purpose cyclone shelter with rooftop communications antenna and emergency lights", l: "Cyclone Shelter Bhavan" },
      { t: "Fire and emergency services water tender vehicle spraying foam", s: "Firefighters in yellow protective fire suits and helmets operating high-pressure water foam cannon in drill", l: "Fire Service Station" },
      { t: "Coast Guard hovercraft skimming over marshland and shallow water", s: "High-speed Indian Coast Guard hovercraft patrolling tidal mudflats and coastline during search exercise", l: "Coastal Patrol Station" },
      { t: "Emergency power restoration lineworkers replacing damaged electricity pole", s: "Electricity department lineworkers using crane truck erecting new concrete electricity pole after storm", l: "Power Grid Repair Site" },
      { t: "Medical first-aid tent set up in disaster relief zone", s: "Emergency triage tent with doctors treating minor injuries, administering tetanus shots and IV drips", l: "Emergency Relief Post" },
      { t: "Drinking water purification mobile filtration truck in action", s: "Water tanker with built-in reverse osmosis filtration unit dispensing clean drinking water into citizen containers", l: "Emergency Water Station" },
      { t: "Helicopter air-dropping emergency relief food packages over flooded areas", s: "Relief helicopter hovering low over floodwaters dropping water-tight ration packages near marked drop zone", l: "Aviation Relief Operation" }
    ],
    kw_en: ["disaster", "cyclone", "flood relief", "ndrf", "rescue", "emergency", "fire service", "coast guard"],
    kw_te: ["విపత్తు", "తుఫాను", "వరదలు", "సహాయక చర్యలు", "రెస్క్యూ", "ఎన్డీఆర్ఎఫ్", "రక్షణ చర్యలు"]
  }
];

// ═══════════════════════════════════════════════════════════════════
// 5. General News Topics & Backgrounds (100 specs) - Prefix: GEN-NWS
// ═══════════════════════════════════════════════════════════════════
const generalSubcategories = [
  {
    sub: "weather-climate-monsoon",
    topic: "weather",
    kind: "topic" as const,
    locations: ["Andhra Pradesh", "Telangana", "Bay of Bengal", "Hyderabad", "Visakhapatnam"],
    scenes: [
      { t: "Monsoon dark rain clouds over urban city skyline and highway", s: "Dramatic dark blue monsoon storm clouds gathering over modern city buildings with cars driving with headlights on", l: "City Highway Skyline" },
      { t: "Heavy monsoon rain pouring on green agricultural fields with puddles", s: "Torrential raindrops splashing onto lush green fields and country road with water ripples", l: "Rural Countryside" },
      { t: "Summer heatwave shimmering mirage over empty highway road", s: "Golden intense afternoon sun with thermal heat shimmer ripples rising from empty asphalt highway", l: "State Highway" },
      { t: "Winter morning dense fog and mist rolling over green hills", s: "Quiet mountain road enveloped in soft white fog with headlights cutting through morning mist", l: "Eastern Ghats Hills" },
      { t: "Cyclone storm rough sea with crashing giant ocean waves", s: "Massive dark ocean swells crashing into rocky coastal seawall with dramatic sea foam spray", l: "Coastal Seawall" },
      { t: "Weather radar satellite dish rotating at meteorological observatory", s: "Doppler weather radar dome standing atop coastal hill against dramatic cloudy sky", l: "Meteorological Observatory" },
      { t: "Rainwater harvesting percolation pit and recharge well in apartment park", s: "Clean stone-lined rainwater harvesting filtration pit collecting rooftop runoff during shower", l: "Eco-Park" },
      { t: "Lightning strikes illuminating dark thundercloud night sky", s: "Powerful forks of purple and white lightning branching across storm clouds over distant hills", l: "Night Sky Panorama" },
      { t: "Drought-hit cracked dry earth with green sapling emerging", s: "Dry parched soil with deep geometric fissure cracks and tiny resilient green leaf sprout in center", l: "Arid Plains" },
      { t: "Golden sunshine breaking through storm clouds after rain with rainbow", s: "Vibrant full-spectrum rainbow arching over green countryside and village as sun breaks through rain clouds", l: "Rural Horizon" }
    ],
    kw_en: ["weather", "monsoon", "rain", "cyclone", "heatwave", "clouds", "radar", "rainbow", "climate"],
    kw_te: ["వాతావరణం", "వర్షాలు", "తుఫాను", "ఎండలు", "రుతుపవనాలు", "మేఘాలు", "వాతావరణ శాఖ"]
  },
  {
    sub: "economy-budget-inflation",
    topic: "business",
    kind: "topic" as const,
    locations: ["Hyderabad", "Amaravati", "Mumbai", "New Delhi"],
    scenes: [
      { t: "Union and State annual budget documents briefcase on wooden desk", s: "Official leather budget document binder with state emblem and calculator beside balance sheet folders", l: "Finance Ministry Desk" },
      { t: "Stock market trading floor multi-monitor candlestick charts", s: "Professional financial analytics workstation with green and red stock ticker graphs and financial news feeds", l: "Stock Trading Room" },
      { t: "Reserve Bank of India RBI currency notes and gold bullion coins", s: "Crisp Indian rupee currency notes stacked neatly beside polished gold coin bars under studio lighting", l: "Bank Vault Counter" },
      { t: "Digital tax filing GST e-invoice portal on computer screen", s: "Clean web portal interface showing verified GST invoice filing confirmation and tax calculation charts", l: "Tax Consultancy Office" },
      { t: "Inflation price index shopping basket with essential groceries", s: "Supermarket shopping cart filled with edible oils, pulses, rice and vegetables with price tag display", l: "Retail Supermarket" },
      { t: "Commercial banking currency sorting and counting machine in action", s: "High-speed electronic cash counter processing bundles of 500-rupee notes at commercial bank cash desk", l: "Bank Main Branch" },
      { t: "Foreign direct investment FDI signing ceremony documents", s: "Corporate MOU agreement folder with blue fountain pen, globe model and financial contracts", l: "Investment Summit Hall" },
      { t: "Cryptocurrency and digital rupee blockchain network visualization", s: "Glowing futuristic digital network graphic with blockchain node connections and rupee symbol", l: "Fintech Innovation Hub" },
      { t: "Real estate construction housing market miniature architectural model", s: "Detailed miniature scale model of modern residential township under glass display in sales gallery", l: "Real Estate Gallery" },
      { t: "Micro-finance rural self-help group ledger and savings box", s: "Handwritten village savings account register with coin pouches, savings passbooks and group stamps", l: "Rural Credit Society" }
    ],
    kw_en: ["budget", "economy", "stock market", "gst", "inflation", "rupee", "bank", "finance", "business"],
    kw_te: ["బడ్జెట్", "ఆర్థిక వ్యవస్థ", "స్టాక్ మార్కెట్", "జీఎస్టీ", "ధరల పెరుగుదల", "రూపాయి", "బ్యాంకింగ్", "వ్యాపారం"]
  },
  {
    sub: "gold-silver-precious-metals",
    topic: "business",
    kind: "topic" as const,
    locations: ["Vijayawada", "Hyderabad", "Visakhapatnam", "Warangal"],
    scenes: [
      { t: "Jewellery showroom gold necklace and bangles display under spotlight", s: "Intricate 22-karat traditional bridal gold jewellery arranged on luxury red velvet display busts in secure boutique", l: "Gold Jewellery Showroom" },
      { t: "Certified 24k fine gold bullion bars and hallmark stamps", s: "Stack of 999.9 pure gold investment biscuits with certified BIS hallmark laser engraving", l: "Bullion Vault Desk" },
      { t: "Goldsmith handcrafting delicate gold filigree ornaments at workbench", s: "Master craftsman using fine tweezers, magnifying visor and micro-torch soldering delicate gold wire", l: "Goldsmith Workshop" },
      { t: "Hallmarking center technician testing gold purity with XRF spectrometer", s: "Laboratory scientist testing gold alloy composition using computerized X-ray fluorescence assay machine", l: "BIS Hallmarking Lab" },
      { t: "Traditional silver pooja lamps and silverware assortment", s: "Polished pure silver diyas, incense stands and pooja thalis shining under soft warm lighting", l: "Silver Showroom" },
      { t: "Gold rate market price digital electronic ticker board in jewelry market", s: "LED digital display board showing live 22k and 24k gold per-gram rates in rupees with date", l: "Jewellers Street Bazar" },
      { t: "Diamond ring with brilliant cut sparkle on velvet box", s: "Solitaire diamond engagement ring with multi-faceted diamond reflecting light on navy blue velvet cushion", l: "Diamond Boutique" },
      { t: "Traditional temple jewellery with ruby and emerald gemstone settings", s: "Kempu stone studded antique gold necklace depicting floral motifs and Goddess Lakshmi crest", l: "Antique Jewellery Studio" },
      { t: "Gold loan evaluation desk with electronic precision weighing scale", s: "Bank appraisal officer weighing gold bangles on micro-precision digital scale with calibration certificate", l: "Gold Loan Branch" },
      { t: "Secure bank safety locker vault with stainless steel lockers", s: "High-security bank vault room with rows of numbered stainless steel safe deposit boxes and heavy door", l: "Bank Safe Deposit Vault" }
    ],
    kw_en: ["gold", "gold rate", "jewellery", "silver", "bullion", "hallmark", "diamonds", "precious metals"],
    kw_te: ["బంగారం", "బంగారం ధరలు", "వెండి", "నగలు", "గోల్డ్ రేట్", "ఆభరణాలు", "హాల్‌మార్క్"]
  },
  {
    sub: "fuel-petrol-diesel-energy",
    topic: "business",
    kind: "topic" as const,
    locations: ["Visakhapatnam HPCL", "Hyderabad", "Vijayawada"],
    scenes: [
      { t: "Modern highway petrol pump dispensing nozzle and digital meter", s: "Fuel attendant in blue uniform holding automatic petrol nozzle beside digital fuel price display meter", l: "Highway Fuel Station" },
      { t: "Petroleum oil refinery towers and catalytic cracker at night", s: "Major industrial oil refinery with illuminated fractionating columns, pipes and safety flare stack", l: "Coastal Oil Refinery" },
      { t: "LPG cooking gas cylinder distribution warehouse depot", s: "Organized rows of red domestic LPG cylinders stored under ventilated roof with safety equipment", l: "LPG Bottling Plant" },
      { t: "Electric vehicle EV fast-charging station in urban parking plaza", s: "Modern public dual-gun DC fast charger connected to electric SUV in clean paved charging bay", l: "EV Charging Hub" },
      { t: "CNG natural gas compression station with gas dispenser", s: "Green eco-fuel CNG dispensing unit with pressure gauge filling natural gas into commercial auto", l: "CNG Gas Station" },
      { t: "Cross-country natural gas pipeline valve station in countryside", s: "Yellow pipeline control valves, pressure meters and fenced telemetry post in rural landscape", l: "Gas Pipeline Corridor" },
      { t: "High-voltage electrical power transmission grid sub-station", s: "Substation with step-up transformers, ceramic insulators and high-voltage steel transmission towers", l: "Power Grid Substation" },
      { t: "Rooftop solar photovoltaic panel installation on modern commercial building", s: "High-efficiency monocrystalline solar panels absorbing bright midday sunlight with inverter box", l: "Commercial Rooftop" },
      { t: "Windmill wind farm generating renewable green energy at sunrise", s: "Majestic row of modern wind turbines on grassy hilltops with blades catching morning breeze", l: "Wind Energy Park" },
      { t: "Thermal power station cooling towers with clean steam vapor", s: "Massive hyperbolic concrete cooling towers releasing white water vapor plumes against clear blue sky", l: "Thermal Power Complex" }
    ],
    kw_en: ["petrol", "diesel", "fuel price", "lpg", "ev charging", "power grid", "refinery", "energy", "solar"],
    kw_te: ["పెట్రోల్", "డీజిల్", "ఇంధన ధరలు", "గ్యాస్ సిలిండర్", "విద్యుత్", "రిఫైనరీ", "సోలార్ పవర్"]
  },
  {
    sub: "cricket-sports-stadium",
    topic: "sports",
    kind: "topic" as const,
    locations: ["Visakhapatnam ACA-VDCA", "Hyderabad Rajiv Gandhi Stadium", "Vijayawada"],
    scenes: [
      { t: "International cricket stadium illuminated under towering floodlights", s: "Panoramic view of world-class circular cricket stadium with lush green outfield under evening match lights", l: "ACA-VDCA Cricket Stadium" },
      { t: "Cricket pitch with wooden wickets stumps and red leather ball", s: "Close-up of freshly prepared cricket 22-yard turf pitch with wooden stumps, bails and polished leather ball", l: "Cricket Pitch" },
      { t: "Cricket batsman stance facing bowler with willow bat", s: "Generic cricket player in white protective pads and helmet taking batting stance on turf pitch", l: "Cricket Ground" },
      { t: "Cheering sports crowd in stadium stands waving flags from rear", s: "Packed energetic stadium spectator stands with joyful fans cheering under stadium floodlight glow", l: "Stadium Stands" },
      { t: "Indoor badminton academy court with wooden floor and shuttlecock", s: "Synthetic green court with white boundary lines, net and feather shuttlecock resting on floor", l: "Badminton Academy" },
      { t: "Olympic swimming pool with lane dividers and starting blocks", s: "Crystal blue 50-meter competition swimming pool with floating wave-breaker lane ropes and diving platforms", l: "Aquatic Sports Complex" },
      { t: "Synthetic eight-lane athletic running track with finish line", s: "Pristine terracotta-red rubber running track with white numbered lane markings and green infield", l: "Athletic Stadium" },
      { t: "Volleyball team in action leaping at net during tournament", s: "Action silhouette of volleyball player spiking ball over net with teammates ready on indoor court", l: "Indoor Sports Arena" },
      { t: "Kabaddi mat arena with chalk boundary lines and trophy", s: "Professional synthetic kabaddi competition mat with bonus lines, mid-line and championship trophy", l: "Kabaddi Stadium" },
      { t: "Sports trophy and gold medal presentation on velvet podium", s: "Gleaming golden championship trophy cup flanked by gold medals and red winner ribbons", l: "Sports Award Dais" }
    ],
    kw_en: ["cricket", "ipl", "stadium", "sports", "badminton", "kabaddi", "match", "trophy", "athletics"],
    kw_te: ["క్రికెట్", "ఐపీఎల్", "స్టేడియం", "క్రీడలు", "బ్యాడ్మింటన్", "కబడ్డీ", "మ్యాచ్", "ట్రోఫీ"]
  },
  {
    sub: "cinema-film-industry",
    topic: "cinema",
    kind: "topic" as const,
    locations: ["Ramoji Film City Hyderabad", "Annapurna Studios", "Film Nagar", "Vizag Film Studio"],
    scenes: [
      { t: "Film production shooting set with cinema camera on heavy crane", s: "Professional digital cinema camera mounted on telescopic crane arm with studio spot lights on movie soundstage", l: "Film Soundstage" },
      { t: "Director clapperboard slate and film reel on director chair", s: "Wooden clapperboard with production details resting on canvas director chair beside movie studio lights", l: "Film Studio Set" },
      { t: "Movie theater cinema hall red velvet seats and giant screen", s: "Tiered cinema auditorium with comfortable luxury push-back seats facing massive silver projection screen", l: "Cinema Multiplex Hall" },
      { t: "Film editing post-production studio with multi-screen timeline", s: "Video color grading suite with calibrated reference monitors, color control panel and audio mixer console", l: "Post Production Studio" },
      { t: "Ramoji Film City grand outdoor palace facade film set", s: "Extravagant outdoor movie set featuring ornate royal palace architecture with fountains and studio vehicles", l: "Ramoji Film City" },
      { t: "Recording studio soundproof booth with condenser microphone", s: "Acoustic wooden studio booth with professional pop-filter microphone and music lyric stand", l: "Audio Dubbing Studio" },
      { t: "Film premiere red carpet entrance with paparazzi flashlights", s: "Velvet red carpet walkway with golden stanchions, movie poster backdrop and camera flashes", l: "Film Premiere Theater" },
      { t: "VFX visual effects green screen stage with tracking markers", s: "Large cyclorama chroma green wall with motion tracking dots and professional studio softbox lights", l: "VFX Green Screen Studio" },
      { t: "Costume and makeup vanity room in film studio", s: "Lighted vanity mirror surrounded by makeup brushes, period costumes and hair styling equipment", l: "Studio Makeup Room" },
      { t: "Outdoor location film shooting with drone and camera crew", s: "Film crew with boom microphones, light reflectors and camera rig shooting scenic landscape sequence", l: "Outdoor Film Location" }
    ],
    kw_en: ["cinema", "tollywood", "film shooting", "movie", "theater", "film city", "director", "entertainment"],
    kw_te: ["సినిమా", "టాలీవుడ్", "చిత్ర పరిశ్రమ", "షూటింగ్", "మూవీ", "థియేటర్", "ఫిల్మ్ సిటీ", "వినోదం"]
  },
  {
    sub: "jobs-recruitment-employment",
    topic: "jobs",
    kind: "topic" as const,
    locations: ["Hyderabad", "Visakhapatnam", "Vijayawada", "Tirupati"],
    scenes: [
      { t: "Mega job fair recruitment hall with corporate interview stalls", s: "Large convention hall filled with candidate desks, company recruitment banners and job seekers in formal attire", l: "Job Mela Convention Hall" },
      { t: "Job interview round table with HR panel and candidate résumé", s: "Professional interview room with HR manager reviewing printed resume folder with candidate", l: "Corporate Interview Room" },
      { t: "State public service commission APPSC TSPSC examination center", s: "Organized competitive examination hall with seated candidates writing on OMR sheets with ballpoint pens", l: "Government Exam Center" },
      { t: "Police recruitment physical fitness physical endurance run track", s: "Aspiring police candidates running on track with electronic RFID timing mats and measuring bars", l: "Police Recruitment Ground" },
      { t: "Skill training welding and fabrication practical workshop", s: "Young trainees in protective gear learning precision metal fabrication on modern industrial machines", l: "ITI Skill Training Center" },
      { t: "Campus placement selection celebration with offer letter envelopes", s: "Graduating college students holding official corporate appointment offer letter folders", l: "College Placement Cell" },
      { t: "Employment exchange registration counter with digital kiosk", s: "Citizen employment facilitation desk with computer terminal where candidates register educational credentials", l: "District Employment Office" },
      { t: "Apprenticeship technical training in electrical equipment workshop", s: "Technical apprentices with multimeter probes troubleshooting industrial control panel with instructor", l: "Apprentice Training Center" },
      { t: "Nursing and healthcare professional skill simulation laboratory", s: "Nursing candidates practicing patient care techniques on medical training manikins in clinical lab", l: "Nursing Training College" },
      { t: "Startup incubation workspace with young entrepreneurs working", s: "Vibrant co-working space with laptop desks, beanbags and startup milestone charts on brick wall", l: "Innovation Hub" }
    ],
    kw_en: ["jobs", "recruitment", "job mela", "appsc", "tspsc", "interview", "employment", "notifications", "vacancies"],
    kw_te: ["ఉద్యోగాలు", "నోటిఫికేషన్", "జాబ్ మేళా", "ఉద్యోగ నియామకాలు", "ఇంటర్వ్యూ", "పోటీ పరీక్షలు", "ఉపాధి"]
  },
  {
    sub: "courts-judiciary-legal",
    topic: "judiciary",
    kind: "topic" as const,
    locations: ["Amaravati High Court", "Hyderabad High Court", "Visakhapatnam", "Vijayawada"],
    scenes: [
      { t: "High Court historic stone building with Indian tricolor flag", s: "Grand judicial high court building with classical stone colonnade, arched windows and manicured gardens", l: "High Court Complex" },
      { t: "Lady Justice bronze statue with balance scales and law books", s: "Dignified bronze statue of Lady Justice holding balance scales and sword placed in front of bound legal statutes", l: "Court Law Library" },
      { t: "District court complex corridors with lawyers in black robes", s: "Judicial corridors with advocates carrying legal case files walking past courtroom doors", l: "District Court Complex" },
      { t: "Formal courtroom interior with judge bench and witness box", s: "Empty dignified courtroom with polished wooden judge bench, Ashoka emblem and wooden witness box", l: "Courtroom Chamber" },
      { t: "Lok Adalat dispute resolution bench in session", s: "Judicial officers and legal mediators seated at table conducting amicable public settlement session", l: "Lok Adalat Hall" },
      { t: "Legal aid free counseling clinic for underprivileged citizens", s: "Advocate consulting with rural family explaining free legal assistance rights across consultation desk", l: "Legal Services Authority" },
      { t: "Law library with walls of bound leather supreme court law reports", s: "Quiet academic legal library with high mahogany bookshelves filled with gold-embossed case law volumes", l: "Advocates Bar Library" },
      { t: "Sub-registrar office property document deed registration desk", s: "Official desk with biometric fingerprint scanner, stamp paper deeds and computer registration camera", l: "Sub-Registrar Office" },
      { t: "Bar association conference room with advocates discussing brief", s: "Senior advocates gathered around conference table with open law journals and typed legal petitions", l: "Bar Association Hall" },
      { t: "Judicial academy training hall for newly appointed magistrates", s: "Tiered auditorium with trainee judicial officers listening to senior judge lecture on constitutional law", l: "State Judicial Academy" }
    ],
    kw_en: ["court", "high court", "judiciary", "lawyers", "judge", "legal", "justice", "verdict", "advocate"],
    kw_te: ["కోర్టు", "హైకోర్టు", "న్యాయస్థానం", "తీర్పు", "న్యాయమూర్తి", "లాయర్లు", "చట్టం", "న్యాయం"]
  },
  {
    sub: "civic-safety-crime-investigation",
    topic: "civic-safety",
    kind: "topic" as const,
    locations: ["Visakhapatnam", "Vijayawada", "Hyderabad", "Guntur"],
    scenes: [
      { t: "Yellow police line do not cross crime scene cordon tape", s: "High-contrast yellow and black caution tape stretched across an outdoor scene with blurred police lights in background (No gore, no victims)", l: "Investigation Area" },
      { t: "Forensic ballistic microscope and evidence examination lab", s: "Forensic scientist in white lab coat examining evidence under high-power stereo comparison microscope", l: "Forensic Science Lab FSL" },
      { t: "Cybercrime digital evidence recovery workstation with hard drives", s: "Specialized computer lab with write-blocker forensic hardware, hard drives and digital analysis software", l: "Cyber Forensic Cell" },
      { t: "Fingerprint scanner and automated biometric AFIS system", s: "Digital glass optical fingerprint scanner displaying magnified ridge pattern on computer monitor", l: "Police Fingerprint Bureau" },
      { t: "Fire accident investigation site with charred debris (No injuries)", s: "Safety inspectors in helmets examining burnt industrial warehouse structures with clipboards and cameras", l: "Industrial Inspection Zone" },
      { t: "Road traffic accident aftermath investigation with tow crane (No injured people)", s: "Damaged car being safely lifted by hydraulic recovery crane on highway shoulder with traffic cones", l: "Highway Traffic Site" },
      { t: "Anti-narcotics and customs sniffer dog search at cargo hub", s: "Trained sniffer dog checking shipping parcels on conveyor belt with customs officers", l: "Air Cargo Terminal" },
      { t: "Bomb disposal squad protective blast suit and inspection robot", s: "Remote-controlled bomb disposal tracked robot with robotic arm on training ground with technician", l: "Special Operations Depot" },
      { t: "Police wireless communications radio base station antenna", s: "Police communications room with multichannel VHF radio consoles, mic and repeater towers", l: "Police Wireless Control" },
      { t: "Traffic CCTV speed enforcement camera mounted on highway gantry", s: "Automated high-speed camera with infrared flash mounted on metal highway bridge tracking vehicle speeds", l: "Expressway Monitoring Gantry" }
    ],
    kw_en: ["police tape", "investigation", "forensic", "crime scene", "cybercrime", "safety", "inspection"],
    kw_te: ["పోలీస్ విచారణ", "ఫోరెన్సిక్", "దర్యాప్తు", "భద్రత", "సైబర్‌క్రైమ్", "పోలీసులు"]
  },
  {
    sub: "devotional-temples-heritage",
    topic: "devotional",
    kind: "topic" as const,
    locations: ["Tirupati", "Srisailam", "Vijayawada", "Yadagirigutta", "Bhadrachalam", "Dwaraka Tirumala", "Annavaram", "Simhachalam"],
    scenes: [
      { t: "Temple gopuram illuminated at sunrise with brass lamps and bells", s: "Magnificent multi-tiered Dravidian temple tower catching golden morning sunlight with hanging brass bells", l: "Sacred Temple Complex" },
      { t: "Yadagirigutta Sri Lakshmi Narasimha Swamy renovated temple architecture", s: "Grand monolithic black granite temple carved into hill fortress with ornate sculpted pillars", l: "Yadagirigutta Hills" },
      { t: "Bhadrachalam Sri Sita Ramachandra Swamy temple on Godavari river bank", s: "Sacred temple gopuram standing on elevated river bank with wide calm Godavari waters in foreground", l: "Bhadrachalam Temple" },
      { t: "Annavaram Sri Veera Venkata Satyanarayana Swamy hill shrine", s: "Hilltop temple complex shaped in traditional chariot architectural style surrounded by green hills", l: "Ratnagiri Hill Annavaram" },
      { t: "Srisailam Mallikarjuna Swamy Jyotirlinga temple stone battlements", s: "Ancient fortified temple walls carved with intricate sculptures of elephants and warriors in Nallamala", l: "Srisailam Temple" },
      { t: "Dwaraka Tirumala Chinna Tirupati temple gopuram and pushkarini", s: "Sacred stepped holy water tank reflecting the illuminated white temple tower under dusk sky", l: "Dwaraka Tirumala" },
      { t: "Mahanandi temple crystal clear perennial freshwater pushkarini spring", s: "Devotees seated beside ancient stone temple tank with crystal clear fresh water flowing continuously from Nandi mouth", l: "Mahanandi Temple" },
      { t: "Kanipakam Sri Varasiddhi Vinayaka temple well and gopuram", s: "Famous temple sanctum housing self-manifested Ganesha inside holy stone well enclosure", l: "Kanipakam Chittoor" },
      { t: "Ahobilam Nava Narasimha rugged mountain trail and temple cave", s: "Ancient rock-cut shrine nestled inside deep natural sandstone canyon amidst dense Eastern Ghats forest", l: "Ahobilam Forest Hills" },
      { t: "Devotees lighting traditional earthen oil lamps during Karthika Masam", s: "Thousands of small clay oil lamps glowing warmly along temple stone steps and flagmast platform at twilight", l: "Temple Courtyard" }
    ],
    kw_en: ["devotional", "temple", "gopuram", "tirupati", "srisailam", "yadagirigutta", "bhadrachalam", "annavaram", "heritage", "hindu temple"],
    kw_te: ["ఆధ్యాత్మికం", "దేవాలయం", "గోపురం", "తిరుపతి", "శ్రీశైలం", "యాదగిరిగుట్ట", "భద్రాచలం", "అన్నవరం", "భక్తి"]
  }
];

// ═══════════════════════════════════════════════════════════════════
// 6. News Category Tiles (1:1 Aspect Ratio - 12 specs) - Prefix: CAT-TILE
// ═══════════════════════════════════════════════════════════════════
const categoryTiles = [
  {
    category: "andhra-pradesh",
    title: "Andhra Pradesh News Category Tile",
    scene: "Iconic Andhra Pradesh landmarks: Amaravati High Court, Krishna river Prakasam Barrage and Tirumala hills composite scene with golden dawn sky",
    location: "Andhra Pradesh State",
    kw_en: ["andhra pradesh", "ap news", "amaravati", "state"],
    kw_te: ["ఆంధ్రప్రదేశ్", "ఏపీ వార్తలు", "అమరావతి", "రాష్ట్ర వార్తలు"]
  },
  {
    category: "telangana",
    title: "Telangana News Category Tile",
    scene: "Telangana heritage and modern symbols: Charminar silhouette, Hussain Sagar Buddha statue and HITEC City skyline at sunset",
    location: "Telangana State",
    kw_en: ["telangana", "ts news", "hyderabad", "state"],
    kw_te: ["తెలంగాణ", "టీఎస్ వార్తలు", "హైదరాబాద్", "రాష్ట్ర వార్తలు"]
  },
  {
    category: "vizag",
    title: "Visakhapatnam News Category Tile",
    scene: "Visakhapatnam coastal beauty: curved RK Beach road, Kailasagiri hill and blue Bay of Bengal with lighthouse",
    location: "Visakhapatnam",
    kw_en: ["vizag", "visakhapatnam", "rk beach", "city"],
    kw_te: ["విశాఖపట్నం", "వైజాగ్", "నగర వార్తలు", "ఆర్కే బీచ్"]
  },
  {
    category: "national",
    title: "National News Category Tile",
    scene: "Indian national democracy theme: Parliament building dome silhouette with Ashoka pillar emblem and connected smart cities network",
    location: "New Delhi India",
    kw_en: ["national", "india", "delhi", "country"],
    kw_te: ["జాతీయం", "భారతదేశం", "దేశ వార్తలు", "న్యూఢిల్లీ"]
  },
  {
    category: "politics",
    title: "Politics News Category Tile",
    scene: "Democratic governance symbols: assembly chamber podium, voting ballot box and government secretariat corridor",
    location: "Secretariat & Assembly",
    kw_en: ["politics", "governance", "assembly", "elections"],
    kw_te: ["రాజకీయాలు", "ఎన్నికలు", "ప్రభుత్వం", "శాసనసభ"]
  },
  {
    category: "cinema",
    title: "Cinema News Category Tile",
    scene: "Tollywood and Indian cinema theme: film reel, vintage movie camera, clapperboard and warm spotlight on red stage",
    location: "Film Studio",
    kw_en: ["cinema", "tollywood", "movies", "entertainment"],
    kw_te: ["సినిమా", "టాలీవుడ్", "చిత్రసీమ", "వినోదం"]
  },
  {
    category: "cricket",
    title: "Cricket & Sports Category Tile",
    scene: "Sports and cricket theme: international cricket stadium floodlights, cricket bat, ball, wickets and gold trophy cup",
    location: "Sports Stadium",
    kw_en: ["cricket", "sports", "ipl", "stadium"],
    kw_te: ["క్రికెట్", "క్రీడలు", "ఐపీఎల్", "మ్యాచ్"]
  },
  {
    category: "business",
    title: "Business & Economy Category Tile",
    scene: "Business and economy symbols: rising financial market candlestick chart, gold coins, rupee symbol and modern corporate office towers",
    location: "Financial District",
    kw_en: ["business", "economy", "finance", "markets"],
    kw_te: ["వ్యాపారం", "బిజినెస్", "ఆర్థికం", "మార్కెట్లు"]
  },
  {
    category: "technology",
    title: "Technology News Category Tile",
    scene: "Modern technology theme: smartphone, glowing semiconductor microchip circuit lines and futuristic AI cloud data network",
    location: "Technology Park",
    kw_en: ["technology", "tech", "ai", "software"],
    kw_te: ["టెక్నాలజీ", "సాంకేతికత", "సాఫ్ట్‌వేర్", "ఏఐ"]
  },
  {
    category: "health",
    title: "Health & Wellness Category Tile",
    scene: "Healthcare and medical theme: stethoscope, clean medical heartbeat pulse line, fresh organic fruits and herbal wellness",
    location: "Health & Medical Center",
    kw_en: ["health", "medical", "wellness", "doctor"],
    kw_te: ["ఆరోగ్యం", "వైద్యం", "వెల్నెస్", "ఆసుపత్రి"]
  },
  {
    category: "jobs",
    title: "Jobs & Careers Category Tile",
    scene: "Employment and career theme: professional leather portfolio, graduation scroll, laptop and corporate appointment letter",
    location: "Career Center",
    kw_en: ["jobs", "careers", "employment", "recruitment"],
    kw_te: ["ఉద్యోగాలు", "ఉపాధి", "కెరీర్", "నోటిఫికేషన్లు"]
  },
  {
    category: "devotional",
    title: "Devotional & Spiritual Category Tile",
    scene: "Spiritual and temple theme: grand traditional temple gopuram, burning brass oil lamps, marigold garland and sacred morning dawn",
    location: "Devotional Temple",
    kw_en: ["devotional", "spiritual", "temple", "puja"],
    kw_te: ["భక్తి", "ఆధ్యాత్మికం", "దేవాలయం", "పూజ"]
  }
];

// ═══════════════════════════════════════════════════════════════════
// Generator Execution & Validation
// ═══════════════════════════════════════════════════════════════════
export function generateManifest(): ImageSpec[] {
  const specs: ImageSpec[] = [];

  // 1. Political & Civic Events (100 specs)
  let polIndex = 1;
  for (const group of polSubcategories) {
    for (const item of group.scenes) {
      const code = `EVT-POL-${String(polIndex++).padStart(4, "0")}`;
      const locationTag = group.locations[polIndex % group.locations.length];
      const prompt = buildPrompt(item.t, item.s, `${item.l}, ${locationTag}`);
      specs.push({
        asset_code: code,
        kind: group.kind,
        category: "politics",
        subcategory: group.sub,
        title: item.t,
        prompt,
        negative_prompt: NEGATIVE_PROMPT,
        keywords_en: [...new Set([...group.kw_en, locationTag.toLowerCase(), group.sub.replace(/-/g, " ")])],
        keywords_te: [...new Set(group.kw_te)],
        location_tags: [...new Set([locationTag.toLowerCase(), "andhra pradesh", "telangana"])],
        person_tags: [],
        topic_tags: [group.topic, group.sub],
        intended_topics: ["politics", group.sub],
        image_style: "realistic editorial photograph style",
        aspect_ratio: "16:9",
        focus: "center",
        conceptual: false
      });
    }
  }

  // 2. People, Professions & Community Life (100 specs)
  let pplIndex = 1;
  for (const group of peopleSubcategories) {
    for (const item of group.scenes) {
      const code = `PPL-PRF-${String(pplIndex++).padStart(4, "0")}`;
      const locationTag = group.locations[pplIndex % group.locations.length];
      const prompt = buildPrompt(item.t, item.s, `${item.l}, ${locationTag}`);
      specs.push({
        asset_code: code,
        kind: group.kind,
        category: "people",
        subcategory: group.sub,
        title: item.t,
        prompt,
        negative_prompt: NEGATIVE_PROMPT,
        keywords_en: [...new Set([...group.kw_en, locationTag.toLowerCase(), group.sub.replace(/-/g, " ")])],
        keywords_te: [...new Set(group.kw_te)],
        location_tags: [...new Set([locationTag.toLowerCase(), "andhra pradesh", "telangana"])],
        person_tags: [group.sub.split("-")[0]],
        topic_tags: [group.topic, group.sub],
        intended_topics: [group.topic, group.sub],
        image_style: "realistic editorial photograph style",
        aspect_ratio: "16:9",
        focus: "center",
        conceptual: false
      });
    }
  }

  // 3. Places & Infrastructure (100 specs)
  let plcIndex = 1;
  for (const group of placesSubcategories) {
    for (const item of group.scenes) {
      const code = `PLC-INF-${String(plcIndex++).padStart(4, "0")}`;
      const locationTag = group.locations[plcIndex % group.locations.length];
      const prompt = buildPrompt(item.t, item.s, `${item.l}, ${locationTag}`);
      const isConceptual = !!(group as any).conceptual || /conceptual/i.test(item.t);
      specs.push({
        asset_code: code,
        kind: group.kind,
        category: "places",
        subcategory: group.sub,
        title: item.t,
        prompt,
        negative_prompt: NEGATIVE_PROMPT,
        keywords_en: [...new Set([...group.kw_en, locationTag.toLowerCase(), group.sub.replace(/-/g, " ")])],
        keywords_te: [...new Set(group.kw_te)],
        location_tags: [...new Set([locationTag.toLowerCase(), "andhra pradesh", "telangana"])],
        person_tags: [],
        topic_tags: [group.topic, group.sub],
        intended_topics: ["places", group.topic],
        image_style: "realistic editorial photograph style",
        aspect_ratio: "16:9",
        focus: "center",
        conceptual: isConceptual
      });
    }
  }

  // 4. Combination Scenes (100 specs)
  let scnIndex = 1;
  for (const group of combinationSubcategories) {
    for (const item of group.scenes) {
      const code = `SCN-CMB-${String(scnIndex++).padStart(4, "0")}`;
      const locationTag = group.locations[scnIndex % group.locations.length];
      const prompt = buildPrompt(item.t, item.s, `${item.l}, ${locationTag}`);
      specs.push({
        asset_code: code,
        kind: group.kind,
        category: "scenes",
        subcategory: group.sub,
        title: item.t,
        prompt,
        negative_prompt: NEGATIVE_PROMPT,
        keywords_en: [...new Set([...group.kw_en, locationTag.toLowerCase(), group.sub.replace(/-/g, " ")])],
        keywords_te: [...new Set(group.kw_te)],
        location_tags: [...new Set([locationTag.toLowerCase(), "andhra pradesh", "telangana"])],
        person_tags: [],
        topic_tags: [group.topic, group.sub],
        intended_topics: [group.topic, group.sub],
        image_style: "realistic editorial photograph style",
        aspect_ratio: "16:9",
        focus: "center",
        conceptual: false
      });
    }
  }

  // 5. General News Topics (100 specs)
  let genIndex = 1;
  for (const group of generalSubcategories) {
    for (const item of group.scenes) {
      const code = `GEN-NWS-${String(genIndex++).padStart(4, "0")}`;
      const locationTag = group.locations[genIndex % group.locations.length];
      const prompt = buildPrompt(item.t, item.s, `${item.l}, ${locationTag}`);
      specs.push({
        asset_code: code,
        kind: group.kind,
        category: "general",
        subcategory: group.sub,
        title: item.t,
        prompt,
        negative_prompt: NEGATIVE_PROMPT,
        keywords_en: [...new Set([...group.kw_en, locationTag.toLowerCase(), group.sub.replace(/-/g, " ")])],
        keywords_te: [...new Set(group.kw_te)],
        location_tags: [...new Set([locationTag.toLowerCase(), "andhra pradesh", "telangana"])],
        person_tags: [],
        topic_tags: [group.topic, group.sub],
        intended_topics: [group.topic, group.sub],
        image_style: "realistic editorial photograph style",
        aspect_ratio: "16:9",
        focus: "center",
        conceptual: false
      });
    }
  }

  // 6. Category Tiles (12 specs, 1:1)
  let tileIndex = 1;
  for (const tile of categoryTiles) {
    const code = `CAT-TILE-${String(tileIndex++).padStart(4, "0")}`;
    const prompt = buildPrompt(tile.title, tile.scene, tile.location, true);
    specs.push({
      asset_code: code,
      kind: "category",
      category: tile.category,
      subcategory: "category-tile",
      title: tile.title,
      prompt,
      negative_prompt: NEGATIVE_PROMPT,
      keywords_en: [...new Set([...tile.kw_en, tile.category, "category tile", "icon"])],
      keywords_te: [...new Set([...tile.kw_te, "కేటగిరీ"])],
      location_tags: ["andhra pradesh", "telangana", "india"],
      person_tags: [],
      topic_tags: [tile.category, "category-tile"],
      intended_topics: [tile.category],
      image_style: "modern editorial category tile icon",
      aspect_ratio: "1:1",
      focus: "center",
      conceptual: false
    });
  }

  // Deduplication & sanity checks
  const seenPrompts = new Set<string>();
  const uniqueSpecs: ImageSpec[] = [];
  const keywordSubcatCounts = new Map<string, number>();

  for (const s of specs) {
    const normPrompt = s.prompt.toLowerCase().replace(/\s+/g, " ").trim();
    if (seenPrompts.has(normPrompt)) {
      console.warn(`Duplicate prompt dropped: ${s.asset_code}`);
      continue;
    }
    seenPrompts.add(normPrompt);

    // Track subcategory + primary keyword frequency
    const subcatKey = `${s.subcategory}:${s.keywords_en[0] || ""}`;
    const count = (keywordSubcatCounts.get(subcatKey) || 0) + 1;
    keywordSubcatCounts.set(subcatKey, count);
    
    uniqueSpecs.push(s);
  }

  return uniqueSpecs;
}

if (process.argv[1]?.endsWith("generate-manifest.ts")) {
  const result = generateManifest();
  const outDir = path.resolve("data");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, "image-manifest.json");
  fs.writeFileSync(outFile, JSON.stringify(result, null, 2), "utf8");
  console.log(`Manifest generated successfully: ${result.length} specifications written to ${outFile}`);
  console.log(`Categories summary:`);
  const counts: Record<string, number> = {};
  for (const s of result) counts[s.category] = (counts[s.category] || 0) + 1;
  console.table(counts);
}
