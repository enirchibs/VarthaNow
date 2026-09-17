// 🔌 Merchant Adapters for Affiliate Commerce (Amazon Creators API & Flipkart Affiliate)
import type { MerchantId, MerchantOffer } from "@/types/deals";

export interface MerchantAdapter {
  id: MerchantId;
  name: string;
  logo: string;
  generateAffiliateUrl(rawUrl: string, trackingId?: string): string;
  isOfferAvailable(offer: MerchantOffer): boolean;
}

// 📦 1. AMAZON INDIA ADAPTER (Amazon Creators API & Associates Compliance)
export class AmazonAdapter implements MerchantAdapter {
  id: MerchantId = "amazon";
  name = "Amazon India";
  logo = "https://images.unsplash.com/photo-1523474255658-4af61b1c5d70?auto=format&fit=crop&w=80&q=80";

  // Amazon Associate Tracking Tag (Configurable via ENV or fallback)
  private associateTag = (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_AMAZON_ASSOCIATE_TAG) || "manaadda-21";

  public generateAffiliateUrl(rawUrl: string, trackingId?: string): string {
    const tag = trackingId || this.associateTag;
    try {
      const url = new URL(rawUrl);
      // Ensure the official associate tag is correctly set
      url.searchParams.set("tag", tag);
      url.searchParams.set("ascsubtag", "manaadda_deal");
      return url.toString();
    } catch {
      // If URL parsing fails, attach parameter safely
      const sep = rawUrl.includes("?") ? "&" : "?";
      return `${rawUrl}${sep}tag=${encodeURIComponent(tag)}&ascsubtag=manaadda_deal`;
    }
  }

  public isOfferAvailable(offer: MerchantOffer): boolean {
    return offer.in_stock && offer.price > 0;
  }
}

// 📦 2. FLIPKART ADAPTER (Official Special Links & Affiliate Attributions)
export class FlipkartAdapter implements MerchantAdapter {
  id: MerchantId = "flipkart";
  name = "Flipkart";
  logo = "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=80&q=80";

  // Flipkart Affiliate Tracking ID
  private affiliateId = (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_FLIPKART_AFFILIATE_ID) || "manaadda";

  public generateAffiliateUrl(rawUrl: string, trackingId?: string): string {
    const affid = trackingId || this.affiliateId;
    try {
      const url = new URL(rawUrl);
      url.searchParams.set("affid", affid);
      url.searchParams.set("affExtParam1", "manaadda_deal");
      return url.toString();
    } catch {
      const sep = rawUrl.includes("?") ? "&" : "?";
      return `${rawUrl}${sep}affid=${encodeURIComponent(affid)}&affExtParam1=manaadda_deal`;
    }
  }

  public isOfferAvailable(offer: MerchantOffer): boolean {
    return offer.in_stock && offer.price > 0;
  }
}

// 🏭 ADAPTER REGISTRY
const adapters: Record<MerchantId, MerchantAdapter> = {
  amazon: new AmazonAdapter(),
  flipkart: new FlipkartAdapter(),
  tatacliq: new AmazonAdapter() as any, // Placeholder for future expansion
  croma: new AmazonAdapter() as any,
  myntra: new FlipkartAdapter() as any,
  ajio: new AmazonAdapter() as any
};

export function getMerchantAdapter(merchantId: MerchantId): MerchantAdapter {
  return adapters[merchantId] || adapters.amazon;
}

export function generateApprovedAffiliateUrl(merchantId: MerchantId, url: string): string {
  const adapter = getMerchantAdapter(merchantId);
  return adapter.generateAffiliateUrl(url);
}
