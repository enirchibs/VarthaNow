import React, { useState } from "react";
import { Search, MapPin, Tag, Globe, Sparkles, Building, Smartphone, Car, Home as HomeIcon, Sofa } from "lucide-react";

type SeoCategory = "mobiles" | "vehicles" | "furniture" | "property";

export function MarketplaceSeoFooter() {
  const [activeTab, setActiveTab] = useState<SeoCategory>("mobiles");

  const seoData: Record<SeoCategory, {
    central: { label: string; query: string }[];
    east: { label: string; query: string }[];
    north: { label: string; query: string }[];
    industrial: { label: string; query: string }[];
  }> = {
    mobiles: {
      central: [
        { label: "Used iPhone 13 in MVP Colony", query: "iPhone MVP Colony" },
        { label: "Second hand laptops in Siripuram", query: "Laptop Siripuram" },
        { label: "Used Samsung phones in Dwaraka Nagar", query: "Samsung Dwaraka Nagar" },
        { label: "Used iPad & Tablets in Abids", query: "Tablet Abids" }
      ],
      east: [
        { label: "Second hand Mobiles in Beach Road", query: "Mobile Beach Road" },
        { label: "Used Smartwatches in Rushikonda", query: "Smartwatch Rushikonda" },
        { label: "Camera & Lenses in Sagar Nagar", query: "Camera Sagar Nagar" },
        { label: "Gaming Consoles in Jubilee Hills", query: "Console Jubilee Hills" }
      ],
      north: [
        { label: "Used iPhones in Madhurawada", query: "iPhone Madhurawada" },
        { label: "Refurbished Laptops in Yendada", query: "Laptop Yendada" },
        { label: "5G Mobiles in Kompally", query: "5G Kompally" },
        { label: "Bluetooth Speakers in Kukatpally", query: "Speaker Kukatpally" }
      ],
      industrial: [
        { label: "Second Hand Mobiles in Gajuwaka", query: "Mobile Gajuwaka" },
        { label: "Budget Smartphones in Auto Nagar", query: "Budget Phone Auto Nagar" },
        { label: "Used Laptops in HITEC City", query: "Laptop HITEC City" },
        { label: "Used iPhone 14 in Gachibowli", query: "iPhone Gachibowli" }
      ]
    },
    vehicles: {
      central: [
        { label: "Hero Splendor 2022 in MVP Colony", query: "Hero Splendor MVP Colony" },
        { label: "Second Hand Scooty in Siripuram", query: "Scooty Siripuram" },
        { label: "Used Royal Enfield in Dwaraka Nagar", query: "Royal Enfield Dwaraka Nagar" },
        { label: "Pre-owned Maruti Swift in Abids", query: "Swift Abids" }
      ],
      east: [
        { label: "Used Bikes in Beach Road", query: "Bike Beach Road" },
        { label: "Used Hyundai i20 in Rushikonda", query: "Hyundai Rushikonda" },
        { label: "Electric Scooters in Sagar Nagar", query: "EV Scooter Sagar Nagar" },
        { label: "Luxury Used Cars in Jubilee Hills", query: "Luxury Car Jubilee Hills" }
      ],
      north: [
        { label: "Second Hand Bikes in Madhurawada", query: "Bike Madhurawada" },
        { label: "Used Honda Activa in Yendada", query: "Activa Yendada" },
        { label: "TVS Jupiter in Kompally", query: "Jupiter Kompally" },
        { label: "Used Cars in Kukatpally", query: "Cars Kukatpally" }
      ],
      industrial: [
        { label: "Used Bikes in Gajuwaka", query: "Bike Gajuwaka" },
        { label: "Second Hand Cars in Sheela Nagar", query: "Car Sheela Nagar" },
        { label: "Auto Rickshaws in Steel Plant", query: "Auto Steel Plant" },
        { label: "Used SUVs in Gachibowli", query: "SUV Gachibowli" }
      ]
    },
    furniture: {
      central: [
        { label: "Teak Wood Sofa Set in MVP Colony", query: "Teak Sofa MVP Colony" },
        { label: "Office Chairs in Siripuram", query: "Office Chair Siripuram" },
        { label: "Dining Table in Dwaraka Nagar", query: "Dining Table Dwaraka Nagar" },
        { label: "Wooden Almirah in Abids", query: "Almirah Abids" }
      ],
      east: [
        { label: "Used Refrigerator in Beach Road", query: "Fridge Beach Road" },
        { label: "Washing Machine in Rushikonda", query: "Washing Machine Rushikonda" },
        { label: "King Size Bed in Lawson's Bay", query: "Bed Lawson Bay" },
        { label: "Living Room Sofa in Jubilee Hills", query: "Sofa Jubilee Hills" }
      ],
      north: [
        { label: "Used Furniture in Madhurawada", query: "Furniture Madhurawada" },
        { label: "Study Table & Desk in Yendada", query: "Desk Yendada" },
        { label: "Double Bed Mattress in Kompally", query: "Mattress Kompally" },
        { label: "Used Air Conditioners in Kukatpally", query: "AC Kukatpally" }
      ],
      industrial: [
        { label: "Teak Wood Furniture in Gajuwaka", query: "Teak Furniture Gajuwaka" },
        { label: "Home Appliances in Auto Nagar", query: "Appliances Auto Nagar" },
        { label: "Modular Kitchen Units in HITEC City", query: "Kitchen HITEC City" },
        { label: "Used Sofa Sets in Gachibowli", query: "Sofa Gachibowli" }
      ]
    },
    property: {
      central: [
        { label: "2BHK Flat for Rent in MVP Colony", query: "2BHK MVP Colony" },
        { label: "Commercial Office in Siripuram", query: "Office Siripuram" },
        { label: "Independent House in Dwaraka Nagar", query: "House Dwaraka Nagar" },
        { label: "Apartments for Rent in Ameerpet", query: "Apartment Ameerpet" }
      ],
      east: [
        { label: "Sea View Villa in Beach Road", query: "Villa Beach Road" },
        { label: "Plots for Sale in Rushikonda", query: "Plot Rushikonda" },
        { label: "Luxury 3BHK in Lawson's Bay", query: "3BHK Lawson Bay" },
        { label: "Gated Community Flat in Jubilee Hills", query: "Gated Flat Jubilee Hills" }
      ],
      north: [
        { label: "Rental Flats in Madhurawada", query: "Rent Madhurawada" },
        { label: "Residential Land in Yendada", query: "Land Yendada" },
        { label: "2BHK Apartments in Kompally", query: "2BHK Kompally" },
        { label: "Hostels & PG in Kukatpally", query: "PG Kukatpally" }
      ],
      industrial: [
        { label: "Flats for Sale in Gajuwaka", query: "Flat Gajuwaka" },
        { label: "Warehouse Space in Auto Nagar", query: "Warehouse Auto Nagar" },
        { label: "3BHK Luxury Flats in HITEC City", query: "3BHK HITEC City" },
        { label: "Gated 2BHK in Gachibowli", query: "2BHK Gachibowli" }
      ]
    }
  };

  const tagCloud = [
    "🔥 Second hand bikes in Vizag",
    "📱 Used iPhones in Madhurawada",
    "🏠 2BHK Flats for rent in Gachibowli",
    "🛋️ Teak wood sofa set in Gajuwaka",
    "🚗 Used Suzuki cars in Hyderabad",
    "🌾 Farmer rice bags in Vijayawada",
    "🔧 Electrician services in Vizag",
    "💼 Software Jobs in Madhurawada",
    "🎁 Free items giveaway in MVP Colony",
    "🏍️ Hero Splendor 2022 model",
    "🏢 Commercial space for rent in Siripuram",
    "💻 Refurbished Dell laptops in HITEC City"
  ];

  return (
    <footer className="mt-12 rounded-[2.2rem] border border-[#1f2937] bg-[#111827] text-white p-6 sm:p-8 space-y-6 shadow-md">
      
      {/* Footer Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1f2937] pb-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-black text-[#2563eb] uppercase tracking-widest">
            <Globe className="size-3.5" />
            Hyperlocal SEO Directory
          </span>
          <h3 className="text-lg font-black text-white mt-0.5">
            మన మార్కెట్ స్థానిక శోధన డైరెక్టరీ (Hyperlocal Directory)
          </h3>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: "mobiles", label: "📱 Mobiles & Electronics", icon: Smartphone },
            { id: "vehicles", label: "🚗 Bikes & Cars", icon: Car },
            { id: "furniture", label: "🛋️ Furniture & Appliances", icon: Sofa },
            { id: "property", label: "🏠 Flats & Properties", icon: Building }
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

      {/* 4-Column Regional Keyword Directory */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 pt-2">
        
        {/* Column 1: Central City */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-black text-white flex items-center gap-1.5 border-b border-[#1f2937] pb-1.5">
            <MapPin className="size-3.5 text-[#2563eb]" />
            1. Central City
          </h4>
          <ul className="space-y-2 text-xs font-semibold text-gray-400">
            {seoData[activeTab].central.map((item, idx) => (
              <li key={idx} className="hover:text-[#2563eb] transition truncate cursor-pointer py-1">
                • {item.label}
              </li>
            ))}
          </ul>
        </div>

        {/* Column 2: East & Beach Belt */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-black text-white flex items-center gap-1.5 border-b border-[#1f2937] pb-1.5">
            <MapPin className="size-3.5 text-[#16a34a]" />
            2. East & Beach Belt
          </h4>
          <ul className="space-y-2 text-xs font-semibold text-gray-400">
            {seoData[activeTab].east.map((item, idx) => (
              <li key={idx} className="hover:text-[#2563eb] transition truncate cursor-pointer py-1">
                • {item.label}
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: North Suburbs */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-black text-white flex items-center gap-1.5 border-b border-[#1f2937] pb-1.5">
            <MapPin className="size-3.5 text-amber-500" />
            3. North Suburbs
          </h4>
          <ul className="space-y-2 text-xs font-semibold text-gray-400">
            {seoData[activeTab].north.map((item, idx) => (
              <li key={idx} className="hover:text-[#2563eb] transition truncate cursor-pointer py-1">
                • {item.label}
              </li>
            ))}
          </ul>
        </div>

        {/* Column 4: Industrial Hubs & South */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-black text-white flex items-center gap-1.5 border-b border-[#1f2937] pb-1.5">
            <MapPin className="size-3.5 text-purple-500" />
            4. Industrial Hubs & South
          </h4>
          <ul className="space-y-2 text-xs font-semibold text-gray-400">
            {seoData[activeTab].industrial.map((item, idx) => (
              <li key={idx} className="hover:text-[#2563eb] transition truncate cursor-pointer py-1">
                • {item.label}
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Localities Tag Cloud */}
      <div className="border-t border-[#1f2937] pt-4 space-y-2.5">
        <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="size-3.5 text-amber-500" />
          విశాఖ & తెలుగు రాష్ట్రాల ట్రెండింగ్ శోధనలు (Trending Local Search Tags):
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
