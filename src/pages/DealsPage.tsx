import React, { useState, useEffect, useMemo } from "react";
import { 
  Flame, 
  Search, 
  Filter, 
  SlidersHorizontal, 
  ArrowLeft, 
  Bookmark, 
  RefreshCw, 
  ExternalLink,
  Sparkles,
  X
} from "lucide-react";
import type { 
  CanonicalProduct, 
  MerchantOffer, 
  DealsSearchFilters, 
  DealAudienceMode,
  SavedDeal
} from "@/types/deals";
import { 
  searchCanonicalProducts, 
  parseNaturalDealsQuery, 
  recordAffiliateClick, 
  getSavedDealIds, 
  toggleSaveDeal,
  DEAL_CATEGORIES,
  SEED_CANONICAL_PRODUCTS
} from "@/lib/deals/deals-api";

import { DealsHeader } from "@/components/deals/DealsHeader";
import { DealsFirstScreen } from "@/components/deals/DealsFirstScreen";
import { DealsProductCard } from "@/components/deals/DealsProductCard";
import { DealsCompareModal } from "@/components/deals/DealsCompareModal";
import { DealsBudgetCollections } from "@/components/deals/DealsBudgetCollections";
import { DealsAdminModal } from "@/components/deals/DealsAdminModal";
import { DealsAffiliateDisclosure } from "@/components/deals/DealsAffiliateDisclosure";

export const DealsPage: React.FC = () => {
  // Navigation & View
  const [viewMode, setViewMode] = useState<"first_screen" | "results">("first_screen");
  const [audienceMode, setAudienceMode] = useState<DealAudienceMode>("all");
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [sortBy, setSortBy] = useState<"recommended" | "price_asc" | "price_desc" | "savings">("recommended");

  // Data & State
  const [products, setProducts] = useState<CanonicalProduct[]>(SEED_CANONICAL_PRODUCTS);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Modals
  const [selectedCompareProduct, setSelectedCompareProduct] = useState<CanonicalProduct | null>(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  useEffect(() => {
    setSavedIds(getSavedDealIds());
  }, []);

  // Fetch or filter products
  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const filters: DealsSearchFilters = {
        query: searchQuery,
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        max_price: maxPrice,
        audience_mode: audienceMode !== "all" ? audienceMode : undefined,
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
  }, [searchQuery, selectedCategory, maxPrice, audienceMode, sortBy]);

  // First screen actions
  const handleSearchFromFirstScreen = (query: string, budget?: number) => {
    const parsed = parseNaturalDealsQuery(query);
    if (parsed.category) setSelectedCategory(parsed.category);
    if (parsed.audience_mode) setAudienceMode(parsed.audience_mode);
    if (budget || parsed.max_price) setMaxPrice(budget || parsed.max_price);
    setSearchQuery(query);
    setViewMode("results");
    setShowSavedOnly(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectBudgetFromFirstScreen = (budget: number) => {
    setMaxPrice(budget);
    setViewMode("results");
    setShowSavedOnly(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectCollection = (cat?: string, budget?: number) => {
    if (cat) setSelectedCategory(cat);
    if (budget) setMaxPrice(budget);
    setViewMode("results");
    setShowSavedOnly(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Save deal toggle
  const handleToggleSave = (prod: CanonicalProduct) => {
    toggleSaveDeal(prod);
    setSavedIds(getSavedDealIds());
  };

  // Affiliate Buy Click Action
  const handleBuyClick = (product: CanonicalProduct, offer: MerchantOffer) => {
    const { affiliateUrl } = recordAffiliateClick(product, offer);
    window.open(affiliateUrl, "_blank", "noopener,noreferrer");
  };

  // Audience Mode change
  const handleModeChange = (mode: DealAudienceMode) => {
    setAudienceMode(mode);
    setViewMode("results");
    setShowSavedOnly(false);
  };

  // Displayed products
  const displayedProducts = useMemo(() => {
    if (showSavedOnly) {
      return products.filter((p) => savedIds.includes(p.id));
    }
    return products;
  }, [products, showSavedOnly, savedIds]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setMaxPrice(undefined);
    setAudienceMode("all");
    setShowSavedOnly(false);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-zinc-950 text-slate-900 dark:text-white transition-all pb-24">
      {/* 1. Header */}
      <DealsHeader
        activeMode={audienceMode}
        onSelectMode={handleModeChange}
        savedCount={savedIds.length}
        onOpenSavedDeals={() => {
          setShowSavedOnly(true);
          setViewMode("results");
        }}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
      />

      {/* 2. Content: First Screen vs Results View */}
      {viewMode === "first_screen" ? (
        <main>
          <DealsFirstScreen
            onSearch={handleSearchFromFirstScreen}
            onSelectBudget={handleSelectBudgetFromFirstScreen}
            onSelectCollection={handleSelectCollection}
          />
          <div className="container-shell max-w-6xl mx-auto px-3 sm:px-4">
            <DealsBudgetCollections onSelectCollection={handleSelectCollection} />
            <DealsAffiliateDisclosure />
          </div>
        </main>
      ) : (
        <main className="container-shell max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          {/* Top Results Filter & Navigation Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewMode("first_screen")}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-bold hover:bg-slate-100 transition shadow-2xs cursor-pointer"
              >
                <ArrowLeft className="size-3.5" />
                <span>మొదటి పేజీ</span>
              </button>

              <div className="h-4 w-px bg-slate-200 dark:border-zinc-800" />

              {/* Active Category Selector */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-bold outline-none"
              >
                <option value="all">అన్ని విభాగాలు (All)</option>
                {DEAL_CATEGORIES.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.icon} {cat.name_te}
                  </option>
                ))}
              </select>

              {/* Sort selector */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1.5 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-bold outline-none hidden sm:inline-block"
              >
                <option value="recommended">సిఫార్సు చేసినవి (Recommended)</option>
                <option value="price_asc">ధర: తక్కువ నుండి ఎక్కువ</option>
                <option value="price_desc">ధర: ఎక్కువ నుండి తక్కువ</option>
                <option value="savings">ఎక్కువ ఆదా అయ్యేవి (Big Savings)</option>
              </select>
            </div>

            {/* Results Count & Clear Filter */}
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <span>{displayedProducts.length} డీల్స్ లభించాయి</span>
              {(searchQuery || selectedCategory !== "all" || maxPrice || showSavedOnly) && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="flex items-center gap-0.5 text-orange-600 font-extrabold underline ml-1 cursor-pointer"
                >
                  <X className="size-3" /> ఫిల్టర్లు తొలగించండి
                </button>
              )}
            </div>
          </div>

          {/* Active Filter Pills Bar */}
          {(maxPrice || showSavedOnly || audienceMode !== "all" || searchQuery) && (
            <div className="flex flex-wrap items-center gap-2 mb-4 p-2.5 rounded-2xl bg-amber-50/70 dark:bg-zinc-900 border border-amber-200/60 dark:border-zinc-800 text-xs font-bold">
              <span className="text-slate-500">ఫిల్టర్లు:</span>
              {showSavedOnly && (
                <span className="px-2 py-0.5 rounded-lg bg-amber-500 text-white flex items-center gap-1">
                  <Bookmark className="size-3 fill-white" /> సేవ్ చేసినవి మాత్రమే
                </span>
              )}
              {maxPrice && (
                <span className="px-2 py-0.5 rounded-lg bg-orange-600 text-white">
                  బడ్జెట్: ₹{maxPrice.toLocaleString("en-IN")} లోపు
                </span>
              )}
              {searchQuery && (
                <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-white">
                  శోధన: "{searchQuery}"
                </span>
              )}
              {audienceMode !== "all" && (
                <span className="px-2 py-0.5 rounded-lg bg-indigo-600 text-white">
                  మోడ్: {audienceMode === "student" ? "🎓 స్టూడెంట్స్" : audienceMode === "farmer" ? "👨‍🌾 రైతులు" : "🏡 మన ఊరు"}
                </span>
              )}
            </div>
          )}

          {/* Products Grid */}
          {isLoading ? (
            <div className="py-20 text-center">
              <RefreshCw className="size-8 text-orange-500 animate-spin mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-500">డీల్స్ లోడ్ అవుతున్నాయి...</p>
            </div>
          ) : displayedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {displayedProducts.map((product) => (
                <DealsProductCard
                  key={product.id}
                  product={product}
                  isSaved={savedIds.includes(product.id)}
                  onToggleSave={handleToggleSave}
                  onOpenCompare={setSelectedCompareProduct}
                  onBuyClick={handleBuyClick}
                />
              ))}
            </div>
          ) : (
            <div className="py-16 px-4 text-center max-w-md mx-auto bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800">
              <div className="size-16 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-600 flex items-center justify-center mx-auto mb-3 text-2xl">
                🔍
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white mb-1">
                ఈ బడ్జెట్లో డీల్స్ కనుగొనబడలేదు
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                బడ్జెట్ పరిధిని పెంచండి లేదా వేరే విభాగాన్ని ఎంచుకోండి.
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="px-4 py-2 rounded-2xl bg-orange-600 text-white font-black text-xs shadow-md shadow-orange-600/20"
              >
                అన్ని డీల్స్ చూపించండి
              </button>
            </div>
          )}

          {/* Budget Collections in results */}
          <div className="mt-10">
            <DealsBudgetCollections onSelectCollection={handleSelectCollection} />
          </div>

          {/* Affiliate Disclosure */}
          <DealsAffiliateDisclosure />
        </main>
      )}

      {/* MODALS */}
      {/* 1. Compare Prices Modal */}
      <DealsCompareModal
        product={selectedCompareProduct}
        isOpen={!!selectedCompareProduct}
        onClose={() => setSelectedCompareProduct(null)}
        onBuyClick={handleBuyClick}
      />

      {/* 2. Admin Modal */}
      <DealsAdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
      />
    </div>
  );
};
