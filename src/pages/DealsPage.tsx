import React, { useState, useEffect, useMemo } from "react";
import { 
  Flame, 
  Search, 
  Filter, 
  ArrowLeft, 
  Bookmark, 
  RefreshCw, 
  ExternalLink,
  Sparkles,
  X,
  TrendingDown,
  ShoppingBag,
  SlidersHorizontal,
  ChevronRight
} from "lucide-react";
import type { 
  CanonicalProduct, 
  MerchantOffer, 
  DealsSearchFilters, 
  DealAudienceMode,
  PrimaryDealsTab,
  KiranaSubcategory,
  DealCollectionType
} from "@/types/deals";
import { 
  searchCanonicalProducts, 
  recordAffiliateClick, 
  getSavedDealIds, 
  toggleSaveDeal,
  SEED_CANONICAL_PRODUCTS,
  MORE_DEAL_CATEGORIES
} from "@/lib/deals/deals-api";

import { DealsHeader } from "@/components/deals/DealsHeader";
import { DealsPrimaryNav } from "@/components/deals/DealsPrimaryNav";
import { DealsSearchSection } from "@/components/deals/DealsSearchSection";
import { DealsBudgetFinder } from "@/components/deals/DealsBudgetFinder";
import { DealsCollectionsBar } from "@/components/deals/DealsCollectionsBar";
import { DealsProductCard } from "@/components/deals/DealsProductCard";
import { DealsCompareModal } from "@/components/deals/DealsCompareModal";
import { DealsMoreCategoriesModal } from "@/components/deals/DealsMoreCategoriesModal";
import { DealsPriceAlertModal } from "@/components/deals/DealsPriceAlertModal";
import { DealsAdminModal } from "@/components/deals/DealsAdminModal";
import { DealsAffiliateDisclosure } from "@/components/deals/DealsAffiliateDisclosure";

export const DealsPage: React.FC = () => {
  // Navigation & Category States
  const [activeTab, setActiveTab] = useState<PrimaryDealsTab>("all");
  const [activeKiranaSub, setActiveKiranaSub] = useState<KiranaSubcategory>("all");
  const [selectedMoreCategory, setSelectedMoreCategory] = useState<string | undefined>(undefined);
  const [activeCollection, setActiveCollection] = useState<DealCollectionType>("all");
  const [audienceMode, setAudienceMode] = useState<DealAudienceMode>("all");
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBudget, setSelectedBudget] = useState<number | undefined>(undefined);
  const [sortBy, setSortBy] = useState<"recommended" | "price_asc" | "price_desc" | "savings">("recommended");

  // Data & State
  const [products, setProducts] = useState<CanonicalProduct[]>(SEED_CANONICAL_PRODUCTS);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Modals
  const [selectedCompareProduct, setSelectedCompareProduct] = useState<CanonicalProduct | null>(null);
  const [selectedAlertProduct, setSelectedAlertProduct] = useState<CanonicalProduct | null>(null);
  const [isMoreModalOpen, setIsMoreModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  useEffect(() => {
    setSavedIds(getSavedDealIds());
  }, []);

  // Fetch or filter products
  const loadProducts = async () => {
    setIsLoading(true);
    try {
      let targetCat: string | undefined = undefined;
      if (selectedMoreCategory) {
        targetCat = selectedMoreCategory;
      } else if (activeTab === "kirana") {
        targetCat = "kirana";
      } else if (activeTab === "mobiles") {
        targetCat = "mobiles";
      } else if (activeTab === "student") {
        targetCat = "student";
      } else if (activeTab === "home") {
        targetCat = "home";
      } else if (activeTab === "farmer") {
        targetCat = "farmer";
      }

      const filters: DealsSearchFilters = {
        query: searchQuery,
        category: targetCat,
        subcategory: activeTab === "kirana" && activeKiranaSub !== "all" ? activeKiranaSub : undefined,
        max_price: selectedBudget,
        audience_mode: audienceMode !== "all" ? audienceMode : undefined,
        collection: activeCollection !== "all" ? activeCollection : undefined,
        sort_by: sortBy
      };

      const res = await searchCanonicalProducts(filters);
      setProducts(res.products);
    } catch (err) {
      console.error("Error loading deals:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [
    activeTab, 
    activeKiranaSub, 
    selectedMoreCategory, 
    selectedBudget, 
    activeCollection, 
    searchQuery, 
    audienceMode, 
    sortBy
  ]);

  // Tab Selection
  const handleSelectTab = (tab: PrimaryDealsTab) => {
    setActiveTab(tab);
    setSelectedMoreCategory(undefined);
    setShowSavedOnly(false);
    if (tab !== "kirana") setActiveKiranaSub("all");
  };

  // More Category select
  const handleSelectMoreCategory = (slug: string) => {
    setSelectedMoreCategory(slug);
    setActiveTab("more");
    setShowSavedOnly(false);
  };

  // Search Submit
  const handleSearch = (query: string, category?: string, maxPrice?: number) => {
    setSearchQuery(query);
    if (category) {
      if (category === "kirana" || category === "mobiles" || category === "student" || category === "home" || category === "farmer") {
        setActiveTab(category as PrimaryDealsTab);
      } else {
        setSelectedMoreCategory(category);
        setActiveTab("more");
      }
    }
    if (maxPrice) setSelectedBudget(maxPrice);
    setShowSavedOnly(false);
  };

  // Toggle Save Deal
  const handleToggleSave = (prod: CanonicalProduct) => {
    toggleSaveDeal(prod);
    setSavedIds(getSavedDealIds());
  };

  // Buy Click
  const handleBuyClick = (product: CanonicalProduct, offer: MerchantOffer) => {
    const { affiliateUrl } = recordAffiliateClick(product, offer);
    window.open(affiliateUrl, "_blank", "noopener,noreferrer");
  };

  // Clear all active filters
  const clearFilters = () => {
    setSearchQuery("");
    setActiveTab("all");
    setActiveKiranaSub("all");
    setSelectedMoreCategory(undefined);
    setSelectedBudget(undefined);
    setActiveCollection("all");
    setAudienceMode("all");
    setShowSavedOnly(false);
  };

  // Displayed products
  const displayedProducts = useMemo(() => {
    if (showSavedOnly) {
      return products.filter((p) => savedIds.includes(p.id));
    }
    return products;
  }, [products, showSavedOnly, savedIds]);

  // Deal of the Day for Desktop Right Rail
  const dealOfTheDay = useMemo(() => {
    return products.find((p) => p.is_todays_deal) || products[0];
  }, [products]);

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-zinc-950 text-slate-900 dark:text-white transition-all pb-24">
      {/* 1. Deals Sticky Header */}
      <DealsHeader
        activeMode={audienceMode}
        onSelectMode={(m) => {
          setAudienceMode(m);
          setShowSavedOnly(false);
        }}
        savedCount={savedIds.length}
        onOpenSavedDeals={() => setShowSavedOnly(true)}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
      />

      <main className="container-shell max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* 2. Top Search Section */}
        <DealsSearchSection
          onSearch={handleSearch}
          currentQuery={searchQuery}
        />

        {/* 3. Primary 7-Tab Horizontally Scrollable Navigation */}
        <DealsPrimaryNav
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          activeKiranaSubcategory={activeKiranaSub}
          onSelectKiranaSubcategory={setActiveKiranaSub}
          onSelectBudgetShortcut={(b) => setSelectedBudget(b)}
          selectedBudget={selectedBudget}
          onOpenMoreCategories={() => setIsMoreModalOpen(true)}
        />

        {/* 4. Budget Finder (Section 12) */}
        <DealsBudgetFinder
          selectedBudget={selectedBudget}
          onSelectBudget={(b) => setSelectedBudget(b)}
          onClearBudget={() => setSelectedBudget(undefined)}
          matchedCount={displayedProducts.length}
        />

        {/* 5. Deal Collections Discovery Bar (Section 13) */}
        <DealsCollectionsBar
          activeCollection={activeCollection}
          onSelectCollection={setActiveCollection}
        />

        {/* 6. Active Filter Pills & Results Counter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-5">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="font-extrabold text-slate-500">ఫిల్టర్లు:</span>
            {showSavedOnly && (
              <span className="px-2.5 py-1 rounded-xl bg-amber-500 text-white font-black flex items-center gap-1 shadow-2xs">
                <Bookmark className="size-3 fill-white" /> సేవ్ చేసినవి ({savedIds.length})
              </span>
            )}
            {selectedBudget && (
              <span className="px-2.5 py-1 rounded-xl bg-orange-600 text-white font-black shadow-2xs">
                ₹{selectedBudget.toLocaleString("en-IN")} లోపు
              </span>
            )}
            {selectedMoreCategory && (
              <span className="px-2.5 py-1 rounded-xl bg-purple-600 text-white font-black shadow-2xs">
                {MORE_DEAL_CATEGORIES.find((m) => m.slug === selectedMoreCategory)?.name_te || selectedMoreCategory}
              </span>
            )}
            {searchQuery && (
              <span className="px-2.5 py-1 rounded-xl bg-slate-800 text-white font-bold shadow-2xs">
                "{searchQuery}"
              </span>
            )}
            {(showSavedOnly || selectedBudget || selectedMoreCategory || searchQuery || activeCollection !== "all") && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-1 text-orange-600 dark:text-orange-400 font-black hover:underline cursor-pointer ml-1"
              >
                <X className="size-3" /> ఫిల్టర్లు తొలగించండి
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs font-bold text-slate-500">
              {displayedProducts.length} డీల్స్
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-bold outline-none shadow-2xs cursor-pointer"
            >
              <option value="recommended">సిఫార్సు చేసినవి</option>
              <option value="price_asc">ధర: తక్కువ నుండి ఎక్కువ</option>
              <option value="price_desc">ధర: ఎక్కువ నుండి తక్కువ</option>
              <option value="savings">ఎక్కువ ఆదా అయ్యేవి</option>
            </select>
          </div>
        </div>

        {/* 7. Responsive Feed: Desktop 3-Column vs Mobile Single Column (Section 33) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Main Product Feed (Col 1 to 3 on desktop) */}
          <div className="lg:col-span-3 space-y-6">
            {isLoading ? (
              <div className="py-24 text-center">
                <RefreshCw className="size-8 text-orange-500 animate-spin mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-500">డీల్స్ లోడ్ అవుతున్నాయి...</p>
              </div>
            ) : displayedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {displayedProducts.map((product) => (
                  <DealsProductCard
                    key={product.id}
                    product={product}
                    isSaved={savedIds.includes(product.id)}
                    onToggleSave={handleToggleSave}
                    onOpenCompare={setSelectedCompareProduct}
                    onBuyClick={handleBuyClick}
                    onOpenPriceAlert={setSelectedAlertProduct}
                  />
                ))}
              </div>
            ) : (
              /* Section 42 Error State */
              <div className="py-16 px-4 text-center max-w-md mx-auto bg-white dark:bg-zinc-900 rounded-3xl border-2 border-slate-200 dark:border-zinc-800 shadow-sm">
                <div className="size-16 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-600 flex items-center justify-center mx-auto mb-3 text-2xl">
                  🔍
                </div>
                <h3 className="text-base font-black text-slate-900 dark:text-white mb-1">
                  ఈ బడ్జెట్లో ప్రస్తుతం డీల్స్ కనిపించలేదు.
                </h3>
                <p className="text-xs text-slate-500 mb-5">
                  బడ్జెట్ పరిధిని పెంచండి లేదా వేరే విభాగాన్ని ఎంచుకోండి.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedBudget(selectedBudget ? selectedBudget * 2 : 5000)}
                    className="px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black text-xs shadow-xs active:scale-95 transition cursor-pointer"
                  >
                    బడ్జెట్ పెంచండి
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsMoreModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs transition cursor-pointer"
                  >
                    మరో కేటగిరీ
                  </button>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 font-bold text-xs transition cursor-pointer"
                  >
                    అన్ని డీల్స్
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Right Rail Summary / Spotlight (Hidden on Mobile) */}
          <div className="hidden lg:block lg:col-span-1 space-y-5 sticky top-24">
            {/* Deal Spotlight Card */}
            {dealOfTheDay && (
              <div className="bg-gradient-to-b from-orange-50 to-amber-50/50 dark:from-zinc-900 dark:to-zinc-900 rounded-3xl p-4 border border-orange-200/80 dark:border-zinc-800 shadow-sm">
                <div className="flex items-center gap-1.5 text-xs font-black text-orange-600 mb-2">
                  <Flame className="size-4 fill-orange-600" />
                  <span>ప్రత్యేక డీల్ (Spotlight)</span>
                </div>
                <img
                  src={dealOfTheDay.image_url}
                  alt={dealOfTheDay.model}
                  className="w-full h-36 object-contain rounded-xl bg-white dark:bg-zinc-800 p-2 mb-3"
                />
                <h4 className="font-black text-xs text-slate-900 dark:text-white line-clamp-2 mb-1">
                  {dealOfTheDay.title_te}
                </h4>
                <div className="text-base font-black text-slate-900 dark:text-white mb-3">
                  ₹{dealOfTheDay.lowest_price.toLocaleString("en-IN")}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCompareProduct(dealOfTheDay)}
                  className="w-full py-2 px-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black text-xs shadow-xs transition cursor-pointer"
                >
                  ధర పోల్చండి
                </button>
              </div>
            )}

            {/* Quick Summary Note */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-4 border border-slate-200 dark:border-zinc-800 text-xs">
              <h4 className="font-black text-slate-900 dark:text-white mb-2 flex items-center gap-1">
                <Sparkles className="size-3.5 text-orange-500" />
                <span>మన అడ్డా హామీ</span>
              </h4>
              <p className="text-[11px] font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                మేము కమీషన్ కోసం కాకుండా, మీకు నిజమైన తక్కువ ధర మరియు నాణ్యమైన రేటింగ్స్ ఆధారంగా మాత్రమే డీల్స్ చూపిస్తాము.
              </p>
            </div>
          </div>
        </div>

        {/* 8. Statutory Disclosures */}
        <div className="mt-12">
          <DealsAffiliateDisclosure />
        </div>
      </main>

      {/* MODALS */}
      {/* 1. Price Comparison Modal */}
      <DealsCompareModal
        product={selectedCompareProduct}
        isOpen={!!selectedCompareProduct}
        onClose={() => setSelectedCompareProduct(null)}
        onBuyClick={handleBuyClick}
      />

      {/* 2. More Categories Modal */}
      <DealsMoreCategoriesModal
        isOpen={isMoreModalOpen}
        onClose={() => setIsMoreModalOpen(false)}
        onSelectCategory={handleSelectMoreCategory}
      />

      {/* 3. Price Drop Alert Modal */}
      <DealsPriceAlertModal
        product={selectedAlertProduct}
        isOpen={!!selectedAlertProduct}
        onClose={() => setSelectedAlertProduct(null)}
      />

      {/* 4. Deals Admin Modal */}
      <DealsAdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
      />
    </div>
  );
};
