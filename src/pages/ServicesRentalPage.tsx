import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  getServiceCategories, 
  getServiceSubcategories, 
  searchServiceProviders, 
  getBookmarkedProviderIds, 
  toggleBookmarkProvider,
  SERVICE_CATEGORIES,
  SERVICE_SUBCATEGORIES
} from "@/lib/services-api";
import type { 
  ServiceCategoryItem, 
  ServiceSubcategoryItem, 
  ServiceProvider 
} from "@/types/services";
import { ServicesHeader } from "@/components/services/ServicesHeader";
import { ServicesHomeView } from "@/components/services/ServicesHomeView";
import { ServiceSubcategoryView } from "@/components/services/ServiceSubcategoryView";
import { ServiceListingsView } from "@/components/services/ServiceListingsView";
import { LocationPickerModal } from "@/components/services/LocationPickerModal";
import { ServiceProviderDetailModal } from "@/components/services/ServiceProviderDetailModal";
import { ServiceContactModal } from "@/components/services/ServiceContactModal";
import { ServiceSuccessModal } from "@/components/services/ServiceSuccessModal";
import { PostServiceModal } from "@/components/services/PostServiceModal";
import { ReportServiceModal } from "@/components/services/ReportServiceModal";
import { UserProfileModal } from "@/components/UserProfileModal";
import { getStoredUserProfile, UserProfile, PROFILE_EVENT_NAME } from "@/lib/user-profile";

export function ServicesRentalPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Navigation / View State: "home" | "subcategories" | "listings"
  const [currentView, setCurrentView] = useState<"home" | "subcategories" | "listings">("home");
  const [selectedMode, setSelectedMode] = useState<"services" | "rentals">("services");
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategoryItem | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<ServiceSubcategoryItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Location & Radius State
  const [locationName, setLocationName] = useState<string>("విశాఖపట్నం");
  const [radiusKm, setRadiusKm] = useState<number>(10);
  const [refCoordinates, setRefCoordinates] = useState<{ lat?: number; lon?: number }>({ lat: 17.8184, lon: 83.3512 });

  // Data & Listings State
  const [categories, setCategories] = useState<ServiceCategoryItem[]>(SERVICE_CATEGORIES);
  const [subcategories, setSubcategories] = useState<ServiceSubcategoryItem[]>([]);
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  // Modals
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [selectedProviderForDetail, setSelectedProviderForDetail] = useState<ServiceProvider | null>(null);
  const [selectedProviderForContact, setSelectedProviderForContact] = useState<ServiceProvider | null>(null);
  const [selectedProviderForSuccess, setSelectedProviderForSuccess] = useState<ServiceProvider | null>(null);
  const [isPostServiceOpen, setIsPostServiceOpen] = useState(false);
  const [selectedProviderForReport, setSelectedProviderForReport] = useState<ServiceProvider | null>(null);
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(getStoredUserProfile());

  // Profile Sync
  useEffect(() => {
    const handleProfileUpdate = () => setUserProfile(getStoredUserProfile());
    window.addEventListener(PROFILE_EVENT_NAME as any, handleProfileUpdate);
    window.addEventListener("storage", handleProfileUpdate);
    return () => {
      window.removeEventListener(PROFILE_EVENT_NAME as any, handleProfileUpdate);
      window.removeEventListener("storage", handleProfileUpdate);
    };
  }, []);

  // Sync Bookmarks
  useEffect(() => {
    setBookmarkedIds(getBookmarkedProviderIds());
  }, []);

  // Load Categories when mode changes
  useEffect(() => {
    getServiceCategories(selectedMode).then((cats) => {
      setCategories(cats);
    });
  }, [selectedMode]);

  // Load Subcategories when category is selected
  useEffect(() => {
    if (selectedCategory) {
      getServiceSubcategories(selectedCategory.id).then((subs) => {
        setSubcategories(subs);
      });
    } else {
      setSubcategories([]);
    }
  }, [selectedCategory]);

  // Fetch Providers whenever filters change
  const fetchProviders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await searchServiceProviders({
        query: searchQuery,
        categoryId: selectedCategory?.id,
        subcategoryId: selectedSubcategory?.id,
        lat: refCoordinates.lat,
        lon: refCoordinates.lon,
        radiusKm: radiusKm,
        mode: selectedMode
      });
      setProviders(res.providers);
    } catch (err) {
      console.warn("Failed to fetch service providers:", err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedSubcategory, refCoordinates, radiusKm, selectedMode]);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  // Parse URL Parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const catSlug = params.get("category") || params.get("cat");
    const subSlug = params.get("sub") || params.get("subcategory");
    const q = params.get("q") || params.get("search");
    const locParam = params.get("loc") || params.get("location");
    const radParam = params.get("radius");
    const isPost = params.get("post") === "true";

    if (locParam) setLocationName(locParam);
    if (radParam) setRadiusKm(parseInt(radParam, 10) || 10);
    if (isPost) setIsPostServiceOpen(true);

    if (q) {
      setSearchQuery(q);
      setCurrentView("listings");
    } else if (catSlug) {
      const foundCat = SERVICE_CATEGORIES.find((c) => c.slug === catSlug || c.id === catSlug);
      if (foundCat) {
        setSelectedCategory(foundCat);
        if (subSlug) {
          const foundSub = SERVICE_SUBCATEGORIES.find((s) => s.slug === subSlug || s.id === subSlug);
          if (foundSub) {
            setSelectedSubcategory(foundSub);
            setCurrentView("listings");
          } else {
            setCurrentView("subcategories");
          }
        } else {
          setCurrentView("subcategories");
        }
      }
    }
  }, [location.search]);

  // Handle Category Click from Home Screen
  const handleSelectCategory = (cat: ServiceCategoryItem) => {
    setSelectedCategory(cat);
    setSelectedSubcategory(null);
    setSearchQuery("");
    setCurrentView("subcategories");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle Subcategory Click from Subcategory Screen
  const handleSelectSubcategory = (sub: ServiceSubcategoryItem) => {
    setSelectedSubcategory(sub);
    setSearchQuery("");
    setCurrentView("listings");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle Direct Need from "మీకు ఏం కావాలి?" visual rail
  const handleSelectDirectNeed = (needQuery: string, catId?: string) => {
    if (catId) {
      const cat = SERVICE_CATEGORIES.find((c) => c.id === catId);
      if (cat) setSelectedCategory(cat);
    }
    setSearchQuery(needQuery);
    setSelectedSubcategory(null);
    setCurrentView("listings");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle Search Input from Home
  const handleSearch = (q: string) => {
    setSearchQuery(q);
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setCurrentView("listings");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Back Navigation Handlers
  const handleBackToHome = () => {
    setCurrentView("home");
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSearchQuery("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackFromListings = () => {
    if (selectedCategory) {
      setCurrentView("subcategories");
    } else {
      setCurrentView("home");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Bookmark Toggle
  const handleToggleBookmark = (id: string) => {
    toggleBookmarkProvider(id);
    setBookmarkedIds(getBookmarkedProviderIds());
  };

  // Direct Call
  const handleDirectCall = (provider: ServiceProvider) => {
    setSelectedProviderForContact(provider);
  };

  // Direct WhatsApp
  const handleDirectWhatsApp = (provider: ServiceProvider) => {
    setSelectedProviderForContact(provider);
  };

  // Message Sent Success
  const handleMessageSentSuccess = (provider: ServiceProvider) => {
    setSelectedProviderForContact(null);
    setSelectedProviderForDetail(null);
    setSelectedProviderForSuccess(provider);
  };

  // Location Change
  const handleSelectLocation = (newLoc: string, newRadius: number, lat?: number, lon?: number) => {
    setLocationName(newLoc);
    setRadiusKm(newRadius);
    if (lat && lon) {
      setRefCoordinates({ lat, lon });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors pb-20">
      
      {/* 🌟 1. STICKY TOP HEADER */}
      <ServicesHeader
        locationName={locationName}
        radiusKm={radiusKm}
        onOpenLocationPicker={() => setIsLocationPickerOpen(true)}
        onOpenSearch={() => {
          setCurrentView("home");
          window.scrollTo({ top: 80, behavior: "smooth" });
        }}
        onOpenProfile={() => setIsUserProfileOpen(true)}
        userProfile={userProfile}
      />

      {/* 🌟 2. MAIN CONTENT AREA */}
      <main className="max-w-5xl mx-auto px-3 sm:px-4 pt-3 sm:pt-4">
        
        {/* SCREEN 1 & 3: SERVICES HOME VIEW */}
        {currentView === "home" && (
          <ServicesHomeView
            categories={categories}
            selectedMode={selectedMode}
            onSelectMode={setSelectedMode}
            onSelectCategory={handleSelectCategory}
            onSelectDirectNeed={handleSelectDirectNeed}
            onSearch={handleSearch}
            locationName={locationName}
            selectedRadius={radiusKm}
            onSelectRadius={setRadiusKm}
            onOpenLocationPicker={() => setIsLocationPickerOpen(true)}
            onOpenPostService={() => setIsPostServiceOpen(true)}
          />
        )}

        {/* SCREEN 4: SUBCATEGORY SELECTION VIEW */}
        {currentView === "subcategories" && selectedCategory && (
          <ServiceSubcategoryView
            category={selectedCategory}
            subcategories={subcategories}
            onBack={handleBackToHome}
            onSelectSubcategory={handleSelectSubcategory}
          />
        )}

        {/* SCREEN 5: SERVICE LISTINGS VIEW */}
        {currentView === "listings" && (
          <ServiceListingsView
            category={selectedCategory}
            subcategory={selectedSubcategory}
            searchQuery={searchQuery}
            providers={providers}
            loading={loading}
            locationName={locationName}
            radiusKm={radiusKm}
            onOpenLocationPicker={() => setIsLocationPickerOpen(true)}
            onBack={handleBackFromListings}
            onSelectProvider={(p) => setSelectedProviderForDetail(p)}
            onDirectCall={handleDirectCall}
            onDirectWhatsApp={handleDirectWhatsApp}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={handleToggleBookmark}
            onExpandRadius={(newR) => setRadiusKm(newR)}
          />
        )}

      </main>

      {/* 🌟 3. MODALS (Screens 2, 6, 7, 8, Post, Report, Profile) */}

      {/* Screen 2: Location & Distance Picker Modal */}
      <LocationPickerModal
        isOpen={isLocationPickerOpen}
        onClose={() => setIsLocationPickerOpen(false)}
        currentLocation={locationName}
        currentRadius={radiusKm}
        onSelectLocation={handleSelectLocation}
      />

      {/* Screen 6: Service Provider Detail Modal */}
      <ServiceProviderDetailModal
        provider={selectedProviderForDetail}
        isOpen={!!selectedProviderForDetail}
        onClose={() => setSelectedProviderForDetail(null)}
        onCall={handleDirectCall}
        onWhatsApp={handleDirectWhatsApp}
        isBookmarked={selectedProviderForDetail ? bookmarkedIds.includes(selectedProviderForDetail.id) : false}
        onToggleBookmark={handleToggleBookmark}
        onOpenReport={(p) => setSelectedProviderForReport(p)}
      />

      {/* Screen 7: Service Contact Modal */}
      <ServiceContactModal
        provider={selectedProviderForContact}
        isOpen={!!selectedProviderForContact}
        onClose={() => setSelectedProviderForContact(null)}
        onMessageSentSuccess={handleMessageSentSuccess}
      />

      {/* Screen 8: Success / Confirmation Modal */}
      <ServiceSuccessModal
        provider={selectedProviderForSuccess}
        isOpen={!!selectedProviderForSuccess}
        onClose={() => setSelectedProviderForSuccess(null)}
        onViewMoreSameCategory={() => {
          setSelectedProviderForSuccess(null);
          setCurrentView("listings");
        }}
        onSearchOtherServices={() => {
          setSelectedProviderForSuccess(null);
          handleBackToHome();
        }}
        onBackToHome={() => {
          setSelectedProviderForSuccess(null);
          handleBackToHome();
        }}
        isBookmarked={selectedProviderForSuccess ? bookmarkedIds.includes(selectedProviderForSuccess.id) : false}
        onToggleBookmark={handleToggleBookmark}
      />

      {/* Section 21: Post Service Modal */}
      <PostServiceModal
        isOpen={isPostServiceOpen}
        onClose={() => setIsPostServiceOpen(false)}
        onServiceCreated={(newService) => {
          fetchProviders();
          setSelectedProviderForDetail(newService);
        }}
      />

      {/* Section 26: Safety Abuse / Report Modal */}
      <ReportServiceModal
        provider={selectedProviderForReport}
        isOpen={!!selectedProviderForReport}
        onClose={() => setSelectedProviderForReport(null)}
      />

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isUserProfileOpen}
        onClose={() => setIsUserProfileOpen(false)}
      />

    </div>
  );
}
