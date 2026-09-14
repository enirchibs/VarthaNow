import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { 
  Wrench, 
  MapPin, 
  Phone, 
  MessageCircle, 
  PlusCircle, 
  Search, 
  ShieldCheck, 
  Sparkles, 
  X, 
  Calendar, 
  Clock,
  ArrowLeft,
  Truck,
  HardHat,
  Tractor,
  PartyPopper,
  Camera,
  Image as ImageIcon,
  Tag,
  Gift,
  User,
  UtensilsCrossed,
  Car,
  Scissors,
  GraduationCap,
  Briefcase,
  ShoppingBag,
  HeartHandshake,
  Stethoscope,
  AlertTriangle,
  FileCheck,
  CheckCircle2
} from "lucide-react";
import { Link } from "react-router-dom";
import { sendSMSOTP, verifySellerOTP } from "@/lib/classifieds-api";
import { LocationAreaSelector } from "@/components/LocationAreaSelector";
import { CustomerSafetyNotice } from "@/components/CustomerSafetyNotice";
import { ReportAbuseModal } from "@/components/ReportAbuseModal";
import { 
  validateAndSanitizeFullName, 
  saveStoredSafetyProfile, 
  recordTermsAcceptance, 
  CURRENT_TERMS_VERSION, 
  recordAuditEvent,
  ListingPurpose
} from "@/lib/safety-compliance";
import { 
  UserProfile, 
  getStoredUserProfile, 
  saveStoredUserProfile, 
  isUserLoggedIn, 
  PROFILE_EVENT_NAME 
} from "@/lib/user-profile";

export type ServiceCategory =
  | "workers"
  | "transport"
  | "construction"
  | "farm_machines"
  | "events"
  | "hotel_food"
  | "beauty"
  | "education"
  | "professional"
  | "local_shops"
  | "pets_animals"
  | "care_services"
  | "other_services";

export interface ServiceRentalItem {
  id: string;
  provider_name: string;
  category: ServiceCategory;
  service_type: string;
  village: string;
  price_rate: string;
  machine_details?: string;
  available_days: string;
  description: string;
  contact: string;
  image: string;
  created_at: string;
}

const SERVICE_GROUPS: {
  id: ServiceCategory;
  title: string;
  icon: React.ElementType;
  items: string[];
}[] = [
  {
    id: "workers",
    title: "🧑‍🔧 సేవా నిపుణులు (Service Professionals)",
    icon: HardHat,
    items: [
      // Home Repair & Maintenance
      "⚡ Electrician — ఎలక్ట్రీషియన్",
      "🔧 Plumber — ప్లంబర్",
      "🪚 Carpenter — వడ్రంగి / కార్పెంటర్",
      "🔑 Locksmith — తాళాల నిపుణుడు",
      "🎨 Painter — పెయింటర్",
      "🧹 House Cleaning — ఇంటి క్లీనింగ్",
      "🧼 Deep Cleaning — డీప్ క్లీనింగ్",
      "🚿 Bathroom Cleaning — బాత్రూమ్ క్లీనింగ్",
      "🪟 Glass & Window Work — గ్లాస్ & విండో వర్క్",
      "🚪 Door & Window Repair — డోర్ & విండో రిపేర్",
      "💧 Waterproofing — వాటర్ప్రూఫింగ్",
      "🐜 Pest Control — పెస్ట్ కంట్రోల్",
      "🌱 Gardener — తోటమాలి",
      "🏡 Home Maintenance — ఇంటి నిర్వహణ",
      "🛠️ Handyman — చిన్నచిన్న ఇంటి పనులు",
      // AC & Appliance Services
      "❄️ AC Technician — ఏసీ టెక్నీషియన్",
      "📺 TV Repair — టీవీ రిపేర్",
      "🧊 Refrigerator Repair — ఫ్రిజ్ రిపేర్",
      "🧺 Washing Machine Repair — వాషింగ్ మెషిన్ రిపేర్",
      "🔥 Geyser Repair — గీజర్ రిపేర్",
      "🍳 Microwave/Oven Repair — మైక్రోవేవ్/ఓవెన్ రిపేర్",
      "💧 RO/Water Purifier — ఆర్ఓ సర్వీస్",
      "🌀 Fan Repair — ఫ్యాన్ రిపేర్",
      "🔌 Inverter/UPS — ఇన్వర్టర్/యూపీఎస్",
      "🔋 Battery Service — బ్యాటరీ సర్వీస్",
      // Electronics & Technology
      "📱 Mobile Repair — మొబైల్ రిపేర్",
      "💻 Laptop Repair — ల్యాప్టాప్ రిపేర్",
      "🖥️ Computer Repair — కంప్యూటర్ రిపేర్",
      "🖨️ Printer Repair — ప్రింటర్ రిపేర్",
      "📹 CCTV Technician — సీసీటీవీ టెక్నీషియన్",
      "📡 DTH/Dish Service — డీటీహెచ్/డిష్",
      "🌐 Wi-Fi/Network Technician — వై-ఫై/నెట్వర్క్",
      "🔊 Sound System Technician — సౌండ్ సిస్టమ్",
      "🏠 Smart Home Technician — స్మార్ట్ హోమ్",
      // Domestic Services
      "👩‍🍳 Cook — కుక్",
      "🧹 Maid/House Help — ఇంటి సహాయకులు",
      "👕 Laundry — లాండ్రీ",
      "👔 Ironing — ఇస్త్రీ",
      "👶 Babysitter — పిల్లల సంరక్షణ",
      "👴 Elder Care — వృద్ధుల సంరక్షణ",
      "🐕 Pet Care — పెట్ కేర్",
      "🐕 Dog Walker — డాగ్ వాకర్"
    ]
  },
  {
    id: "transport",
    title: "🚗 డ్రైవింగ్ & రవాణా సేవలు (Drivers & Transport)",
    icon: Car,
    items: [
      // Drivers
      "🚗 Car Driver — కార్ డ్రైవర్",
      "🚕 Taxi Driver — టాక్సీ డ్రైవర్",
      "🚙 Personal Driver — వ్యక్తిగత డ్రైవర్",
      "🚗 Outstation Driver — అవుట్స్టేషన్ డ్రైవర్",
      "🚐 Van Driver — వ్యాన్ డ్రైవర్",
      "🚌 Bus Driver — బస్ డ్రైవర్",
      "🚚 Lorry Driver — లారీ డ్రైవర్",
      "🚜 Tractor Driver — ట్రాక్టర్ డ్రైవర్",
      "🛺 Auto Driver — ఆటో డ్రైవర్",
      // Transport
      "🚚 Goods Transport — గూడ్స్ ట్రాన్స్పోర్ట్",
      "🚛 Mini Truck — మినీ ట్రక్",
      "🚚 Lorry Service — లారీ సర్వీస్",
      "📦 Local Delivery — స్థానిక డెలివరీ",
      "🛵 Delivery Partner — డెలివరీ పార్టనర్",
      "📦 Packers & Movers — ప్యాకర్స్ & మూవర్స్",
      "🚗 Vehicle Rental — వాహన అద్దె",
      "🛻 Towing Service — టోయింగ్ సర్వీస్",
      // Vehicle Services
      "🚗 Car Mechanic — కార్ మెకానిక్",
      "🏍️ Bike Mechanic — బైక్ మెకానిక్",
      "🛞 Tyre/Puncture — టైర్/పంక్చర్",
      "🔋 Battery Service — బ్యాటరీ",
      "🚿 Car Wash — కార్ వాష్",
      "✨ Car Detailing — కార్ డీటైలింగ్",
      "❄️ Car AC — కార్ ఏసీ",
      "🎨 Vehicle Painting — వెహికల్ పెయింటింగ్"
    ]
  },
  {
    id: "construction",
    title: "🏗️ నిర్మాణ సేవలు (Construction Services)",
    icon: Wrench,
    items: [
      // Skilled Construction Professionals
      "🧱 Mason — మేస్త్రీ",
      "🧱 Tiles Mason — టైల్స్ మేస్త్రీ",
      "🪨 Marble/Granite Worker — మార్బుల్/గ్రానైట్ మేస్త్రీ",
      "🪚 Carpenter — కార్పెంటర్",
      "🎨 Painter — పెయింటర్",
      "🔥 Welder — వెల్డర్",
      "🏠 False Ceiling — ఫాల్స్ సీలింగ్",
      "🏠 Poly Sheeting — పాలీ షీటింగ్",
      "🏗️ Fabrication — ఫ్యాబ్రికేషన్",
      "💧 Waterproofing — వాటర్ప్రూఫింగ్",
      "🏠 Roofing — రూఫింగ్",
      "🧱 Flooring — ఫ్లోరింగ్",
      "🧰 Construction Labour — నిర్మాణ కార్మికులు",
      // Construction Machinery
      "🚜 JCB Operator — జేసీబీ ఆపరేటర్",
      "🚜 Excavator — ఎక్స్కవేటర్",
      "🚜 Earthmover — ఎర్త్మూవర్",
      "🚧 Bulldozer — బుల్డోజర్",
      "🏗️ Crane — క్రేన్",
      "🚚 Tipper — టిప్పర్",
      "🚛 Tractor — ట్రాక్టర్",
      "🏗️ Concrete Mixer — కాంక్రీట్ మిక్సర్",
      "🏗️ Concrete Pump — కాంక్రీట్ పంప్",
      "🚧 Road Roller — రోడ్ రోలర్",
      "🚜 Machinery Rental — నిర్మాణ యంత్రాల అద్దె",
      // Construction Material Suppliers
      "🏖️ Sand Supplier — ఇసుక సరఫరాదారు",
      "🧱 Brick Supplier — ఇటుకల సరఫరాదారు",
      "🧱 Cement Supplier — సిమెంట్ సరఫరాదారు",
      "🔩 Iron/Steel Supplier — ఐరన్/స్టీల్ సరఫరాదారు",
      "🪨 Stone Supplier — రాయి సరఫరాదారు",
      "🪵 Wood Supplier — కలప సరఫరాదారు",
      "🧱 Tiles Supplier — టైల్స్ సరఫరాదారు",
      "🚪 Doors & Windows Supplier — డోర్స్/విండోస్",
      "🚿 Plumbing Material — ప్లంబింగ్ మెటీరియల్",
      "⚡ Electrical Material — ఎలక్ట్రికల్ మెటీరియల్",
      "🎨 Paint & Hardware — పెయింట్ & హార్డ్వేర్"
    ]
  },
  {
    id: "farm_machines",
    title: "🚜 వ్యవసాయ యంత్రాలు & సేవలు (Agricultural Machinery & Services)",
    icon: Tractor,
    items: [
      "🚜 Tractor — ట్రాక్టర్",
      "🚜 Tractor Rental — ట్రాక్టర్ అద్దె",
      "🌾 Harvester — హార్వెస్టర్",
      "🌱 Rotavator — రోటావేటర్",
      "🌾 Cultivator — కల్టివేటర్",
      "🚜 Ploughing Service — దున్నే సేవ",
      "🌾 Paddy Harvester — వరి హార్వెస్టర్",
      "🌽 Corn Harvester — మొక్కజొన్న హార్వెస్టర్",
      "💧 Borewell Service — బోర్వెల్ సర్వీస్",
      "💦 Water Pump — వాటర్ పంప్",
      "🌾 Agricultural Equipment Rental — వ్యవసాయ యంత్రాల అద్దె",
      "👨‍🌾 Farm Labour — వ్యవసాయ కార్మికులు",
      "🌱 Landscaping — ల్యాండ్స్కేపింగ్",
      "🌳 Tree Cutting — చెట్ల కటింగ్",
      "🌿 Nursery/Plants — నర్సరీ/మొక్కలు"
    ]
  },
  {
    id: "events",
    title: "🎉 కార్యక్రమాలు & ఈవెంట్ సేవలు (Event & Function Services)",
    icon: PartyPopper,
    items: [
      "📸 Photographer — ఫోటోగ్రాఫర్",
      "🎥 Videographer — వీడియోగ్రాఫర్",
      "🎬 Video Editing — వీడియో ఎడిటింగ్",
      "🎤 DJ — డీజే",
      "🔊 Sound System — సౌండ్ సిస్టమ్",
      "💡 Lighting — లైటింగ్",
      "🌸 Flower Decoration — పూల అలంకరణ",
      "🎈 Balloon Decoration — బెలూన్ డెకరేషన్",
      "🪑 Chairs & Tables — కుర్చీలు/టేబుల్స్",
      "⛺ Tent House — టెంట్ హౌస్",
      "💍 Wedding Planner — వెడ్డింగ్ ప్లానర్",
      "🎉 Event Planner — ఈవెంట్ ప్లానర్",
      "🍽️ Function Catering — ఫంక్షన్ క్యాటరింగ్",
      "💄 Bridal Makeup — బ్రైడల్ మేకప్",
      "🎨 Mehendi Artist — మెహందీ",
      "🎶 Orchestra/Music — ఆర్కెస్ట్రా",
      "🥁 Band — బ్యాండ్"
    ]
  },
  {
    id: "hotel_food",
    title: "🏨 హోటళ్లు, టిఫిన్ & ఫుడ్ వ్యాపారాలు (Hotels, Tiffin & Food)",
    icon: UtensilsCrossed,
    items: [
      // Food Businesses
      "🏨 Hotels — హోటల్స్",
      "🍛 Restaurants — రెస్టారెంట్లు",
      "🥘 Tiffin Centers — టిఫిన్ సెంటర్లు",
      "🏠 Home Food — హోమ్ ఫుడ్",
      "☕ Tea & Coffee Shops — టీ/కాఫీ షాపులు",
      "🥐 Bakeries — బేకరీలు",
      "🥤 Juice Centers — జ్యూస్ సెంటర్లు",
      "🍦 Ice Cream Shops — ఐస్క్రీమ్",
      "🍕 Fast Food Centers — ఫాస్ట్ ఫుడ్",
      "🍗 Chicken/Mutton Shops — చికెన్/మటన్",
      "🐟 Fish Shops — చేపల దుకాణాలు",
      "🥦 Vegetable Shops — కూరగాయల దుకాణాలు",
      "🍎 Fruit Shops — పండ్ల దుకాణాలు",
      // Food Services
      "🛵 Food Delivery — ఫుడ్ డెలివరీ",
      "🍽️ Catering — క్యాటరింగ్",
      "🎉 Function Catering — ఫంక్షన్ క్యాటరింగ్",
      "🍱 Meal Box/Tiffin Delivery — మీల్ బాక్స్",
      "🎂 Cake Orders — కేక్ ఆర్డర్స్",
      "🍰 Home Bakers — హోమ్ బేకర్స్"
    ]
  },
  {
    id: "beauty",
    title: "💇 అందం & వ్యక్తిగత సేవలు (Beauty & Personal Services)",
    icon: Scissors,
    items: [
      "💇 Barber — బార్బర్",
      "💇‍♀️ Beauty Parlour — బ్యూటీ పార్లర్",
      "💄 Makeup Artist — మేకప్ ఆర్టిస్ట్",
      "💅 Nail Services — నెయిల్ సర్వీసెస్",
      "🌸 Mehendi — మెహందీ",
      "💍 Bridal Services — బ్రైడల్ సర్వీసెస్",
      "💆 Massage Services — మసాజ్ సర్వీసెస్",
      "💇 Hair Stylist — హెయిర్ స్టైలిస్ట్"
    ]
  },
  {
    id: "education",
    title: "📚 విద్య & శిక్షణ (Education & Training)",
    icon: GraduationCap,
    items: [
      "📚 Home Tuition — హోమ్ ట్యూషన్",
      "🏫 Tuition Center — ట్యూషన్ సెంటర్",
      "🗣️ Spoken English — స్పోకెన్ ఇంగ్లీష్",
      "💻 Computer Training — కంప్యూటర్ ట్రైనింగ్",
      "🎵 Music Teacher — మ్యూజిక్ టీచర్",
      "💃 Dance Teacher — డ్యాన్స్ టీచర్",
      "🎨 Drawing Teacher — డ్రాయింగ్ టీచర్",
      "🏏 Sports Coach — స్పోర్ట్స్ కోచ్",
      "🧘 Yoga Trainer — యోగా ట్రైనర్",
      "🏋️ Fitness Trainer — ఫిట్నెస్ ట్రైనర్",
      "🎓 Competitive Exam Coaching — పోటీ పరీక్షల కోచింగ్"
    ]
  },
  {
    id: "professional",
    title: "💼 ప్రొఫెషనల్ సేవలు (Professional Services)",
    icon: Briefcase,
    items: [
      "⚖️ Lawyer — న్యాయవాది",
      "📊 Accountant — అకౌంటెంట్",
      "🧾 GST/Tax Consultant — GST/ట్యాక్స్ కన్సల్టెంట్",
      "🏠 Real Estate Agent — రియల్ ఎస్టేట్ ఏజెంట్",
      "📐 Architect — ఆర్కిటెక్ట్",
      "🏗️ Civil Engineer — సివిల్ ఇంజనీర్",
      "🏠 Interior Designer — ఇంటీరియర్ డిజైనర్",
      "📏 Surveyor — సర్వేయర్",
      "📋 Documentation Services — డాక్యుమెంటేషన్",
      "💻 Computer Services — కంప్యూటర్ సేవలు",
      "🌐 Web Developer — వెబ్ డెవలపర్",
      "🎨 Graphic Designer — గ్రాఫిక్ డిజైనర్",
      "📢 Digital Marketing — డిజిటల్ మార్కెటింగ్",
      "📸 Photo Studio — ఫోటో స్టూడియో"
    ]
  },
  {
    id: "local_shops",
    title: "🛍️ స్థానిక వ్యాపారాలు & దుకాణాలు (Local Shops & Businesses)",
    icon: ShoppingBag,
    items: [
      "🔑 Hardware Shop — హార్డ్వేర్",
      "⚡ Electrical Shop — ఎలక్ట్రీకల్ షాప్",
      "🔧 Plumbing Shop — ప్లంబింగ్",
      "🪑 Furniture Shop — ఫర్నిచర్",
      "📱 Mobile Shop — మొబైల్ షాప్",
      "💻 Computer Shop — కంప్యూటర్ షాప్",
      "🏠 Home Appliances — గృహోపకరణాలు",
      "👗 Tailor — టైలర్",
      "👞 Shoe Repair — చెప్పుల రిపేర్",
      "🧵 Boutique — బుటిక్",
      "🌸 Flower Shop — పూల షాప్",
      "🖨️ Xerox/Printing — జిరాక్స్/ప్రింటింగ్",
      "📦 Courier — కొరియర్",
      "💍 Jewellery — నగల దుకాణం"
    ]
  },
  {
    id: "pets_animals",
    title: "🐕 పెట్స్ & పశు సేవలు (Pet & Animal Services)",
    icon: HeartHandshake,
    items: [
      "🐕 Pet Grooming — పెట్ గ్రూమింగ్",
      "🐕 Dog Walking — డాగ్ వాకింగ్",
      "🐾 Pet Boarding — పెట్ బోర్డింగ్",
      "🐄 Cattle Services — పశు సేవలు",
      "🐔 Poultry Services — పౌల్ట్రీ",
      "🐐 Goat/Sheep Services — మేక/గొర్రెల సేవలు",
      "🌾 Animal Feed Supplier — పశువుల మేత",
      "🐕 Pet Food — పెట్ ఫుడ్"
    ]
  },
  {
    id: "care_services",
    title: "🏥 ఆరోగ్యం & సంరక్షణ సేవలు (Care Services)",
    icon: Stethoscope,
    items: [
      "👩‍⚕️ Home Nursing — హోమ్ నర్సింగ్",
      "👴 Elder Care — వృద్ధుల సంరక్షణ",
      "👶 Baby Care — శిశు సంరక్షణ",
      "🧑‍🦽 Caregiver — కేర్గివర్",
      "🚑 Ambulance — అంబులెన్స్",
      "💊 Pharmacy Delivery — మెడిసిన్ డెలివరీ",
      "🧘 Physiotherapy at Home — ఇంటి వద్ద ఫిజియోథెరపీ",
      "🩺 Home Sample Collection — ఇంటి వద్ద శాంపిల్ కలెక్షన్"
    ]
  },
  {
    id: "other_services",
    title: "🔧 ఇతర స్థానిక సేవలు (Other Local Services)",
    icon: Truck,
    items: [
      "🔨 General Labour — సాధారణ కార్మిక సేవలు",
      "📦 Miscellaneous Service — ఇతర సేవలు",
      "🛠️ Custom Service — ప్రత్యేక సేవ",
      "➕ Add Your Service — మీ సేవను జోడించండి"
    ]
  }
];

const INITIAL_SERVICES: ServiceRentalItem[] = [
  {
    id: "s-1",
    provider_name: "రమేష్ ట్రాక్టర్ సర్వీసెస్ (Ramesh Tractor Services)",
    category: "farm_machines",
    service_type: "🚜 Tractor + Rotavator + Trolley",
    village: "Anandapuram, Vizag",
    price_rate: "₹1,500 / day",
    machine_details: "Mahindra 575 DI Tractor with Rotavator Attachment",
    available_days: "ప్రతిరోజూ అందుబాటులో ఉంటుంది (All Days Available)",
    description: "పొలం దుక్కి దున్నడం, రోటవేటర్ వేయడం మరియు సరుకుల రవాణాకు ట్రాక్టర్ అద్దెకు ఇవ్వబడును.",
    contact: "9876543210",
    image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80",
    created_at: new Date().toISOString()
  },
  {
    id: "s-2",
    provider_name: "వెంకటేష్ జేసీబీ అండ్ ప్రొక్లైనర్ (Venkatesh JCB Earthmovers)",
    category: "construction",
    service_type: "🏗️ JCB 3DX Excavator",
    village: "Madhurawada, Vizag",
    price_rate: "₹1,200 / hour",
    machine_details: "JCB 3DX Heavy Excavator & Digger",
    available_days: "సోమవారం నుండి శనివారం (Mon-Sat)",
    description: "ప్లాట్ లెవెలింగ్, పునాదుల తవ్వకం, డ్రైనేజీ తవ్వకం & బిల్డింగ్ డెమోలిషన్ పనులకు జేసీబీ అద్దెకు.",
    contact: "9876543211",
    image: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80",
    created_at: new Date().toISOString()
  },
  {
    id: "s-3",
    provider_name: "సురేష్ ఎలక్ట్రికల్ వర్క్స్ (Suresh Electrician)",
    category: "workers",
    service_type: "⚡ Electrician — ఎలక్ట్రీషియన్",
    village: "Gajuwaka, Vizag",
    price_rate: "₹500 / Visit",
    available_days: "అన్ని రోజులు 24x7 (Emergency Call Available)",
    description: "ఇంటి వైరింగ్, షార్ట్ సర్క్యూట్ రిపేర్, ఫ్యాన్ & లైటింగ్ ఫిట్టింగ్స్, ఇన్వర్టర్ ఇన్స్టాలేషన్.",
    contact: "9876543212",
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80",
    created_at: new Date().toISOString()
  },
  {
    id: "s-4",
    provider_name: "శ్రీనివాస్ పందెరి & శామియానా (Srinivas Tent House)",
    category: "events",
    service_type: "⛺ Samiyana + Chairs + Sound System",
    village: "Tadepalli, Vijayawada",
    price_rate: "₹3,500 / Event",
    available_days: "ఆర్డర్‌పై అందుబాటులో ఉంటుంది",
    description: "శుభకార్యాలకు శామియానా టెంట్లు, ప్లాస్టిక్ కుర్చీలు, టేబుళ్లు, డీజే సౌండ్ సిస్టమ్ సరసమైన ధరల్లో.",
    contact: "9876543213",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
    created_at: new Date().toISOString()
  },
  {
    id: "s-5",
    provider_name: "రైతు కోత యంత్రం సర్వీసెస్ (Paddy Harvester Rental)",
    category: "farm_machines",
    service_type: "🌾 కోత యంత్రం — Harvesting Machine",
    village: "Guntur Rural",
    price_rate: "₹2,200 / hour",
    machine_details: "Kubota Combine Paddy Harvester",
    available_days: "పంట కాలంలో నిరంతరం అందుబాటులో ఉంటుంది",
    description: "వరి కోత, నూర్పిడి వేగంగా మరియు తక్కువ చేను నష్టంతో చేసే అధునాతన కోత యంత్రం.",
    contact: "9876543214",
    image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80",
    created_at: new Date().toISOString()
  },
  {
    id: "s-6",
    provider_name: "సత్యనారాయణ టైల్స్ మేస్త్రీ (Satyanarayana Tiles & Marble)",
    category: "workers",
    service_type: "🧱 Tiles Mesthri — టైల్స్ & మార్బుల్ మేస్త్రీ",
    village: "MVP Colony, Vizag",
    price_rate: "₹18 / sq.ft",
    available_days: "సోమ-శని (Mon-Sat)",
    description: "ఫ్లోరింగ్ టైల్స్, వాల్ టైల్స్, మార్బుల్స్ & గ్రానైట్ క్లీన్ ఫిట్టింగ్ మరియు రీప్యాచింగ్ వర్క్.",
    contact: "9876543215",
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
    created_at: new Date().toISOString()
  },
  {
    id: "s-7",
    provider_name: "శివ వెల్డింగ్ & ఆర్క్ వర్క్స్ (Shiva Welding Works)",
    category: "construction",
    service_type: "👨‍🏭 Welding — వెల్డింగ్ వర్క్ (గ్రిల్స్/గేట్లు)",
    village: "Pendurthi, Vizag",
    price_rate: "₹800 / Day",
    available_days: "అన్ని రోజులు అందుబాటులో ఉంటుంది",
    description: "ఐరన్ గేట్లు, కిటికీ గ్రిల్స్, షెడ్స్, స్టీల్ రెయిలింగ్స్ & గ్యాస్/ఆర్క్ వెల్డింగ్ స్పాట్ వర్క్.",
    contact: "9876543216",
    image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80",
    created_at: new Date().toISOString()
  },
  {
    id: "s-8",
    provider_name: "గోపి వుడ్ కార్పెంటర్ (Gopi Woodwork Carpenter)",
    category: "workers",
    service_type: "🪚 Carpenter (Wood Work) — వుడ్ వర్క్ కార్పెంటర్",
    village: "Kakinada",
    price_rate: "₹900 / Day",
    available_days: "అన్ని రోజులు",
    description: "ఇంటి డోర్స్, విండోస్, కబోర్డ్స్, టీవుడ్ ఫర్నిచర్ డిజైనింగ్ & లాక్ రిపేర్ వర్క్.",
    contact: "9876543217",
    image: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80",
    created_at: new Date().toISOString()
  },
  {
    id: "s-9",
    provider_name: "రాజేష్ ఫాల్స్ సీలింగ్ వర్క్స్ (Rajesh False Ceiling)",
    category: "workers",
    service_type: "🛖 False Ceiling — ఫాల్స్ సీలింగ్ వర్క్ (POP/Gypsum/PVC)",
    village: "Vijayawada",
    price_rate: "₹55 / sq.ft",
    available_days: "అన్ని రోజులు",
    description: "ఇళ్ళు, షాపులు మరియు ఆఫీసుల కోసం మోడ్రన్ POP, జిప్సమ్ & PVC డిజైనర్ ఫాల్స్ సీలింగ్.",
    contact: "9876543218",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    created_at: new Date().toISOString()
  },
  {
    id: "s-10",
    provider_name: "శ్రీ లక్ష్మి టిఫిన్ సెంటర్ & హోటల్ (Sri Lakshmi Tiffin Center)",
    category: "hotel_food",
    service_type: "🥣 టిఫిన్ సెంటర్లు — Tiffin Centers",
    village: "Anandapuram, Vizag",
    price_rate: "₹40 / Plate",
    available_days: "ఉదయం 6:00 నుండి రాత్రి 10:00 వరకు (Daily)",
    description: "వేడి వేడి ఇడ్లీ, దోస, పూరి, పరోటా & పెసరెట్టు అందుబాటులో ఉన్నాయి. హోమ్ డెలివరీ & కేటరింగ్ ఆర్డర్లు స్వీకరించబడును.",
    contact: "9876543219",
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80",
    created_at: new Date().toISOString()
  },
  {
    id: "s-11",
    provider_name: "సాయి రామ్ ఫంక్షన్ కేటరింగ్ & హోమ్ ఫుడ్ (Sai Ram Catering)",
    category: "hotel_food",
    service_type: "🍽️ ఫంక్షన్ కేటరింగ్ — Function Catering",
    village: "Vijayawada",
    price_rate: "₹150 / Plate",
    available_days: "ఆర్డర్‌పై అందుబాటులో ఉంటుంది",
    description: "వివాహాలు, పుట్టినరోజు వేడుకలు & శుభకార్యాలకు రుచికరమైన సాంప్రదాయ ఇంటి భోజనం & ఫంక్షన్ కేటరింగ్ సేవలు.",
    contact: "9876543220",
    image: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80",
    created_at: new Date().toISOString()
  }
];

export function ServicesRentalPage() {
  const [items, setItems] = useState<ServiceRentalItem[]>(() => {
    try {
      const saved = localStorage.getItem("vaartanow_service_items");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_SERVICES;
  });

  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const location = useLocation();
  const [isPostModalOpen, setIsPostModalOpen] = useState<boolean>(() => {
    try {
      return typeof window !== "undefined" && new URLSearchParams(window.location.search).get("post") === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("post") === "true") {
      setIsPostModalOpen(true);
    }
  }, [location.search]);

  // 3-Step Sequence: 1: Details & Declarations Form (Send OTP) | 2: SMS OTP Verification | 3: Published & Immutable Audit Record
  type ListingStep = 1 | 2 | 3;
  const [step, setStep] = useState<ListingStep>(1);
  const [mobileVerified, setMobileVerified] = useState<boolean>(false);
  const [mobileVerifiedAt, setMobileVerifiedAt] = useState<string>("");
  const [providerName, setProviderName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [category, setCategory] = useState<ServiceCategory>("workers");
  const [serviceType, setServiceType] = useState<string>("⚡ Electrician — ఎలక్ట్రీషియన్");
  const [village, setVillage] = useState<string>("");
  const [priceRate, setPriceRate] = useState<string>("");
  const [machineDetails, setMachineDetails] = useState<string>("");
  const [availableDays, setAvailableDays] = useState<string>("ప్రతిరోజూ (All Days)");
  const [description, setDescription] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [offerDiscount, setOfferDiscount] = useState<string>("");
  const [freeBonusItems, setFreeBonusItems] = useState<string>("");
  const [isFreeVisit, setIsFreeVisit] = useState<boolean>(false);

  // Mandatory Legal Declarations (Default with click mark = true)
  const [declarationIndependent, setDeclarationIndependent] = useState<boolean>(true);
  const [declarationResponsibility, setDeclarationResponsibility] = useState<boolean>(true);
  const [declarationTerms, setDeclarationTerms] = useState<boolean>(true);

  // Immutable Published Confirmation (Step 3)
  const [publishedRecord, setPublishedRecord] = useState<{
    id: string;
    termsHash: string;
    acceptedAt: string;
  } | null>(null);

  // Safety Reporting Abuse Modal
  const [reportingItem, setReportingItem] = useState<ServiceRentalItem | null>(null);

  // OTP State
  const [otp, setOtp] = useState<string>("");
  const [demoOtpHint, setDemoOtpHint] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Persistent User Profile Session (OLX / Upwork Style)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(getStoredUserProfile());

  // Auto-fill from active user profile on load or profile update
  useEffect(() => {
    const syncProfile = () => {
      const active = getStoredUserProfile();
      setUserProfile(active);
      if (active && active.is_verified) {
        if (active.name) setProviderName(active.name);
        if (active.phone) setPhone(active.phone);
        setMobileVerified(true);
      }
    };
    syncProfile();
    window.addEventListener(PROFILE_EVENT_NAME as any, syncProfile);
    window.addEventListener("storage", syncProfile);
    return () => {
      window.removeEventListener(PROFILE_EVENT_NAME as any, syncProfile);
      window.removeEventListener("storage", syncProfile);
    };
  }, []);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (selectedGroup !== "all" && item.category !== selectedGroup) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesProvider = item.provider_name.toLowerCase().includes(q);
        const matchesType = item.service_type.toLowerCase().includes(q);
        const matchesVillage = item.village.toLowerCase().includes(q);
        if (!matchesProvider && !matchesType && !matchesVillage) return false;
      }
      return true;
    });
  }, [items, selectedGroup, searchQuery]);

  // Reusable direct publish logic (used both by logged-in users directly and after OTP verification)
  const executePublishService = (cleanPhone: string, validName: string) => {
    const now = new Date().toISOString();
    const acceptanceId = `ta_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const termsHash = "SHA256:PROV_TERMS_V1_" + Date.now().toString(36).toUpperCase();

    // 1. Record Immutable Terms Acceptance
    recordTermsAcceptance({
      id: acceptanceId,
      role: "provider",
      terms_type: "provider_terms",
      terms_version: CURRENT_TERMS_VERSION.provider_terms,
      terms_hash: termsHash,
      accepted_at: now,
      mobile_number: cleanPhone,
      mobile_verified_at: now,
      email: userEmail.trim() || null,
      email_verified_at: null,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "Web Browser",
      acceptance_method: "web_checkbox",
      document_snapshot_reference: `snapshot://provider_terms_v1_0/${cleanPhone}/${Date.now()}`
    });

    // 2. Record Code of Conduct Acceptance
    recordTermsAcceptance({
      id: `ta_coc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      role: "provider",
      terms_type: "code_of_conduct",
      terms_version: CURRENT_TERMS_VERSION.code_of_conduct,
      terms_hash: "SHA256:COC_V1_" + Date.now().toString(36).toUpperCase(),
      accepted_at: now,
      mobile_number: cleanPhone,
      mobile_verified_at: now,
      email: userEmail.trim() || null,
      email_verified_at: null,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "Web Browser",
      acceptance_method: "web_checkbox",
      document_snapshot_reference: `snapshot://code_of_conduct_v1_0/${cleanPhone}/${Date.now()}`
    });

    // 3. Save Persistent User Profile & Safety Profile
    const updatedProfile: UserProfile = {
      id: userProfile?.id || `usr_${cleanPhone}`,
      name: validName.trim(),
      phone: cleanPhone,
      is_verified: true,
      avatar_url: userProfile?.avatar_url,
      headline: userProfile?.headline,
      bio: userProfile?.bio,
      created_at: userProfile?.created_at || now,
      updated_at: now
    };
    saveStoredUserProfile(updatedProfile);
    setUserProfile(updatedProfile);

    // 4. Record Audit Event
    recordAuditEvent({
      event_type: "listing_submitted",
      metadata: {
        provider_name: validName.trim(),
        category,
        service_type: serviceType,
        village: village.trim(),
        has_email: Boolean(userEmail.trim()),
        terms_accepted: true,
        mobile: cleanPhone
      }
    });

    const defaultImg = category === "farm_machines" ? "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80" :
                       category === "construction" ? "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80" :
                       category === "transport" ? "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=800&q=80" :
                       category === "events" ? "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80" :
                       category === "hotel_food" ? "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80" :
                       category === "beauty" ? "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80" :
                       category === "education" ? "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80" :
                       category === "professional" ? "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80" :
                       category === "local_shops" ? "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=800&q=80" :
                       category === "pets_animals" ? "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80" :
                       category === "care_services" ? "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=800&q=80" :
                       "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80";

    const newItem: ServiceRentalItem = {
      id: `service-${Date.now()}`,
      provider_name: validName.trim(),
      category,
      service_type: serviceType,
      village: village.trim(),
      price_rate: isFreeVisit ? "ఉచిత విజిట్ (Free Visit)" : (priceRate.startsWith("₹") ? priceRate.trim() : `₹${priceRate.trim()}`),
      machine_details: machineDetails.trim() || undefined,
      available_days: availableDays.trim() || "ప్రతిరోజూ అందుబాటులో ఉంటుంది",
      description: description.trim() || "నమ్మకమైన సేవ మరియు సకాలంలో పని అందించబడును.",
      contact: cleanPhone,
      image: imageUrl.trim() || defaultImg,
      created_at: now
    };

    const updated = [newItem, ...items];
    setItems(updated);
    localStorage.setItem("vaartanow_service_items", JSON.stringify(updated));

    setPublishedRecord({
      id: newItem.id,
      termsHash,
      acceptedAt: now
    });
    setLoading(false);
    setStep(3); // Direct publish to Step 3 without OTP!
  };

  // Step 1: Validate Service Form & Legal Declarations, then Send Live SMS OTP (or publish directly if logged in)
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Mandatory Full Name Validation
    const nameResult = validateAndSanitizeFullName(providerName);
    if (!nameResult.isValid) {
      setErrorMsg(nameResult.error || "దయచేసి మీ నిజమైన పూర్తి పేరును నమోదు చేయండి (* Legal Full Name Required)");
      return;
    }

    // 2. Locality Validation
    if (!village.trim()) {
      setErrorMsg("దయచేసి మీ ప్రాంతం / గ్రామం / పట్టణాన్ని ఎంచుకోండి (* Locality Required)");
      return;
    }

    // 3. Price Rate Validation
    if (!isFreeVisit && !priceRate.trim()) {
      setErrorMsg("దయచేసి చార్జీలు / అద్దె వివరాలను నమోదు చేయండి (* Rate Required)");
      return;
    }

    // 4. Mobile Phone Validation
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length !== 10 || !/^[6-9]/.test(cleanPhone)) {
      setErrorMsg("దయచేసి సరైన 10-అంకెల భారతీయ మొబైల్ నంబర్‌ను ఇవ్వండి (6, 7, 8, లేదా 9 తో ప్రారంభం కావాలి)");
      return;
    }

    // 5. Optional Email Validation
    if (userEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userEmail.trim())) {
        setErrorMsg("దయచేసి సరైన ఇమెయిల్ ఫార్మాట్‌ను ఇవ్వండి (ఉదా: name@example.com) లేదా ఖాళీగా ఉంచండి.");
        return;
      }
    }

    // 6. Mandatory Legal Terms & Disclaimers Check (Must be accepted)
    if (!declarationIndependent || !declarationResponsibility || !declarationTerms) {
      setErrorMsg("దయచేసి ఫారమ్ చివర ఉన్న చట్టపరమైన డిక్లరేషన్లను అంగీకరించండి (Check all declaration boxes to proceed)");
      return;
    }

    setProviderName(nameResult.sanitized);

    // ⚡ OLX-STYLE MULTI-AD SUBMISSION:
    // If the user is already logged in with verified profile, SKIP OTP and publish directly!
    if (userProfile && userProfile.is_verified && userProfile.phone) {
      setLoading(true);
      setErrorMsg("");
      executePublishService(cleanPhone, nameResult.sanitized);
      return;
    }

    // Otherwise, first-time unauthenticated user: Send SMS OTP
    setLoading(true);
    setErrorMsg("");

    recordAuditEvent({
      event_type: "mobile_submitted",
      metadata: { mobile: cleanPhone, provider_name: nameResult.sanitized }
    });

    const res = await sendSMSOTP(cleanPhone);
    setLoading(false);

    if (res.success) {
      setDemoOtpHint(res.otpDemo);
      recordAuditEvent({
        event_type: "otp_sent",
        metadata: { mobile: cleanPhone }
      });
      setStep(2); // Advance to Step 2: OTP Verification
    } else {
      setErrorMsg("SMS OTP పంపడంలో విఫలమైంది. దయచేసి మళ్లీ ప్రయత్నించండి.");
    }
  };

  // Step 2: Resend OTP
  const handleResendOTP = async () => {
    const cleanPhone = phone.replace(/\D/g, "");
    if (!cleanPhone) return;
    setLoading(true);
    setErrorMsg("");
    const res = await sendSMSOTP(cleanPhone);
    setLoading(false);
    if (res.success) {
      setDemoOtpHint(res.otpDemo);
      setErrorMsg("");
    } else {
      setErrorMsg("మళ్లీ OTP పంపడంలో విఫలమైంది.");
    }
  };

  // Step 2: Verify OTP, Record Immutable Terms Acceptance & Publish Service
  const handleVerifyOTPAndPublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || otp.trim().length < 6) {
      setErrorMsg("దయచేసి 6-అంకెల OTP కోడ్‌ను నమోదు చేయండి");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    const verifyRes = await verifySellerOTP(phone, otp, providerName);

    if (!verifyRes.success) {
      setLoading(false);
      setErrorMsg(verifyRes.error || "OTP తప్పుగా ఉంది. దయచేసి సరైన కోడ్‌ను నమోదు చేయండి.");
      return;
    }

    const cleanPhone = phone.replace(/\D/g, "");
    executePublishService(cleanPhone, providerName);
  };

  const handleCloseModal = () => {
    setIsPostModalOpen(false);
    if (step === 3) {
      setStep(1);
      setProviderName("");
      setPriceRate("");
      setDescription("");
      setMachineDetails("");
      setUserEmail("");
      setImageUrl("");
      setPhone("");
      setOtp("");
      setDeclarationIndependent(true);
      setDeclarationResponsibility(true);
      setDeclarationTerms(true);
      setPublishedRecord(null);
    }
  };

  return (
    <div className="bg-[#030712] text-white min-h-screen pb-16">
      <main className="container-shell py-6 space-y-6 animate-in fade-in duration-300">

        {/* Hero Section Banner matching requested title */}
        <div className="rounded-[2.2rem] bg-gradient-to-r from-teal-700 via-cyan-800 to-blue-900 p-6 sm:p-8 text-white shadow-xl flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
          <div className="space-y-2 max-w-xl z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1 text-xs font-black backdrop-blur-md">
              <Wrench className="size-3.5" />
              Services • Workers • Machines • Equipment
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black leading-tight tracking-tight">
              🔧 సేవలు & అద్దెకు (Services & Rentals)
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-cyan-100 leading-relaxed">
              గ్రామాలు & పట్టణాల్లో పనివాళ్లు, ట్రాక్టర్లు, ప్రొక్లైనర్లు, కోత యంత్రాలు, జేసీబీ, శామియానా & స్థానిక అద్దె సేవలు!
            </p>
          </div>

          <div className="z-10">
            <button
              onClick={() => setIsPostModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-white text-teal-700 hover:bg-teal-50 px-6 py-3.5 text-xs sm:text-sm font-black transition-all shadow-xl active:scale-95 cursor-pointer min-h-[46px]"
            >
              <PlusCircle className="size-5 text-teal-700" />
              + మీ సేవను లేదా యంత్రాన్ని జోడించండి
            </button>
          </div>
        </div>

        {/* Customer Safety Notice & Intermediary Disclaimer */}
        <CustomerSafetyNotice category={selectedGroup} />

        {/* 5 Main Group Category Filter Pills */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedGroup("all")}
              className={`rounded-full px-3 py-1.5 text-[11px] sm:text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 min-h-[36px] touch-manipulation active:scale-95 ${
                selectedGroup === "all"
                  ? "bg-teal-600 text-white shadow-md"
                  : "bg-[#111827] border border-[#1f2937] text-gray-300 hover:bg-[#1f2937]"
              }`}
            >
              <span>అన్ని సేవలు (All Services)</span>
            </button>

            {SERVICE_GROUPS.map((group) => {
              const isSel = selectedGroup === group.id;
              return (
                <button
                  key={group.id}
                  onClick={() => setSelectedGroup(group.id)}
                  className={`rounded-full px-3 py-1.5 text-[11px] sm:text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 min-h-[36px] touch-manipulation active:scale-95 ${
                    isSel
                      ? "bg-teal-600 text-white shadow-md"
                      : "bg-[#111827] border border-[#1f2937] text-gray-300 hover:bg-[#1f2937]"
                  }`}
                >
                  <span>{group.title}</span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full">
            <Search className="absolute left-4 top-3.5 size-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="వెతకండి (ట్రాక్టర్, ప్లంబర్, ఎలక్ట్రీషియన్, జేసీబీ, శామియానా, ఆనందపురం)..."
              className="w-full rounded-full border border-[#1f2937] bg-[#111827] py-3 pl-11 pr-4 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[46px]"
            />
          </div>
        </div>

        {/* Services & Rentals Card Grid (Requested Village Rental Format) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredItems.map((item) => {
            const cleanPhone = item.contact.replace(/\D/g, "");
            const whatsappMsg = `Hi ${item.provider_name}, I saw your service/rental listing '${item.service_type}' (${item.price_rate}) on VaartaNow Services & Rentals and want to hire.`;
            const whatsappUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(whatsappMsg)}`;

            return (
              <div
                key={item.id}
                className="rounded-[1.8rem] border border-[#1f2937] bg-[#111827] text-white overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
              >
                {/* Cover Image */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-950">
                  <img
                    src={item.image}
                    alt={item.service_type}
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                  />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-black bg-teal-600 text-white uppercase shadow-sm">
                    🔧 అద్దె & సర్వీస్
                  </span>
                </div>

                {/* Card Body formatted as requested */}
                <div className="p-4 sm:p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    
                    {/* Header Provider & Village */}
                    <div className="flex items-center justify-between border-b border-[#1f2937] pb-2">
                      <h3 className="text-base font-black text-white leading-snug truncate">
                        {item.provider_name}
                      </h3>
                      <span className="text-[11px] font-extrabold text-teal-400 flex items-center gap-1 shrink-0">
                        <MapPin className="size-3.5 text-teal-500" />
                        {item.village}
                      </span>
                    </div>

                    {/* Service Type Tag */}
                    <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs font-black text-teal-300">
                      {item.service_type}
                    </div>

                    {/* Machine Details if present */}
                    {item.machine_details && (
                      <p className="text-[11px] font-bold text-gray-300 flex items-center gap-1">
                        🚜 <strong>యంత్రం వివరాలు:</strong> {item.machine_details}
                      </p>
                    )}

                    {/* Price Rate & Availability */}
                    <div className="flex items-center justify-between text-xs font-bold pt-1">
                      <span className="text-lg font-black text-emerald-400">
                        💰 {item.price_rate}
                      </span>
                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Calendar className="size-3 text-gray-400" />
                        {item.available_days}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-gray-400 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>

                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#1f2937]/70">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
                        <ShieldCheck className="size-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">స్వతంత్ర ప్రొవైడర్ • ✅ మొబైల్ ధృవీకరించబడింది</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setReportingItem(item)}
                        className="text-[10px] font-black text-rose-400 hover:text-rose-300 flex items-center gap-1 shrink-0 transition cursor-pointer hover:underline bg-rose-500/10 px-2 py-1 rounded-md border border-rose-500/20"
                        title="సమస్య లేదా మోసాన్ని రిపోర్ట్ చేయండి"
                      >
                        <AlertTriangle className="size-3 text-rose-400" />
                        <span>రిపోర్ట్</span>
                      </button>
                    </div>
                  </div>

                  {/* Actions (Call & WhatsApp) */}
                  <div className="border-t border-[#1f2937] pt-3 flex items-center justify-between gap-2">
                    <a
                      href={`tel:${cleanPhone}`}
                      className="flex-1 py-2.5 rounded-full bg-[#16a34a] hover:bg-emerald-600 text-white text-xs font-black transition flex items-center justify-center gap-1.5 min-h-[44px]"
                    >
                      <Phone className="size-4" />
                      <span>కాల్ చేయండి</span>
                    </a>

                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-2.5 rounded-full bg-green-600 hover:bg-green-700 text-white text-xs font-black transition flex items-center justify-center gap-1.5 min-h-[44px]"
                    >
                      <MessageCircle className="size-4" />
                      <span>వాట్సాప్</span>
                    </a>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* BOTTOM PROMINENT ACTION BUTTON matching request */}
        <div className="p-8 text-center rounded-[2.2rem] border border-[#1f2937] bg-[#111827] space-y-3 mt-8">
          <h3 className="text-xl font-black text-white">
            మీ వద్ద కూడా ట్రాక్టర్, జేసీబీ, అద్దె యంత్రాలు లేదా సేవలు ఉన్నాయా?
          </h3>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            మీ గ్రామం మరియు చుట్టుపక్కల ప్రజలకు మీ సేవలను ఉచితంగా తెలియజేయండి!
          </p>
          <button
            onClick={() => setIsPostModalOpen(true)}
            className="px-8 py-4 rounded-full bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-black shadow-xl transition cursor-pointer min-h-[48px] active:scale-95"
          >
            ➕ మీ సేవను లేదా యంత్రాన్ని జోడించండి (+ Add Your Service)
          </button>
        </div>

      </main>

      {/* 7-STEP COMPLIANT LIVE SMS VERIFIED SERVICE POSTING MODAL */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-2xl space-y-4 p-5 sm:p-7 max-h-[94vh] overflow-y-auto no-scrollbar">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-1.5">
                  {step === 3 ? (
                    <span className="text-emerald-700 flex items-center gap-1.5">
                      <CheckCircle2 className="size-5 text-emerald-600" />
                      సేవ ప్రచురించబడింది!
                    </span>
                  ) : (
                    <span>+ సర్వీస్ ప్రకటన పోస్ట్ చేయండి</span>
                  )}
                  {step !== 3 && (
                    <span className="text-xs text-slate-500 font-normal hidden sm:inline">(Post Service Listing)</span>
                  )}
                </h3>
                <span className={`px-3 py-1 rounded-full text-[11px] font-bold border shadow-sm ${
                  step === 3 
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                    : step === 1
                    ? "bg-teal-50 text-teal-700 border-teal-200"
                    : "bg-indigo-50 text-indigo-700 border-indigo-200"
                }`}>
                  {step === 3 ? "పూర్తయింది (Complete)" : step === 1 ? "దశ 1/2: వివరాలు & నిబంధనలు (Step 1 of 2)" : "దశ 2/2: SMS OTP ధృవీకరణ (Step 2 of 2)"}
                </span>
              </div>

              <button
                onClick={handleCloseModal}
                className="rounded-full p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold text-center animate-in fade-in">
                ⚠️ {errorMsg}
              </div>
            )}

            {/* STEP 1: SERVICE LISTING FORM WITH DISCLAIMER & TERMS AT BOTTOM */}
            {step === 1 && (
              <form onSubmit={handleSendOTP} className="space-y-3.5 text-xs">
                
                {/* 🌟 Logged-in Profile Badge (OLX Multi-Ad Posting Active) */}
                {userProfile && userProfile.is_verified && (
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center justify-between gap-2 shadow-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="size-8 rounded-full overflow-hidden border border-emerald-500 bg-emerald-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                        {userProfile.avatar_url ? (
                          <img src={userProfile.avatar_url} alt={userProfile.name} className="size-full object-cover" />
                        ) : (
                          <span>{userProfile.name ? userProfile.name.charAt(0).toUpperCase() : "U"}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1 font-black text-xs">
                          <span className="truncate">లాగిన్ అయ్యారు: {userProfile.name}</span>
                          <ShieldCheck className="size-3.5 text-emerald-600 shrink-0" />
                        </div>
                        <p className="text-[10px] text-emerald-700 font-semibold truncate">
                          +91 {userProfile.phone} • OLX తరహాలో నేరుగా పోస్ట్ చేయవచ్చు (No OTP)
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-200 text-emerald-900 shrink-0">
                      OTP ఫ్రీ
                    </span>
                  </div>
                )}

                {/* 1. Provider Full Name */}
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-800 flex items-center gap-1">
                    <User className="size-3.5 text-teal-600" />
                    <span>మీ నిజమైన పూర్తి పేరు (Full Legal Name) <span className="text-red-500">*</span></span>
                  </label>
                  <input
                    type="text"
                    value={providerName}
                    onChange={(e) => setProviderName(e.target.value)}
                    placeholder="ఉదా: రమేష్ బాబు గారపాటి (Ramesh Babu Garapati)"
                    required
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                  />
                  <p className="text-[10px] text-slate-500 font-semibold">
                    కస్టమర్ భద్రత & విశ్వసనీయత కోసం మీ అసలు పేరు నమోదు చేయండి.
                  </p>
                </div>

                {/* 2. Category & Locality */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-extrabold text-slate-800">
                      విభాగం (Category) <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={category}
                      onChange={(e) => {
                        const newCat = e.target.value as ServiceCategory;
                        setCategory(newCat);
                        const group = SERVICE_GROUPS.find((g) => g.id === newCat);
                        if (group && group.items.length > 0) {
                          setServiceType(group.items[0]);
                        }
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-[11px] sm:text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer transition"
                    >
                      {SERVICE_GROUPS.map((grp) => (
                        <option key={grp.id} value={grp.id} className="text-[11px] sm:text-xs py-1" style={{ fontSize: "11.5px" }}>
                          {grp.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <LocationAreaSelector
                    value={village}
                    onChange={setVillage}
                    label="ప్రాంతం / ఏరియా / గ్రామం / పట్టణం (Locality)"
                    placeholder="ఉదా: ఆనందపురం, కూకట్‌పల్లి, విజయవాడ..."
                    required
                  />
                </div>

                {/* 3. Specific Service Dropdown */}
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-800">
                    నిర్దిష్ట సేవ / యంత్రం (Specific Service / Machine) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-[11px] sm:text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer transition"
                  >
                    {(SERVICE_GROUPS.find((g) => g.id === category)?.items || []).map((item) => (
                      <option key={item} value={item} className="text-[11px] sm:text-xs py-1" style={{ fontSize: "11.5px" }}>
                        {item}
                      </option>
                    ))}
                    <option value="ఇతర సేవ / పరికరం (Other Custom Service)" className="text-[11px] sm:text-xs py-1" style={{ fontSize: "11.5px" }}>🔧 ఇతర సేవ / పరికరం (Other Custom Service)</option>
                  </select>
                </div>

                {/* 4. Price & Free Visit */}
                <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-extrabold text-slate-800 flex items-center justify-between">
                      <span>చార్జీలు / అద్దె (Rate in ₹) <span className="text-red-500">*</span></span>
                      <label className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isFreeVisit}
                          onChange={(e) => setIsFreeVisit(e.target.checked)}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        ఉచిత విజిట్ (Free Visit)
                      </label>
                    </label>
                    <input
                      type="text"
                      value={priceRate}
                      onChange={(e) => setPriceRate(e.target.value)}
                      disabled={isFreeVisit}
                      placeholder={isFreeVisit ? "ఉచిత విజిట్ (Free Visit)" : "ఉదా: ₹1,500/day లేదా ₹500/hour"}
                      required={!isFreeVisit}
                      className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50 transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold text-amber-700 flex items-center gap-1">
                      <Tag className="size-3 text-amber-600" />
                      యంత్ర మోడల్ / ఆఫర్ Tag <span className="text-slate-500 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={machineDetails}
                      onChange={(e) => setMachineDetails(e.target.value)}
                      placeholder="ఉదా: Mahindra 575 DI లేదా 15% OFF"
                      className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* 5. Description */}
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-800">
                    వివరణ (Description - Optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    placeholder="మీ సేవలు, అనుభవం, పని వేళలు మరియు పని సమయాల పూర్తి వివరాలు..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                  />
                </div>

                {/* 6. Photo Upload */}
                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-800">
                    ఫోటో (Photo Upload - Optional)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="relative flex flex-col items-center justify-center p-2.5 rounded-2xl border-2 border-dashed border-teal-300 bg-teal-50/60 hover:bg-teal-100/70 transition cursor-pointer group shadow-sm">
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                      <Camera className="size-4 text-teal-600 group-hover:scale-110 transition mb-0.5" />
                      <span className="text-[10px] font-black text-teal-700">కెమెరా (Camera)</span>
                    </label>

                    <label className="relative flex flex-col items-center justify-center p-2.5 rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/60 hover:bg-emerald-100/70 transition cursor-pointer group shadow-sm">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                      <ImageIcon className="size-4 text-emerald-600 group-hover:scale-110 transition mb-0.5" />
                      <span className="text-[10px] font-black text-emerald-700">గ్యాలరీ (Gallery)</span>
                    </label>
                  </div>

                  {imageUrl && (
                    <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-slate-200 mt-1 shadow-sm">
                      <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImageUrl("")}
                        className="absolute top-2 right-2 rounded-full bg-slate-900/80 p-1 text-white hover:bg-black transition cursor-pointer"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* 7. Optional Email */}
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-800 flex items-center justify-between">
                    <span>ఇమెయిల్ చిరునామా (Email - Optional)</span>
                    <span className="text-emerald-700 text-[10px] font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">ఐచ్ఛికం</span>
                  </label>
                  <input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                  />
                </div>

                {/* 8. AT THE END OF FORM, BEFORE UPDATING MOBILE NUMBER: DISCLAIMER & TERMS AND CONDITIONS ACCEPTANCE (DEFAULT CHECKED) */}
                <div className="space-y-2.5 p-3.5 rounded-2xl border border-indigo-200 bg-indigo-50/50">
                  <div className="flex items-center gap-1.5 font-black text-indigo-950 text-xs">
                    <FileCheck className="size-4 text-indigo-600" />
                    <span>చట్టపరమైన డిక్లరేషన్లు & నిబంధనల అంగీకారం (Legal Terms & Disclaimer)</span>
                  </div>

                  {/* Declaration 1: Independent Service Provider */}
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={declarationIndependent}
                      onChange={(e) => setDeclarationIndependent(e.target.checked)}
                      className="mt-0.5 size-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer shrink-0"
                    />
                    <div className="text-[11px] leading-relaxed text-slate-800 font-bold">
                      <span className="text-teal-950 font-black">1. స్వతంత్ర సర్వీస్ ప్రొవైడర్ డిక్లరేషన్:</span> నేను స్వతంత్ర సేవా ప్రదాతనని/విక్రేతనని, VaartaNow ఉద్యోగిని లేదా ఏజెంట్‌ను కాదని ధృవీకరిస్తున్నాను. (Independent Provider declaration)
                    </div>
                  </label>

                  {/* Declaration 2: Quality & Safety Responsibility */}
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={declarationResponsibility}
                      onChange={(e) => setDeclarationResponsibility(e.target.checked)}
                      className="mt-0.5 size-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer shrink-0"
                    />
                    <div className="text-[11px] leading-relaxed text-slate-800 font-bold">
                      <span className="text-teal-950 font-black">2. నాణ్యత & భద్రతా బాధ్యత:</span> నేను అందించే సేవల నాణ్యత, పనితనం, ధర మరియు కస్టమర్ భద్రతకు నేనే స్వయంగా బాధ్యుడను. (Sole responsibility for service quality, pricing & safety)
                    </div>
                  </label>

                  {/* Declaration 3: Terms & Code of Conduct */}
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={declarationTerms}
                      onChange={(e) => setDeclarationTerms(e.target.checked)}
                      className="mt-0.5 size-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer shrink-0"
                    />
                    <div className="text-[11px] leading-relaxed text-slate-800 font-bold">
                      <span className="text-teal-950 font-black">3. నిబంధనలు & ప్రవర్తనా నియమావళి:</span> నేను VaartaNow{" "}
                      <Link to="/provider-terms" target="_blank" className="text-teal-700 underline font-black">
                        సేవా ప్రదాత నిబంధనలు (Provider Terms)
                      </Link>
                      {" "}మరియు{" "}
                      <Link to="/provider-code-of-conduct" target="_blank" className="text-teal-700 underline font-black">
                        ప్రవర్తనా నియమావళి (Code of Conduct)
                      </Link>
                      {" "}ని చదివి, పూర్తిగా అంగీకరిస్తున్నాను.
                    </div>
                  </label>
                </div>

                {/* 9. MOBILE NUMBER INPUT (UPDATING MOBILE NUMBER) */}
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-800 flex items-center justify-between">
                    <span>మొబైల్ నంబర్ (WhatsApp / Phone Number) <span className="text-red-500">*</span></span>
                    <span className="text-[10px] text-slate-500 font-bold">భారతదేశం (+91)</span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-xs font-black text-slate-500 select-none">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      placeholder="9876543210"
                      maxLength={10}
                      required
                      className="w-full pl-11 rounded-xl border border-slate-300 bg-slate-50 p-3 text-xs font-black text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 font-semibold">ఈ నంబర్‌కు Live SMS OTP పంపబడుతుంది. కస్టమర్లు మిమ్మల్ని సంప్రదించడానికి కూడా ఇదే నంబర్ ఉపయోగపడుతుంది.</p>
                </div>

                {/* SUBMIT BUTTON ➔ SEND OTP OR DIRECT PUBLISH IF LOGGED IN */}
                <button
                  type="submit"
                  disabled={loading || !declarationIndependent || !declarationResponsibility || !declarationTerms}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-teal-600 via-emerald-600 to-indigo-600 hover:from-teal-700 hover:via-emerald-700 hover:to-indigo-700 text-white font-black text-sm shadow-xl shadow-teal-500/25 transition flex items-center justify-center gap-2 cursor-pointer min-h-[48px] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    "ప్రక్రియ జరుగుతోంది..."
                  ) : userProfile && userProfile.is_verified ? (
                    "🚀 సేవను నేరుగా ప్రచురించండి (Publish Service Directly - No OTP)"
                  ) : (
                    "Live SMS OTP పొందండి ➔ (Send OTP)"
                  )}
                </button>
              </form>
            )}

            {/* STEP 2: SMS OTP VERIFICATION */}
            {step === 2 && (
              <form onSubmit={handleVerifyOTPAndPublish} className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-center space-y-1.5">
                  <div className="flex items-center justify-center gap-1.5 font-black text-emerald-800 text-sm">
                    <ShieldCheck className="size-5 text-emerald-600" />
                    <span>SMS OTP పంపబడింది (OTP Sent)</span>
                  </div>
                  <p className="text-xs font-bold text-emerald-900">
                    📩 <strong>+91 {phone}</strong> మొబైల్‌కి 6-అంకెల OTP పంపబడింది.
                  </p>
                  {demoOtpHint && (
                    <p className="text-[11px] text-emerald-700 font-bold bg-emerald-100/70 py-1 px-2 rounded-lg inline-block">
                      డెమో కోడ్: <span className="font-black text-sm text-emerald-900">{demoOtpHint}</span> (లేదా 123456)
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-800 text-center block">
                    6-అంకెల OTP కోడ్‌ను ఇక్కడ నమోదు చేయండి <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="123456"
                    maxLength={6}
                    autoFocus
                    required
                    className="w-full text-center tracking-[0.4em] text-2xl font-black rounded-xl border border-slate-300 bg-slate-50 p-3.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm shadow-xl shadow-emerald-500/25 transition flex items-center justify-center gap-2 cursor-pointer min-h-[48px] active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? "ధృవీకరిస్తున్నాము..." : "✅ OTP ధృవీకరించు & సేవను ప్రచురించు (Verify OTP & Publish Service)"}
                </button>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-bold">
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={loading}
                    className="text-teal-600 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>🔄 మళ్లీ OTP పంపండి (Resend OTP)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setOtp("");
                      setErrorMsg("");
                    }}
                    className="text-slate-500 hover:text-slate-800 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>← వివరాలను సవరించండి (Edit Details)</span>
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: IMMUTABLE AUDIT CONFIRMATION & PUBLISHED RECEIPT */}
            {step === 3 && publishedRecord && (
              <div className="space-y-4 text-xs animate-in zoom-in-95 duration-200">
                <div className="p-5 rounded-3xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 text-center space-y-2">
                  <div className="size-12 rounded-full bg-emerald-600 text-white mx-auto flex items-center justify-center shadow-lg shadow-emerald-600/30">
                    <CheckCircle2 className="size-7" />
                  </div>
                  <h4 className="text-base sm:text-lg font-black text-emerald-900">
                    🎉 మీ సేవ విజయవంతంగా ప్రచురించబడింది!
                  </h4>
                  <p className="text-xs font-bold text-emerald-800">
                    మీ ప్రకటన ఇప్పుడు VaartaNow లో ప్రత్యక్షంగా కనిపిస్తోంది.
                  </p>
                </div>

                {/* Immutable Audit Details Card */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2 text-[11px] font-bold text-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                    <span className="text-slate-500">సర్వీస్ ప్రొవైడర్:</span>
                    <span className="font-black text-slate-900">{providerName}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                    <span className="text-slate-500">ధృవీకరించబడిన మొబైల్:</span>
                    <span className="font-black text-emerald-700 flex items-center gap-1">
                      <ShieldCheck className="size-3 text-emerald-600" />
                      +91 {phone} (✅ Verified)
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                    <span className="text-slate-500">సేవా రకం / ప్రాంతం:</span>
                    <span className="font-black text-slate-900 truncate max-w-[200px]">{serviceType} • {village}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                    <span className="text-slate-500">చట్టపరమైన ఒప్పందం:</span>
                    <span className="font-black text-indigo-700">provider_terms_v1_0 (IT Rules 2021)</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                    <span className="text-slate-500">డిజిటల్ ఆడిట్ హాష్:</span>
                    <span className="font-mono text-[10px] text-slate-600">{publishedRecord.termsHash.slice(0, 26)}...</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">ఆమోదించిన సమయం:</span>
                    <span className="text-slate-600">{new Date(publishedRecord.acceptedAt).toLocaleString("te-IN")}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <Link
                    to="/legal-agreements"
                    onClick={handleCloseModal}
                    className="w-full py-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-900 font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <FileCheck className="size-4 text-indigo-600" />
                    <span>📜 మీ చట్టపరమైన ఒప్పందాన్ని చూడండి (/legal-agreements)</span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-xl shadow-emerald-500/25 transition cursor-pointer min-h-[48px] active:scale-[0.98]"
                  >
                    పూర్తయింది ➔ జాబితాను చూడండి (Done / View Listing)
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* SAFETY REPORTING ABUSE MODAL */}
      <ReportAbuseModal
        isOpen={Boolean(reportingItem)}
        onClose={() => setReportingItem(null)}
        targetProviderName={reportingItem?.provider_name}
        targetMobile={reportingItem?.contact}
        targetListingId={reportingItem?.id}
      />

    </div>
  );
}
