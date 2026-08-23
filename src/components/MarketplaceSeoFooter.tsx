import React, { useState } from "react";
import { Search, MapPin, Globe, Sparkles, Building, Smartphone, Car, Sofa, Sprout, ShieldCheck } from "lucide-react";

type SeoCategory = "mobiles" | "vehicles" | "furniture" | "property" | "agriculture";

export function MarketplaceSeoFooter() {
  const [activeTab, setActiveTab] = useState<SeoCategory>("mobiles");

  const seoData: Record<SeoCategory, {
    coastalAP: { label: string; area: string }[];
    northAndhra: { label: string; area: string }[];
    rayalaseema: { label: string; area: string }[];
    telangana: { label: string; area: string }[];
  }> = {
    mobiles: {
      coastalAP: [
        { label: "Used iPhone 13 in Vijayawada (Benz Circle)", area: "Vijayawada West" },
        { label: "Second hand laptops in Guntur (Lakshmipuram)", area: "Guntur East" },
        { label: "5G Smartphones in Kakinada (Main Road)", area: "Kakinada City" },
        { label: "Used iPad & Tablets in Rajahmundry", area: "Rajahmundry Urban" },
        { label: "Refurbished Mobiles in Eluru & Ongole", area: "Eluru Constituency" },
        { label: "Budget Smartphones in Machilipatnam & Tenali", area: "Tenali Constituency" }
      ],
      northAndhra: [
        { label: "Used iPhone 14 in Vizag (Madhurawada)", area: "Bheemili Constituency" },
        { label: "Second hand laptops in Vizag (MVP Colony)", area: "Visakhapatnam East" },
        { label: "Used Samsung Galaxy in Gajuwaka", area: "Gajuwaka Constituency" },
        { label: "5G Mobiles in Vizianagaram (Ring Road)", area: "Vizianagaram City" },
        { label: "Smartwatches & Accessories in Srikakulam", area: "Srikakulam Town" },
        { label: "Camera & Lenses in Anakapalli & Araku", area: "Anakapalli Mandal" }
      ],
      rayalaseema: [
        { label: "Used iPhones in Tirupati (Alipiri & KT Road)", area: "Tirupati Constituency" },
        { label: "Second hand Laptops in Kurnool (Rajvihar)", area: "Kurnool City" },
        { label: "Used Samsung 5G in Kadapa (Seven Roads)", area: "Kadapa Town" },
        { label: "Refurbished Mobiles in Anantapur (Clock Tower)", area: "Anantapur Urban" },
        { label: "Smartphones in Chittoor & Nandyal Mandal", area: "Nandyal Town" },
        { label: "Tablets & iPads in Hindupur & Proddatur", area: "Hindupur Constituency" }
      ],
      telangana: [
        { label: "Used iPhone 14 Pro in Hyderabad (Gachibowli)", area: "Serilingampally" },
        { label: "Refurbished Laptops in HITEC City & Madhapur", area: "Kukatpally Constituency" },
        { label: "5G Mobiles in Secunderabad & Ameerpet", area: "Sanathnagar" },
        { label: "Second hand Mobiles in Warangal & Kazipet", area: "Warangal Urban" },
        { label: "Used Mobiles in Karimnagar & Nizamabad", area: "Karimnagar Town" },
        { label: "Budget Smartphones in Khammam & Siddipet", area: "Siddipet Constituency" }
      ]
    },
    vehicles: {
      coastalAP: [
        { label: "Hero Splendor 2022 in Vijayawada (MG Road)", area: "Vijayawada Central" },
        { label: "Second Hand Scooty in Guntur (Brodipet)", area: "Guntur West" },
        { label: "Used Maruti Swift in Kakinada & Rajahmundry", area: "Rajahmundry City" },
        { label: "Royal Enfield Bullet in Eluru & Ongole", area: "Ongole Constituency" },
        { label: "Pre-owned Cars in Tenali & Bhimavaram", area: "Bhimavaram Town" },
        { label: "Used Honda Activa in Machilipatnam & Tuni", area: "Tuni Mandal" }
      ],
      northAndhra: [
        { label: "Second Hand Bikes in Vizag (Gajuwaka)", area: "Gajuwaka Constituency" },
        { label: "Used Scooty in Madhurawada & Yendada", area: "Bheemili Constituency" },
        { label: "Used Hyundai i20 in MVP Colony & Beach Road", area: "Vizag South" },
        { label: "TVS Jupiter in Vizianagaram (RTC Complex)", area: "Vizianagaram Urban" },
        { label: "Used Commercial Autos in Srikakulam", area: "Srikakulam Rural" },
        { label: "Pre-owned SUVs in Anakapalli & Pendurthi", area: "Pendurthi Constituency" }
      ],
      rayalaseema: [
        { label: "Used Bikes in Tirupati (Bairagipatteda)", area: "Tirupati Urban" },
        { label: "Second Hand Cars in Kurnool (Ballari Chowk)", area: "Kurnool Constituency" },
        { label: "Royal Enfield in Kadapa (RTI Road)", area: "Kadapa City" },
        { label: "Used Hero Splendor in Anantapur", area: "Anantapur City" },
        { label: "Tractor & Commercial Vehicles in Nandyal", area: "Nandyal Rural" },
        { label: "Pre-owned Swift Dzire in Chittoor & Hindupur", area: "Chittoor Town" }
      ],
      telangana: [
        { label: "Used Luxury Cars in Hyderabad (Jubilee Hills)", area: "Jubilee Hills" },
        { label: "Second Hand Bikes in Kukatpally & KPHB", area: "Kukatpally Constituency" },
        { label: "Pre-owned Swift in Dilsukhnagar & LB Nagar", area: "LB Nagar" },
        { label: "Used Honda Activa in Warangal & Hanamkonda", area: "Warangal West" },
        { label: "Bikes & Cars in Karimnagar & Nizamabad", area: "Nizamabad Urban" },
        { label: "Used SUVs in Khammam & Siddipet Mandal", area: "Khammam Constituency" }
      ]
    },
    furniture: {
      coastalAP: [
        { label: "Teak Wood Sofa Set in Vijayawada (Governorpet)", area: "Vijayawada Central" },
        { label: "Office Chairs in Guntur (Arundelpet)", area: "Guntur West" },
        { label: "Dining Table & Chairs in Kakinada", area: "Kakinada Town" },
        { label: "Used Refrigerator & AC in Rajahmundry", area: "Rajahmundry Urban" },
        { label: "Wooden Almirah in Eluru & Ongole", area: "Eluru Constituency" },
        { label: "Washing Machines in Tenali & Machilipatnam", area: "Tenali Town" }
      ],
      northAndhra: [
        { label: "Teak Wood Furniture in Vizag (Gajuwaka)", area: "Gajuwaka Constituency" },
        { label: "Used Sofa Sets in MVP Colony & Seethammadhara", area: "Visakhapatnam North" },
        { label: "King Size Bed & Mattress in Madhurawada", area: "Bheemili" },
        { label: "Home Appliances in Vizianagaram", area: "Vizianagaram Town" },
        { label: "Used Air Conditioners in Srikakulam", area: "Srikakulam Urban" },
        { label: "Office Furniture in Pendurthi & Anakapalli", area: "Anakapalli Town" }
      ],
      rayalaseema: [
        { label: "Teak Wood Sofa Set in Tirupati (MR Palli)", area: "Tirupati City" },
        { label: "Used Refrigerators in Kurnool (Nandyal Road)", area: "Kurnool Urban" },
        { label: "Double Bed & Almirah in Kadapa", area: "Kadapa Town" },
        { label: "Washing Machines in Anantapur (Subhash Road)", area: "Anantapur Constituency" },
        { label: "Dining Tables in Chittoor & Nandyal", area: "Chittoor City" },
        { label: "Office Desks in Hindupur & Proddatur", area: "Proddatur Town" }
      ],
      telangana: [
        { label: "Living Room Sofas in Hyderabad (Gachibowli)", area: "Serilingampally" },
        { label: "Modular Kitchen Units in HITEC City", area: "Kondapur" },
        { label: "Used Refrigerator & AC in Kukatpally", area: "Kukatpally" },
        { label: "Teak Furniture in Warangal & Hanamkonda", area: "Warangal City" },
        { label: "Office Desks & Chairs in Karimnagar", area: "Karimnagar Urban" },
        { label: "Home Furniture in Nizamabad & Khammam", area: "Khammam Town" }
      ]
    },
    property: {
      coastalAP: [
        { label: "2BHK Flat for Rent in Vijayawada (Tadepalli)", area: "Mangalagiri Constituency" },
        { label: "Commercial Office Space in Guntur", area: "Guntur East" },
        { label: "Residential Plots for Sale in Kakinada", area: "Kakinada Rural" },
        { label: "Independent Houses in Rajahmundry", area: "Rajahmundry Rural" },
        { label: "Agricultural Land in Eluru & West Godavari", area: "Eluru Mandal" },
        { label: "Houses for Rent in Ongole & Machilipatnam", area: "Ongole Town" }
      ],
      northAndhra: [
        { label: "Rental Flats in Vizag (Madhurawada & Yendada)", area: "Bheemili Constituency" },
        { label: "Sea View Apartments in Vizag (Beach Road)", area: "Visakhapatnam East" },
        { label: "Flats for Sale in Vizag (Gajuwaka & Steel Plant)", area: "Gajuwaka" },
        { label: "Residential Plots in Vizianagaram (Bhogapuram)", area: "Bhogapuram Mandal" },
        { label: "House for Rent in Srikakulam Town", area: "Srikakulam Constituency" },
        { label: "Gated Community Flats in Pendurthi", area: "Pendurthi" }
      ],
      rayalaseema: [
        { label: "2BHK Flat for Rent in Tirupati (Renigunta Road)", area: "Tirupati Constituency" },
        { label: "Commercial Space in Kurnool (Rajvihar)", area: "Kurnool City" },
        { label: "Houses for Rent in Kadapa (RTI Circle)", area: "Kadapa City" },
        { label: "Plots for Sale in Anantapur & Hindupur", area: "Anantapur Urban" },
        { label: "Agricultural Land in Nandyal & Chittoor", area: "Nandyal Constituency" },
        { label: "Rental Homes in Proddatur & Madanapalle", area: "Madanapalle Town" }
      ],
      telangana: [
        { label: "3BHK Luxury Flats in Hyderabad (Gachibowli)", area: "Serilingampally" },
        { label: "2BHK Gated Flats in Kukatpally & Miyapur", area: "Kukatpally" },
        { label: "Plots for Sale in Hyderabad (Shadnagar & ORR)", area: "Maheshwaram" },
        { label: "Flats & Villas for Sale in Warangal", area: "Warangal Urban" },
        { label: "Commercial Office in Karimnagar & Nizamabad", area: "Karimnagar Town" },
        { label: "House for Rent in Siddipet & Khammam", area: "Siddipet Constituency" }
      ]
    },
    agriculture: {
      coastalAP: [
        { label: "రైతు బియ్యం బస్తాలు (Sona Masoori Rice in Vijayawada)", area: "Vijayawada Rural" },
        { label: "మిర్చి & పప్పుల అమ్మకం (Chilli & Pulses in Guntur)", area: "Guntur Rural" },
        { label: "కోనసీమ కొబ్బరి & అరటి (Coconut & Banana in Kakinada)", area: "Konaseema Region" },
        { label: "వరి నాట్లు & ధాన్యం (Paddy Grain in Godavari)", area: "Rajahmundry Rural" },
        { label: "వేరుశనగ & పొగాకు (Groundnut & Tobacco in Ongole)", area: "Ongole Mandal" },
        { label: "చేపల పెంపకం & రొయ్యల రవాణా (Aquaculture in Bhimavaram)", area: "Bhimavaram Mandal" }
      ],
      northAndhra: [
        { label: "అరకు ఆర్గానిక్ కాఫీ & తేనె (Araku Organic Coffee)", area: "Araku Valley" },
        { label: "జీడిపప్పు & పనస తొనలు (Cashew Nuts in Palasa & Srikakulam)", area: "Palasa Mandal" },
        { label: "ఉసిరి & అటవీ ఉత్పత్తులు (Forest Produce in Vizianagaram)", area: "Salur Mandal" },
        { label: "చెరకు & బెల్లం (Sugarcane & Jaggery in Anakapalli)", area: "Anakapalli Mandal" },
        { label: "ఆర్గానిక్ కూరగాయలు (Organic Veggies in Madhurawada)", area: "Bheemili" },
        { label: "రైతు పంటల హోల్‌సేల్ మార్కెట్ (Vizag Farmers Market)", area: "Visakhapatnam Rural" }
      ],
      rayalaseema: [
        { label: "అనంతపురం నాణ్యమైన వేరుశనగలు (Groundnuts in Anantapur)", area: "Anantapur Rural" },
        { label: "స్వచ్ఛమైన కొత్త చింతపండు & పప్పులు (Tamarind in Kadapa)", area: "Kadapa Rural" },
        { label: "ఎర్ర చందనం & టమాటా మార్కెట్ (Tomato Market in Madanapalle)", area: "Madanapalle" },
        { label: "తిరుపతి మామిడి తోటలు (Mango Orchards in Chittoor)", area: "Chittoor Rural" },
        { label: "కర్నూలు మిరపకాయల యార్డ్ (Kurnool Chilli Yard)", area: "Kurnool Mandal" },
        { label: "నంద్యాల వరి & శనగలు (Nandyal Paddy & Bengal Gram)", area: "Nandyal Rural" }
      ],
      telangana: [
        { label: "వరంగల్ మిర్చి యార్డ్ (Warangal Chilli Market)", area: "Warangal Rural" },
        { label: "నిజామాబాద్ పసుపు పంట (Turmeric Market in Nizamabad)", area: "Nizamabad Rural" },
        { label: "కరీంనగర్ పత్తి & ధాన్యం (Cotton & Paddy in Karimnagar)", area: "Karimnagar Rural" },
        { label: "ఖమ్మం శనగలు & జొన్నలు (Maize & Pulses in Khammam)", area: "Khammam Rural" },
        { label: "సిద్దిపేట ఆర్గానిక్ కూరగాయలు (Organic Produce in Siddipet)", area: "Siddipet Rural" },
        { label: "మహబూబ్‌నగర్ వేరుశనగ పంట (Mahbubnagar Groundnut)", area: "Mahbubnagar" }
      ]
    }
  };

  const tagCloud = [
    "🌾 రైతు సోనా మసూరి బియ్యం (Vijayawada & Godavari)",
    "📱 Used iPhones in Madhurawada (Vizag)",
    "🏠 2BHK Flats for rent in Gachibowli (Hyderabad)",
    "🛋️ Teak wood sofa set in Gajuwaka (Vizag)",
    "🚗 Used Suzuki cars in Hyderabad & Warangal",
    "🌶️ గుంటూరు నాణ్యమైన మిర్చి యార్డ్ (Guntur Chilli)",
    "🔧 Electrician & Plumber services in Vizag & Vijayawada",
    "💼 Software Jobs in Madhurawada & HITEC City",
    "☕ అరకు ఆర్గానిక్ కాఫీ (Araku Valley)",
    "🏍️ Hero Splendor 2022 model (Tirupati & Kurnool)",
    "🏢 Commercial space in Siripuram & MG Road Vijayawada",
    "💻 Refurbished Dell laptops in Kukatpally & Ameerpet",
    "🥭 చిత్తూర్ మామిడి తోటల పంట (Chittoor Mangoes)",
    "🥜 అనంతపురం పల్లీలు & శనగలు (Anantapur Groundnut)",
    "🟡 నిజామాబాద్ పసుపు మార్కెట్ (Nizamabad Turmeric)"
  ];

  return (
    <footer className="mt-12 rounded-[2.2rem] border border-[#1f2937] bg-[#111827] text-white p-6 sm:p-8 space-y-6 shadow-md">
      
      {/* Footer Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1f2937] pb-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-black text-[#2563eb] uppercase tracking-widest">
            <Globe className="size-3.5" />
            AP & Telangana Hyperlocal SEO Directory
          </span>
          <h3 className="text-lg font-black text-white mt-0.5">
            ఆంధ్రప్రదేశ్ & తెలంగాణ స్థానిక శోధన డైరెక్టరీ (AP & TS Directory)
          </h3>
          <p className="text-xs font-semibold text-gray-400">
            ముఖ్య నగరాలు, నియోజకవర్గాలు & మండల కేంద్రాల వ్యాప్తంగా స్థానిక సేవలు & ప్రకటనలు
          </p>
        </div>

        {/* 5 Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: "mobiles", label: "📱 Mobiles & Electronics" },
            { id: "vehicles", label: "🚗 Bikes & Cars" },
            { id: "furniture", label: "🛋️ Furniture & Home" },
            { id: "property", label: "🏠 Real Estate & Property" },
            { id: "agriculture", label: "🌾 వ్యవసాయం & రైతు పంటలు" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SeoCategory)}
              className={`px-4 py-2 rounded-full text-xs font-black transition cursor-pointer whitespace-nowrap min-h-[44px] touch-manipulation active:scale-95 ${
                activeTab === tab.id
                  ? "bg-[#2563eb] text-white shadow-sm"
                  : "bg-[#030712] text-gray-400 border border-[#1f2937] hover:bg-[#1f2937] hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4-Column Zonal AP & Telangana Regional Directory */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 pt-2">
        
        {/* Column 1: అమరావతి & కోస్తా ఆంధ్ర (Amaravati & Coastal AP) */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-black text-white flex items-center justify-between border-b border-[#1f2937] pb-2">
            <span className="flex items-center gap-1.5">
              <MapPin className="size-3.5 text-[#2563eb]" />
              1. అమరావతి & కోస్తా ఆంధ్ర
            </span>
            <span className="text-[10px] text-gray-500">Coastal AP</span>
          </h4>
          <ul className="space-y-2 text-xs font-semibold text-gray-400">
            {seoData[activeTab].coastalAP.map((item, idx) => (
              <li key={idx} className="hover:text-[#2563eb] transition cursor-pointer py-0.5 space-y-0.5">
                <p className="truncate text-white hover:text-[#2563eb]">• {item.label}</p>
                <p className="text-[10px] text-gray-500 font-normal pl-2">📍 {item.area}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 2: ఉత్తరాంధ్ర (North Andhra) */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-black text-white flex items-center justify-between border-b border-[#1f2937] pb-2">
            <span className="flex items-center gap-1.5">
              <MapPin className="size-3.5 text-[#16a34a]" />
              2. ఉత్తరాంధ్ర (North Andhra)
            </span>
            <span className="text-[10px] text-gray-500">Vizag Zone</span>
          </h4>
          <ul className="space-y-2 text-xs font-semibold text-gray-400">
            {seoData[activeTab].northAndhra.map((item, idx) => (
              <li key={idx} className="hover:text-[#2563eb] transition cursor-pointer py-0.5 space-y-0.5">
                <p className="truncate text-white hover:text-[#2563eb]">• {item.label}</p>
                <p className="text-[10px] text-gray-500 font-normal pl-2">📍 {item.area}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: రాయలసీమ (Rayalaseema) */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-black text-white flex items-center justify-between border-b border-[#1f2937] pb-2">
            <span className="flex items-center gap-1.5">
              <MapPin className="size-3.5 text-amber-500" />
              3. రాయలసీమ (Rayalaseema)
            </span>
            <span className="text-[10px] text-gray-500">Seema Zone</span>
          </h4>
          <ul className="space-y-2 text-xs font-semibold text-gray-400">
            {seoData[activeTab].rayalaseema.map((item, idx) => (
              <li key={idx} className="hover:text-[#2563eb] transition cursor-pointer py-0.5 space-y-0.5">
                <p className="truncate text-white hover:text-[#2563eb]">• {item.label}</p>
                <p className="text-[10px] text-gray-500 font-normal pl-2">📍 {item.area}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 4: హైదరాబాద్ & గ్రేటర్ తెలంగాణ (Hyderabad & TS) */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-black text-white flex items-center justify-between border-b border-[#1f2937] pb-2">
            <span className="flex items-center gap-1.5">
              <MapPin className="size-3.5 text-purple-500" />
              4. హైదరాబాద్ & తెలంగాణ
            </span>
            <span className="text-[10px] text-gray-500">Telangana</span>
          </h4>
          <ul className="space-y-2 text-xs font-semibold text-gray-400">
            {seoData[activeTab].telangana.map((item, idx) => (
              <li key={idx} className="hover:text-[#2563eb] transition cursor-pointer py-0.5 space-y-0.5">
                <p className="truncate text-white hover:text-[#2563eb]">• {item.label}</p>
                <p className="text-[10px] text-gray-500 font-normal pl-2">📍 {item.area}</p>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* AP & Telangana Constituency & Mandal Search Tag Cloud */}
      <div className="border-t border-[#1f2937] pt-5 space-y-3">
        <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="size-3.5 text-amber-500" />
          ఆంధ్రప్రదేశ్ & తెలంగాణ నియోజకవర్గాలు, జిల్లాలు & మండలాల ట్రెండింగ్ శోధనలు:
        </h4>

        <div className="flex flex-wrap gap-2">
          {tagCloud.map((tag, idx) => (
            <span
              key={idx}
              className="px-3.5 py-1.5 rounded-full bg-[#030712] text-[11px] font-bold text-gray-300 hover:bg-[#2563eb] hover:text-white transition cursor-pointer border border-[#1f2937] min-h-[36px] flex items-center active:scale-95 touch-manipulation"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

    </footer>
  );
}
