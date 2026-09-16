// 🛠️ Mana Adda Services & Rentals API Engine
import { supabase, hasSupabaseEnv } from "./supabase";
import type { 
  ServiceCategoryItem, 
  ServiceSubcategoryItem, 
  ServiceProvider, 
  ServiceSearchFilters,
  ServiceReport,
  ServiceReview
} from "@/types/services";

// Earth radius in km for Haversine distance calculation
function calculateHaversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// 🏷️ 15 BROAD CATEGORIES (Matching Reference Image & Specification)
export const SERVICE_CATEGORIES: ServiceCategoryItem[] = [
  {
    id: "home_services",
    slug: "home-services",
    name_te: "ఇంటి సేవలు",
    name_en: "Home Services",
    icon_name: "Home",
    color_bg: "bg-amber-50 dark:bg-amber-950/40",
    color_text: "text-amber-700 dark:text-amber-300",
    color_border: "border-amber-200 dark:border-amber-800/40",
    image_url: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80",
    subcategories_count: 14,
    is_popular: true,
    sort_order: 1
  },
  {
    id: "repairs_technicians",
    slug: "repairs-technicians",
    name_te: "రిపేర్ & టెక్నీషియన్",
    name_en: "Repairs & Technicians",
    icon_name: "Wrench",
    color_bg: "bg-blue-50 dark:bg-blue-950/40",
    color_text: "text-blue-700 dark:text-blue-300",
    color_border: "border-blue-200 dark:border-blue-800/40",
    image_url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=400&q=80",
    subcategories_count: 13,
    is_popular: true,
    sort_order: 2
  },
  {
    id: "vehicle_services",
    slug: "vehicle-services",
    name_te: "వాహన సేవలు",
    name_en: "Vehicle Services",
    icon_name: "Car",
    color_bg: "bg-rose-50 dark:bg-rose-950/40",
    color_text: "text-rose-700 dark:text-rose-300",
    color_border: "border-rose-200 dark:border-rose-800/40",
    image_url: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=400&q=80",
    subcategories_count: 11,
    is_popular: true,
    sort_order: 3
  },
  {
    id: "agriculture_farm",
    slug: "agriculture-farm",
    name_te: "వ్యవసాయ సేవలు",
    name_en: "Agriculture & Farm",
    icon_name: "Tractor",
    color_bg: "bg-emerald-50 dark:bg-emerald-950/40",
    color_text: "text-emerald-700 dark:text-emerald-300",
    color_border: "border-emerald-200 dark:border-emerald-800/40",
    image_url: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=400&q=80",
    subcategories_count: 15,
    is_popular: true,
    sort_order: 4
  },
  {
    id: "transport_drivers",
    slug: "transport-drivers",
    name_te: "డ్రైవర్లు & రవాణా",
    name_en: "Transport & Drivers",
    icon_name: "Truck",
    color_bg: "bg-orange-50 dark:bg-orange-950/40",
    color_text: "text-orange-700 dark:text-orange-300",
    color_border: "border-orange-200 dark:border-orange-800/40",
    image_url: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=400&q=80",
    subcategories_count: 10,
    is_popular: true,
    sort_order: 5
  },
  {
    id: "construction_labour",
    slug: "construction-labour",
    name_te: "కన్‌స్ట్రక్షన్ & కూలీలు",
    name_en: "Construction & Labour",
    icon_name: "HardHat",
    color_bg: "bg-yellow-50 dark:bg-yellow-950/40",
    color_text: "text-yellow-700 dark:text-yellow-300",
    color_border: "border-yellow-200 dark:border-yellow-800/40",
    image_url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80",
    subcategories_count: 12,
    sort_order: 6
  },
  {
    id: "cleaning_help",
    slug: "cleaning-help",
    name_te: "క్లీనింగ్ & హౌస్ హెల్ప్",
    name_en: "Cleaning & Home Help",
    icon_name: "Sparkles",
    color_bg: "bg-teal-50 dark:bg-teal-950/40",
    color_text: "text-teal-700 dark:text-teal-300",
    color_border: "border-teal-200 dark:border-teal-800/40",
    image_url: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80",
    subcategories_count: 10,
    sort_order: 7
  },
  {
    id: "beauty_personal",
    slug: "beauty-personal",
    name_te: "బ్యూటీ & వ్యక్తిగత సేవలు",
    name_en: "Beauty & Personal",
    icon_name: "Scissors",
    color_bg: "bg-pink-50 dark:bg-pink-950/40",
    color_text: "text-pink-700 dark:text-pink-300",
    color_border: "border-pink-200 dark:border-pink-800/40",
    image_url: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&q=80",
    subcategories_count: 9,
    sort_order: 8
  },
  {
    id: "education_training",
    slug: "education-training",
    name_te: "విద్య & శిక్షణ",
    name_en: "Education & Training",
    icon_name: "GraduationCap",
    color_bg: "bg-indigo-50 dark:bg-indigo-950/40",
    color_text: "text-indigo-700 dark:text-indigo-300",
    color_border: "border-indigo-200 dark:border-indigo-800/40",
    image_url: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=400&q=80",
    subcategories_count: 11,
    sort_order: 9
  },
  {
    id: "events_functions",
    slug: "events-functions",
    name_te: "ఈవెంట్స్ & ఫంక్షన్",
    name_en: "Events & Functions",
    icon_name: "PartyPopper",
    color_bg: "bg-red-50 dark:bg-red-950/40",
    color_text: "text-red-700 dark:text-red-300",
    color_border: "border-red-200 dark:border-red-800/40",
    image_url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=400&q=80",
    subcategories_count: 12,
    sort_order: 10
  },
  {
    id: "health_care",
    slug: "health-care",
    name_te: "ఆరోగ్యం & సంరక్షణ",
    name_en: "Health & Care",
    icon_name: "HeartPulse",
    color_bg: "bg-emerald-50 dark:bg-emerald-950/40",
    color_text: "text-emerald-700 dark:text-emerald-300",
    color_border: "border-emerald-200 dark:border-emerald-800/40",
    image_url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=400&q=80",
    subcategories_count: 8,
    sort_order: 11
  },
  {
    id: "professional_doc",
    slug: "professional-doc",
    name_te: "డాక్యుమెంట్స్ & ప్రొఫెషనల్",
    name_en: "Professional & Documents",
    icon_name: "FileText",
    color_bg: "bg-sky-50 dark:bg-sky-950/40",
    color_text: "text-sky-700 dark:text-sky-300",
    color_border: "border-sky-200 dark:border-sky-800/40",
    image_url: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=400&q=80",
    subcategories_count: 13,
    sort_order: 12
  },
  {
    id: "moving_delivery",
    slug: "moving-delivery",
    name_te: "షిఫ్టింగ్ & డెలివరీ",
    name_en: "Moving & Delivery",
    icon_name: "Package",
    color_bg: "bg-amber-50 dark:bg-amber-950/40",
    color_text: "text-amber-700 dark:text-amber-300",
    color_border: "border-amber-200 dark:border-amber-800/40",
    image_url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80",
    subcategories_count: 8,
    sort_order: 13
  },
  {
    id: "animal_pet",
    slug: "animal-pet",
    name_te: "జంతు & పెట్ సేవలు",
    name_en: "Animal & Pet Care",
    icon_name: "Dog",
    color_bg: "bg-purple-50 dark:bg-purple-950/40",
    color_text: "text-purple-700 dark:text-purple-300",
    color_border: "border-purple-200 dark:border-purple-800/40",
    image_url: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=400&q=80",
    subcategories_count: 8,
    sort_order: 14
  },
  {
    id: "local_shops",
    slug: "local-shops",
    name_te: "దుకాణాలు & స్థానిక వ్యాపారాలు",
    name_en: "Local Shops & Businesses",
    icon_name: "Store",
    color_bg: "bg-rose-50 dark:bg-rose-950/40",
    color_text: "text-rose-700 dark:text-rose-300",
    color_border: "border-rose-200 dark:border-rose-800/40",
    image_url: "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?auto=format&fit=crop&w=400&q=80",
    subcategories_count: 12,
    sort_order: 15
  }
];

// 🚜 RENTALS SPECIFIC CATEGORIES (Mode: Rentals)
export const RENTAL_CATEGORIES: ServiceCategoryItem[] = [
  {
    id: "tractor_rental",
    slug: "tractor-rental",
    name_te: "ట్రాక్టర్ అద్దెకు",
    name_en: "Tractor Rental",
    icon_name: "Tractor",
    color_bg: "bg-emerald-50 dark:bg-emerald-950/40",
    color_text: "text-emerald-700 dark:text-emerald-300",
    image_url: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=400&q=80",
    subcategories_count: 6,
    is_rental: true,
    sort_order: 1
  },
  {
    id: "jcb_rental",
    slug: "jcb-rental",
    name_te: "JCB & ఎక్స్‌కవేటర్ అద్దెకు",
    name_en: "JCB & Earthmover Rental",
    icon_name: "HardHat",
    color_bg: "bg-yellow-50 dark:bg-yellow-950/40",
    color_text: "text-yellow-700 dark:text-yellow-300",
    image_url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80",
    subcategories_count: 5,
    is_rental: true,
    sort_order: 2
  },
  {
    id: "vehicle_rental",
    slug: "vehicle-rental",
    name_te: "కార్ / ఆటో / వ్యాన్ అద్దెకు",
    name_en: "Vehicle Rental",
    icon_name: "Car",
    color_bg: "bg-blue-50 dark:bg-blue-950/40",
    color_text: "text-blue-700 dark:text-blue-300",
    image_url: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=400&q=80",
    subcategories_count: 8,
    is_rental: true,
    sort_order: 3
  },
  {
    id: "tent_furniture_rental",
    slug: "tent-furniture-rental",
    name_te: "టెంట్ హౌస్ & కుర్చీలు అద్దెకు",
    name_en: "Tent & Furniture Rental",
    icon_name: "PartyPopper",
    color_bg: "bg-rose-50 dark:bg-rose-950/40",
    color_text: "text-rose-700 dark:text-rose-300",
    image_url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=400&q=80",
    subcategories_count: 6,
    is_rental: true,
    sort_order: 4
  },
  {
    id: "sound_dj_rental",
    slug: "sound-dj-rental",
    name_te: "సౌండ్ సిస్టమ్ & మైక్ సెట్",
    name_en: "Sound & DJ Rental",
    icon_name: "Volume2",
    color_bg: "bg-purple-50 dark:bg-purple-950/40",
    color_text: "text-purple-700 dark:text-purple-300",
    image_url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80",
    subcategories_count: 4,
    is_rental: true,
    sort_order: 5
  },
  {
    id: "construction_machinery_rental",
    slug: "construction-machinery-rental",
    name_te: "నిర్మాణ మిషన్లు (మిక్సర్, వైబ్రేటర్)",
    name_en: "Construction Tools Rental",
    icon_name: "Wrench",
    color_bg: "bg-amber-50 dark:bg-amber-950/40",
    color_text: "text-amber-700 dark:text-amber-300",
    image_url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80",
    subcategories_count: 6,
    is_rental: true,
    sort_order: 6
  }
];

// 📋 SUBCATEGORIES FOR EACH BROAD CATEGORY
export const SERVICE_SUBCATEGORIES: ServiceSubcategoryItem[] = [
  // 1. Home Services
  { id: "sub_electrician", category_id: "home_services", slug: "electrician", name_te: "ఎలక్ట్రీషియన్", name_en: "Electrician", icon_name: "Zap", image_url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=400&q=80", description_te: "వైరింగ్, ఫ్యాన్లు, లైట్లు, ఇన్వర్టర్ ఫిట్టింగ్ & రిపేర్", sort_order: 1 },
  { id: "sub_plumber", category_id: "home_services", slug: "plumber", name_te: "ప్లంబర్", name_en: "Plumber", icon_name: "Droplets", image_url: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80", description_te: "పైప్ లైన్, మోటార్ ఫిట్టింగ్, లీకేజ్ రిపేర్, ట్యాప్స్", sort_order: 2 },
  { id: "sub_carpenter", category_id: "home_services", slug: "carpenter", name_te: "కార్పెంటర్ / వడ్రంగి", name_en: "Carpenter", icon_name: "Hammer", image_url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=400&q=80", description_te: "తలుపులు, కిటికీలు, కప్‌బోర్డ్స్, వుడెన్ ఫర్నిచర్ పనులు", sort_order: 3 },
  { id: "sub_painter", category_id: "home_services", slug: "painter", name_te: "పెయింటర్", name_en: "Painter", icon_name: "Paintbrush", image_url: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=400&q=80", description_te: "ఇంటి లోపల & బయట రంగులు, పుట్టీ, వాటర్‌ప్రూఫింగ్", sort_order: 4 },
  { id: "sub_mason", category_id: "home_services", slug: "mason", name_te: "మేసన్ / నిర్మాణం", name_en: "Mason / Brick Work", icon_name: "BrickWall", image_url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80", description_te: "గోడ నిర్మాణం, ప్లాస్టరింగ్, చిన్న మరమ్మతులు", sort_order: 5 },
  { id: "sub_tiles", category_id: "home_services", slug: "tiles", name_te: "టైల్ & ఫ్లోరింగ్", name_en: "Tiles & Flooring", icon_name: "Grid", image_url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80", description_te: "టైల్స్ వేయడం, మార్బుల్ పాలిషింగ్, గ్రానైట్ వర్క్", sort_order: 6 },
  { id: "sub_ro_service", category_id: "home_services", slug: "ro-service", name_te: "RO వాటర్ ప్యూరిఫైర్", name_en: "RO Water Purifier", icon_name: "Filter", image_url: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=400&q=80", description_te: "RO సర్వీసింగ్, ఫిల్టర్ మార్చడం, ఇన్స్టాలేషన్", sort_order: 7 },
  { id: "sub_tank_cleaning", category_id: "home_services", slug: "tank-cleaning", name_te: "వాటర్ ట్యాంక్ క్లీనింగ్", name_en: "Water Tank Cleaning", icon_name: "Trash2", image_url: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80", description_te: "సింటెక్స్ ట్యాంక్, సంప్ క్లీనింగ్, క్రిమిసంహారక శుభ్రత", sort_order: 8 },
  { id: "sub_welding", category_id: "home_services", slug: "welding", name_te: "వెల్డింగ్ & ఫ్యాబ్రికేషన్", name_en: "Welding & Fabrication", icon_name: "Flame", image_url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80", description_te: "గేట్లు, గ్రిల్స్, షెడ్లు, ఐరన్ వెల్డింగ్ పనులు", sort_order: 9 },
  { id: "sub_other_home", category_id: "home_services", slug: "other-home", name_te: "ఇతర ఇంటి సేవలు", name_en: "Other Home Services", icon_name: "MoreHorizontal", image_url: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80", description_te: "ఇంటికి సంబంధించిన ఇతర అన్ని సాధారణ పనులు", sort_order: 10 },

  // 2. Repairs & Technicians
  { id: "sub_tv_repair", category_id: "repairs_technicians", slug: "tv-repair", name_te: "TV Repair (టీవీ రిపేర్)", name_en: "TV Repair", icon_name: "Tv", image_url: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=400&q=80", description_te: "LED, LCD, Smart TV ప్యానెల్ & మదర్‌బోర్డ్ రిపేర్", sort_order: 1 },
  { id: "sub_ac_repair", category_id: "repairs_technicians", slug: "ac-repair", name_te: "AC Repair (ఏసీ సర్వీస్)", name_en: "AC Repair", icon_name: "Wind", image_url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=400&q=80", description_te: "గ్యాస్ ఫిల్లింగ్, క్లీనింగ్, కూలింగ్ సమస్యలు, ఇన్స్టాలేషన్", sort_order: 2 },
  { id: "sub_fridge_repair", category_id: "repairs_technicians", slug: "fridge-repair", name_te: "Refrigerator (ఫ్రిజ్ రిపేర్)", name_en: "Refrigerator Repair", icon_name: "Archive", image_url: "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&w=400&q=80", description_te: "సింగిల్ & డబుల్ డోర్ ఫ్రిజ్ గ్యాస్, కంప్రెసర్ రిపేర్", sort_order: 3 },
  { id: "sub_washing_machine", category_id: "repairs_technicians", slug: "washing-machine", name_te: "Washing Machine (వాషింగ్ మెషిన్)", name_en: "Washing Machine Repair", icon_name: "RefreshCw", image_url: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=400&q=80", description_te: "ఆటోమేటిక్ & సెమీ ఆటోమేటిక్ వాషింగ్ మెషిన్ రిపేర్", sort_order: 4 },
  { id: "sub_mobile_repair", category_id: "repairs_technicians", slug: "mobile-repair", name_te: "Mobile Repair (మొబైల్)", name_en: "Mobile Phone Repair", icon_name: "Smartphone", image_url: "https://images.unsplash.com/photo-1585060544812-6b45742d762f?auto=format&fit=crop&w=400&q=80", description_te: "డిస్‌ప్లే మార్పు, బ్యాటరీ, ఛార్జింగ్ పిన్, సాఫ్ట్‌వేర్", sort_order: 5 },
  { id: "sub_cctv", category_id: "repairs_technicians", slug: "cctv", name_te: "CCTV కెమెరాలు", name_en: "CCTV Installation & Repair", icon_name: "Camera", image_url: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=400&q=80", description_te: "CCTV కెమెరా ఫిక్సింగ్, వైరింగ్, మొబైల్ కనెక్టివిటీ", sort_order: 6 },
  { id: "sub_inverter", category_id: "repairs_technicians", slug: "inverter", name_te: "Inverter & Battery", name_en: "Inverter & Battery Service", icon_name: "BatteryCharging", image_url: "https://images.unsplash.com/photo-1508873696983-2df570464756?auto=format&fit=crop&w=400&q=80", description_te: "ఇన్వర్టర్ సర్వీస్, బ్యాటరీ వాటర్, కొత్త సెటప్", sort_order: 7 },

  // 3. Vehicle Services
  { id: "sub_bike_mechanic", category_id: "vehicle_services", slug: "bike-mechanic", name_te: "బైక్ మెకానిక్", name_en: "Bike Mechanic", icon_name: "Bike", image_url: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=400&q=80", description_te: "ఆయిల్ ఛేంజ్, బ్రేక్స్, ఇంజిన్ రిపేర్, సర్వీసింగ్", sort_order: 1 },
  { id: "sub_car_mechanic", category_id: "vehicle_services", slug: "car-mechanic", name_te: "కార్ మెకానిక్", name_en: "Car Mechanic", icon_name: "Car", image_url: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=400&q=80", description_te: "జనరల్ సర్వీస్, ఇంజిన్, గేర్‌బాక్స్, బ్రేక్స్ రిపేర్", sort_order: 2 },
  { id: "sub_puncture", category_id: "vehicle_services", slug: "puncture", name_te: "టైర్ & పంక్చర్ సేవలు", name_en: "Tyre & Puncture Repair", icon_name: "CircleDot", image_url: "https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=400&q=80", description_te: "ట్యూబ్‌లెస్ పంక్చర్, ఎయిర్, కొత్త టైర్లు", sort_order: 3 },
  { id: "sub_auto_mechanic", category_id: "vehicle_services", slug: "auto-mechanic", name_te: "ఆటో రిక్షా రిపేర్", name_en: "Auto Rickshaw Mechanic", icon_name: "Navigation", image_url: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=400&q=80", description_te: "3-వీలర్ ఆటో ఇంజిన్, వైరింగ్, సర్వీస్", sort_order: 4 },

  // 4. Agriculture & Farm (Priority for Villages)
  { id: "sub_tractor_service", category_id: "agriculture_farm", slug: "tractor-service", name_te: "ట్రాక్టర్ దుక్కి / పనులు", name_en: "Tractor Ploughing & Work", icon_name: "Tractor", image_url: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=400&q=80", description_te: "పొలం దున్నడం, రోటవేటర్, లెవలింగ్ పనులు", sort_order: 1 },
  { id: "sub_jcb_farm", category_id: "agriculture_farm", slug: "jcb-farm", name_te: "JCB భూమి లెవలింగ్ / పనులు", name_en: "JCB Earthmoving", icon_name: "HardHat", image_url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80", description_te: "పొలం గట్లు, చెరువులు, మట్టి తోలకం, లెవలింగ్", sort_order: 2 },
  { id: "sub_harvester", category_id: "agriculture_farm", slug: "harvester", name_te: "వరి కోత మిషన్ (Harvester)", name_en: "Crop Harvester", icon_name: "Combine", image_url: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=400&q=80", description_te: "వరి, మొక్కజొన్న కోత & నూర్పిడి మిషన్లు", sort_order: 3 },
  { id: "sub_farm_labour", category_id: "agriculture_farm", slug: "farm-labour", name_te: "వ్యవసాయ కూలీలు", name_en: "Farm Labour Group", icon_name: "Users", image_url: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=400&q=80", description_te: "నాట్లు, కలుపు తీత, కోతలు, తోట పనులు", sort_order: 4 },
  { id: "sub_borewell", category_id: "agriculture_farm", slug: "borewell", name_te: "బోర్‌వెల్ & మోటార్లు", name_en: "Borewell & Motor Service", icon_name: "Drill", image_url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80", description_te: "బోర్ వేయడం, సబ్‌మెర్సిబుల్ మోటార్ ఫిక్సింగ్", sort_order: 5 },
  { id: "sub_sprayer", category_id: "agriculture_farm", slug: "sprayer", name_te: "మందుల పిచికారీ (Sprayer)", name_en: "Spraying Machine", icon_name: "ShieldAlert", image_url: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=400&q=80", description_te: "బ్యాటరీ/ట్రాక్టర్ స్ప్రేయర్, క్రిమిసంహారక మందులు", sort_order: 6 },

  // 5. Transport & Drivers
  { id: "sub_car_driver", category_id: "transport_drivers", slug: "car-driver", name_te: "కార్ డ్రైవర్", name_en: "Car Driver", icon_name: "UserCheck", image_url: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=400&q=80", description_te: "లోకల్ & అవుట్‌స్టేషన్ డ్రైవింగ్, రోజువారీ / ట్రిప్ డ్రైవర్", sort_order: 1 },
  { id: "sub_goods_auto", category_id: "transport_drivers", slug: "goods-auto", name_te: "గూడ్స్ ఆటో / లోడింగ్", name_en: "Goods Auto / Loading", icon_name: "Truck", image_url: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=400&q=80", description_te: "సరుకులు, ధాన్యం, సామగ్రి లోడింగ్ & రవాణా", sort_order: 2 },
  { id: "sub_mini_truck", category_id: "transport_drivers", slug: "mini-truck", name_te: "మినీ ట్రక్ (Tata Ace / Bolero)", name_en: "Mini Truck / Pickup", icon_name: "Truck", image_url: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=400&q=80", description_te: "ఇంటి సామాన్లు, వ్యవసాయ ఉత్పత్తుల రవాణా", sort_order: 3 },

  // 10. Events & Functions
  { id: "sub_caterer", category_id: "events_functions", slug: "caterer", name_te: "వంట మాస్టర్ & క్యాటరింగ్", name_en: "Catering & Cook Master", icon_name: "UtensilsCrossed", image_url: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=400&q=80", description_te: "శుభకార్యాలు, ఫంక్షన్లకు రుచికరమైన భోజనం & వంటలు", sort_order: 1 },
  { id: "sub_tent_house", category_id: "events_functions", slug: "tent-house", name_te: "టెంట్ హౌస్ & డెకరేషన్", name_en: "Tent House & Decor", icon_name: "Tent", image_url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=400&q=80", description_te: "షామియానా, వేదిక అలంకరణ, లైటింగ్, కుర్చీలు", sort_order: 2 },
  { id: "sub_photographer", category_id: "events_functions", slug: "photographer", name_te: "ఫొటో & వీడియో గ్రాఫర్", name_en: "Photo & Videography", icon_name: "Camera", image_url: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=400&q=80", description_te: "పెళ్లిళ్లు, బర్త్‌డే, ఫంక్షన్ల ఫొటో & డ్రోన్ షూట్", sort_order: 3 }
];

// 🌟 RICH MOCK SEED DATABASE (Authentic AP/TS Providers matching Screenshot 5 & 6)
export const SEED_SERVICE_PROVIDERS: ServiceProvider[] = [
  {
    id: "sp_electrician_1",
    name: "శ్రీ సాయి ఎలక్ట్రికల్ వర్క్స్",
    business_name: "శ్రీ సాయి ఎలక్ట్రికల్ & ప్లంబింగ్ సర్వీసెస్",
    phone: "9876543210",
    whatsapp: "9876543210",
    phone_verified: true,
    category_id: "home_services",
    category_name_te: "ఇంటి సేవలు",
    subcategory_id: "sub_electrician",
    subcategory_name_te: "ఎలక్ట్రీషియన్",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    photos: [
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80"
    ],
    locality: "మధురవాడ (Madhurawada)",
    village_town: "విశాఖపట్నం",
    mandal: "మధురవాడ",
    district: "Visakhapatnam",
    state: "Andhra Pradesh",
    lat: 17.8184,
    lon: 83.3512,
    distance_km: 3.0,
    service_radius_km: 25,
    service_mode: "both",
    price_type: "starting_from",
    price_from: 300,
    price_rate_label: "₹300 నుండి",
    pricing_breakdown: [
      { service_name: "Fan Installation / ఫ్యాన్ బిగింపు", price_rate: "₹300 నుండి" },
      { service_name: "Light Fitting / లైట్లు అమర్చడం", price_rate: "₹200 నుండి" },
      { service_name: "Wiring (per point) / వైరింగ్ పాయింట్", price_rate: "₹150 నుండి" },
      { service_name: "Inverter Setup / ఇన్వర్టర్ కనెక్షన్", price_rate: "₹500 నుండి" },
      { service_name: "Emergency Repair / ఎమర్జెన్సీ మరమ్మత్తు", price_rate: "₹400 నుండి" }
    ],
    services_offered: [
      "Fan Installation",
      "Light Fitting",
      "Wiring & Repair",
      "Inverter Installation",
      "Emergency Support",
      "MCB & Switchboard Repair"
    ],
    experience_years: 5,
    rating: 4.8,
    review_count: 120,
    description_te: "మా దగ్గర అన్ని రకాల హోమ్ వైరింగ్, ఫ్యాన్లు, లైటింగ్, ఇన్వర్టర్ కనెక్షన్ మరియు ఎలక్ట్రికల్ మరమ్మతులు నమ్మకంగా చేసి ఇవ్వబడును. 25 కి.మీ పరిధిలో మీ ఇంటి వద్దకే వస్తాము.",
    working_hours: "ఉదయం 8:00 - రాత్రి 8:30 (ప్రతిరోజూ అందుబాటులో)",
    is_available_now: true,
    created_at: new Date().toISOString()
  },
  {
    id: "sp_electrician_2",
    name: "విజయ్ ఎలక్ట్రీషియన్",
    business_name: "విజయ్ హోమ్ సర్వీసెస్",
    phone: "9876543211",
    whatsapp: "9876543211",
    phone_verified: true,
    category_id: "home_services",
    category_name_te: "ఇంటి సేవలు",
    subcategory_id: "sub_electrician",
    subcategory_name_te: "ఎలక్ట్రీషియన్",
    avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    photos: [
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80"
    ],
    locality: "గాజువాక (Gajuwaka)",
    village_town: "విశాఖపట్నం",
    mandal: "గాజువాక",
    district: "Visakhapatnam",
    state: "Andhra Pradesh",
    lat: 17.6908,
    lon: 83.2082,
    distance_km: 5.0,
    service_radius_km: 20,
    service_mode: "customer_location",
    price_type: "starting_from",
    price_from: 250,
    price_rate_label: "₹250 నుండి",
    pricing_breakdown: [
      { service_name: "Fan, Light, Wiring / ఫ్యాన్, లైట్", price_rate: "₹250 నుండి" },
      { service_name: "Inverter Fitting / ఇన్వర్టర్ ఫిట్టింగ్", price_rate: "₹450 నుండి" }
    ],
    services_offered: [
      "Fan Repair",
      "Light Fitting",
      "Switchboard Change",
      "Short Circuit Fix"
    ],
    experience_years: 4,
    rating: 4.6,
    review_count: 89,
    description_te: "అత్యవసర ఎలక్ట్రికల్ మరమ్మతులకు వెంటనే వస్తాము. గాజువాక మరియు పరిసర ప్రాంతాలలో నాణ్యమైన సర్వీస్ అందించబడును.",
    working_hours: "ఉదయం 7:30 - రాత్రి 9:00",
    is_available_now: true,
    created_at: new Date().toISOString()
  },
  {
    id: "sp_electrician_3",
    name: "రామకృష్ణ ఎలక్ట్రికల్ సర్వీసెస్",
    business_name: "రామకృష్ణ ఎలక్ట్రికల్స్ & ఏసీ రిపేర్",
    phone: "9876543212",
    whatsapp: "9876543212",
    phone_verified: true,
    category_id: "home_services",
    category_name_te: "ఇంటి సేవలు",
    subcategory_id: "sub_electrician",
    subcategory_name_te: "ఎలక్ట్రీషియన్",
    avatar_url: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80",
    photos: [
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80"
    ],
    locality: "భీమునిపట్నం (Bheemili)",
    village_town: "భీమునిపట్నం",
    mandal: "భీమిలి",
    district: "Visakhapatnam",
    state: "Andhra Pradesh",
    lat: 17.8914,
    lon: 83.4542,
    distance_km: 8.0,
    service_radius_km: 30,
    service_mode: "both",
    price_type: "starting_from",
    price_from: 400,
    price_rate_label: "₹400 నుండి",
    pricing_breakdown: [
      { service_name: "AC, Fridge, Wiring / ఏసీ, ఫ్రిజ్, వైరింగ్", price_rate: "₹400 నుండి" },
      { service_name: "Home Service Charge / హోమ్ సర్వీస్", price_rate: "₹200" }
    ],
    services_offered: [
      "AC Repair",
      "Fridge Repair",
      "Wiring",
      "Home Service"
    ],
    experience_years: 7,
    rating: 4.5,
    review_count: 64,
    description_te: "భీమిలి మరియు ఆనందపురం ప్రాంతాల్లో ఎలక్ట్రికల్ మరియు గృహోపకరణాల రిపేర్ నిపుణులు.",
    working_hours: "ఉదయం 8:00 - రాత్రి 8:00",
    is_available_now: false,
    created_at: new Date().toISOString()
  },
  {
    id: "sp_tractor_1",
    name: "అప్పారావు ట్రాక్టర్ సర్వీసెస్",
    business_name: "శ్రీ వీరాంజనేయ ట్రాక్టర్ & వ్యవసాయ పనులు",
    phone: "9876543213",
    whatsapp: "9876543213",
    phone_verified: true,
    category_id: "agriculture_farm",
    category_name_te: "వ్యవసాయ సేవలు",
    subcategory_id: "sub_tractor_service",
    subcategory_name_te: "ట్రాక్టర్ దుక్కి / పనులు",
    avatar_url: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80",
    photos: [
      "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80"
    ],
    locality: "సబ్బవరం (Sabbavaram)",
    village_town: "సబ్బవరం",
    mandal: "సబ్బవరం",
    district: "Anakapalle",
    state: "Andhra Pradesh",
    lat: 17.7946,
    lon: 83.1362,
    distance_km: 2.5,
    service_radius_km: 35,
    service_mode: "customer_location",
    price_type: "hourly",
    price_from: 900,
    price_rate_label: "₹900/గంటకు",
    pricing_breakdown: [
      { service_name: "రోటవేటర్ దుక్కి (Rotavator)", price_rate: "₹1,200/గంట" },
      { service_name: "కల్టివేటర్ దుక్కి (Cultivator)", price_rate: "₹900/గంట" },
      { service_name: "మట్టి లెవలింగ్ & గట్లు", price_rate: "₹1,000/గంట" }
    ],
    services_offered: [
      "రోటవేటర్",
      "కల్టివేటర్",
      "ట్రాలీ సరుకుల రవాణా",
      "లెవలింగ్"
    ],
    experience_years: 10,
    rating: 4.9,
    review_count: 156,
    description_te: "సబ్బవరం, పెందుర్తి మరియు అనకాపల్లి పరిసర గ్రామాల్లో వ్యవసాయ పనులకు జాన్ డీర్ ట్రాక్టర్ సేవలు అందుబాటులో ఉన్నాయి.",
    working_hours: "ఉదయం 6:00 - రాత్రి 8:00",
    is_available_now: true,
    created_at: new Date().toISOString()
  },
  {
    id: "sp_plumber_1",
    name: "శ్రీనివాస్ ప్లంబింగ్ వర్క్స్",
    business_name: "సాయి రామ్ ప్లంబింగ్ & శానిటరీ",
    phone: "9876543214",
    whatsapp: "9876543214",
    phone_verified: true,
    category_id: "home_services",
    category_name_te: "ఇంటి సేవలు",
    subcategory_id: "sub_plumber",
    subcategory_name_te: "ప్లంబర్",
    avatar_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
    photos: [
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80"
    ],
    locality: "ఎంవీపీ కాలనీ (MVP Colony)",
    village_town: "విశాఖపట్నం",
    mandal: "విశాఖపట్నం",
    district: "Visakhapatnam",
    state: "Andhra Pradesh",
    lat: 17.7424,
    lon: 83.3352,
    distance_km: 4.2,
    service_radius_km: 25,
    service_mode: "both",
    price_type: "starting_from",
    price_from: 200,
    price_rate_label: "₹200 నుండి",
    pricing_breakdown: [
      { service_name: "ట్యాప్ & పైప్ లీకేజ్ రిపేర్", price_rate: "₹200 నుండి" },
      { service_name: "వాటర్ మోటార్ ఫిట్టింగ్", price_rate: "₹500 నుండి" },
      { service_name: "బాత్‌రూమ్ ఫిట్టింగ్స్ & గీజర్", price_rate: "₹400 నుండి" }
    ],
    services_offered: [
      "Pipe Leakage Repair",
      "Tap & Valve Replacement",
      "Motor Installation",
      "Geyser Connection"
    ],
    experience_years: 8,
    rating: 4.7,
    review_count: 94,
    description_te: "ఎటువంటి ప్లంబింగ్ సమస్యకైనా తక్షణ పరిష్కారం. కొత్త ఇళ్ల ప్లంబింగ్ వర్క్ మరియు రిపేర్లు నైపుణ్యంతో చేయబడును.",
    working_hours: "ఉదయం 8:00 - రాత్రి 9:00",
    is_available_now: true,
    created_at: new Date().toISOString()
  }
];

// Helper to get stored custom user-listed services from localStorage
const LOCAL_STORAGE_SERVICES_KEY = "mana_adda_custom_services";
const LOCAL_STORAGE_BOOKMARKS_KEY = "mana_adda_saved_services";

export function getCustomServices(): ServiceProvider[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_SERVICES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomService(service: ServiceProvider): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getCustomServices();
    const updated = [service, ...existing.filter((s) => s.id !== service.id)];
    localStorage.setItem(LOCAL_STORAGE_SERVICES_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn("Failed to save custom service to storage:", err);
  }
}

export function getBookmarkedProviderIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_BOOKMARKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleBookmarkProvider(id: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const existing = getBookmarkedProviderIds();
    const isBookmarked = existing.includes(id);
    const updated = isBookmarked ? existing.filter((item) => item !== id) : [...existing, id];
    localStorage.setItem(LOCAL_STORAGE_BOOKMARKS_KEY, JSON.stringify(updated));
    return !isBookmarked;
  } catch {
    return false;
  }
}

// 🚀 API FUNCTIONS
export async function getServiceCategories(mode: "services" | "rentals" = "services"): Promise<ServiceCategoryItem[]> {
  return mode === "rentals" ? RENTAL_CATEGORIES : SERVICE_CATEGORIES;
}

export async function getServiceSubcategories(categoryId?: string): Promise<ServiceSubcategoryItem[]> {
  if (!categoryId) return SERVICE_SUBCATEGORIES;
  return SERVICE_SUBCATEGORIES.filter((sub) => sub.category_id === categoryId);
}

export async function searchServiceProviders(filters: ServiceSearchFilters = {}): Promise<{
  providers: ServiceProvider[];
  total: number;
  suggestExpandedRadius?: boolean;
}> {
  const custom = getCustomServices();
  let allProviders = [...custom, ...SEED_SERVICE_PROVIDERS];

  // Try Supabase if available
  if (hasSupabaseEnv && supabase) {
    try {
      let query = supabase.from("service_providers").select("*").eq("status", "approved");
      if (filters.categoryId) query = query.eq("category_id", filters.categoryId);
      if (filters.subcategoryId) query = query.eq("subcategory_id", filters.subcategoryId);
      const { data } = await query;
      if (data && data.length > 0) {
        allProviders = [...custom, ...data];
      }
    } catch (e) {
      console.warn("Supabase service fetch error, falling back to local dataset:", e);
    }
  }

  // Filter by Category
  if (filters.categoryId) {
    allProviders = allProviders.filter((p) => p.category_id === filters.categoryId);
  }

  // Filter by Subcategory
  if (filters.subcategoryId) {
    allProviders = allProviders.filter((p) => p.subcategory_id === filters.subcategoryId);
  }

  // Filter by Available Now
  if (filters.availableNowOnly) {
    allProviders = allProviders.filter((p) => p.is_available_now);
  }

  // Filter by Search Query (Telugu / English)
  if (filters.query && filters.query.trim().length > 0) {
    const q = filters.query.toLowerCase().trim();
    allProviders = allProviders.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.business_name && p.business_name.toLowerCase().includes(q)) ||
        p.category_name_te.toLowerCase().includes(q) ||
        p.subcategory_name_te.toLowerCase().includes(q) ||
        p.locality.toLowerCase().includes(q) ||
        p.village_town.toLowerCase().includes(q) ||
        p.description_te.toLowerCase().includes(q) ||
        p.services_offered.some((s) => s.toLowerCase().includes(q))
    );
  }

  // Distance Calculation if reference coordinates exist
  const refLat = filters.lat || 17.8184; // Default Visakhapatnam region
  const refLon = filters.lon || 83.3512;
  const radiusKm = filters.radiusKm || 10;

  allProviders = allProviders.map((p) => {
    const distance = calculateHaversineDistanceKm(refLat, refLon, p.lat, p.lon);
    return {
      ...p,
      distance_km: distance
    };
  });

  // Filter by distance radius if specified and not 0 (0 = all distances)
  let matchingInRadius = allProviders;
  if (radiusKm > 0) {
    matchingInRadius = allProviders.filter((p) => (p.distance_km || 0) <= radiusKm);
  }

  const suggestExpandedRadius = matchingInRadius.length === 0 && allProviders.length > 0;
  const resultList = matchingInRadius.length > 0 ? matchingInRadius : allProviders;

  // Sorting
  if (filters.sortBy === "rating") {
    resultList.sort((a, b) => b.rating - a.rating);
  } else if (filters.sortBy === "price_asc") {
    resultList.sort((a, b) => (a.price_from || 0) - (b.price_from || 0));
  } else if (filters.sortBy === "available") {
    resultList.sort((a, b) => (b.is_available_now ? 1 : 0) - (a.is_available_now ? 1 : 0));
  } else {
    // Default: Sort by distance
    resultList.sort((a, b) => (a.distance_km || 0) - (b.distance_km || 0));
  }

  return {
    providers: resultList,
    total: resultList.length,
    suggestExpandedRadius
  };
}

export async function getServiceProviderDetails(providerId: string): Promise<ServiceProvider | null> {
  const custom = getCustomServices();
  const found = custom.find((p) => p.id === providerId) || SEED_SERVICE_PROVIDERS.find((p) => p.id === providerId);
  return found || null;
}

export async function submitServiceReport(report: ServiceReport): Promise<{ success: boolean; message: string }> {
  if (hasSupabaseEnv && supabase) {
    try {
      await supabase.from("service_reports").insert([report]);
    } catch (e) {
      console.warn("Report submission remote error:", e);
    }
  }
  return {
    success: true,
    message: "మీ ఫిర్యాదు నమోదు చేయబడింది. మా భద్రతా విభాగం దీనిని త్వరలోనే పరిశీలిస్తుంది."
  };
}

export async function submitServiceReview(review: ServiceReview): Promise<{ success: boolean }> {
  if (hasSupabaseEnv && supabase) {
    try {
      await supabase.from("service_reviews").insert([review]);
    } catch (e) {
      console.warn("Review submission remote error:", e);
    }
  }
  return { success: true };
}
