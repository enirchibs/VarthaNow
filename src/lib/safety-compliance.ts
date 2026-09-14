/**
 * VaartaNow Trust & Safety, Compliance, Terms Acceptance, and Verification Engine
 */
import { supabase } from "./supabase";

export type AccountStatus =
  | "draft"
  | "mobile_verified"
  | "profile_incomplete"
  | "ready_for_submission"
  | "pending_review"
  | "active"
  | "under_review"
  | "temporarily_suspended"
  | "removed"
  | "blocked";

export type ListingPurpose =
  | "service"
  | "business"
  | "product"
  | "driver_transport"
  | "machinery"
  | "property"
  | "other";

export interface VerificationBadges {
  mobile_verified: boolean;
  email_verified: boolean;
  identity_verified: boolean;
  business_verified: boolean;
  licence_verified: boolean;
  customer_rated: boolean;
}

export interface UserSafetyProfile {
  id: string;
  mobile_number: string;
  mobile_verified: boolean;
  mobile_verified_at?: string;
  full_name?: string;
  full_name_added_at?: string;
  email?: string | null;
  email_verified: boolean;
  email_verified_at?: string;
  role: "provider" | "seller" | "customer";
  listing_purpose?: ListingPurpose;
  account_status: AccountStatus;
  verification_badges: VerificationBadges;
  avatar_url?: string;
  bio?: string;
}

export interface TermsAcceptanceRecord {
  id: string;
  user_id?: string;
  role: "provider" | "seller" | "customer";
  terms_type: "provider_terms" | "seller_terms" | "customer_terms" | "code_of_conduct";
  terms_version: string;
  terms_hash: string;
  accepted_at: string;
  mobile_number: string;
  mobile_verified_at: string;
  email?: string | null;
  email_verified_at?: string | null;
  ip_address?: string;
  user_agent: string;
  acceptance_method: "web_checkbox";
  document_snapshot_reference: string;
}

export interface AuditEvent {
  event_type:
    | "mobile_submitted"
    | "otp_sent"
    | "otp_verified"
    | "full_name_added"
    | "email_added"
    | "email_verified"
    | "profile_created"
    | "listing_created"
    | "terms_viewed"
    | "terms_accepted"
    | "listing_submitted"
    | "listing_approved"
    | "listing_rejected"
    | "complaint_created"
    | "provider_suspended"
    | "provider_restored"
    | "listing_removed";
  entity_id?: string;
  entity_type?: string;
  metadata?: Record<string, any>;
}

export const CURRENT_TERMS_VERSION = {
  provider_terms: "provider_terms_v1_0",
  seller_terms: "seller_terms_v1_0",
  customer_terms: "customer_terms_v1_0",
  privacy: "privacy_v1_0",
  code_of_conduct: "code_of_conduct_v1_0"
};

const LOCAL_STORAGE_SAFETY_PROFILE_KEY = "vaartanow_safety_profile";
const LOCAL_STORAGE_TERMS_ACCEPTANCES_KEY = "vaartanow_terms_acceptances";
const LOCAL_STORAGE_SAFETY_ACK_KEY = "vaartanow_safety_acknowledged";

// Local storage session retrieval
export function getStoredSafetyProfile(): UserSafetyProfile | null {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_SAFETY_PROFILE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export function saveStoredSafetyProfile(profile: UserSafetyProfile): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_SAFETY_PROFILE_KEY, JSON.stringify(profile));
  } catch {}
}

export function getStoredTermsAcceptances(): TermsAcceptanceRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_TERMS_ACCEPTANCES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function recordTermsAcceptance(record: TermsAcceptanceRecord): void {
  try {
    const list = getStoredTermsAcceptances();
    list.unshift(record);
    localStorage.setItem(LOCAL_STORAGE_TERMS_ACCEPTANCES_KEY, JSON.stringify(list));

    // Audit event
    recordAuditEvent({
      event_type: "terms_accepted",
      entity_id: record.id,
      entity_type: "terms_acceptance",
      metadata: {
        terms_version: record.terms_version,
        terms_type: record.terms_type,
        mobile_number: record.mobile_number,
        has_email: Boolean(record.email)
      }
    });

    // Supabase insert if available
    if (supabase) {
      supabase.from("terms_acceptances").insert(record).then(({ error }) => {
        if (error) console.warn("Supabase terms_acceptances notice:", error.message);
      });
    }
  } catch (e) {
    console.warn("Failed to record terms acceptance:", e);
  }
}

export function recordAuditEvent(event: AuditEvent): void {
  try {
    const auditRecord = {
      ...event,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "browser",
      created_at: new Date().toISOString()
    };
    if (supabase) {
      supabase.from("audit_events").insert(auditRecord).then(({ error }) => {
        if (error) console.warn("Supabase audit event notice:", error.message);
      });
    }
  } catch {}
}

// Check if Safety Notice was acknowledged
export function hasAcknowledgedSafety(): boolean {
  try {
    return localStorage.getItem(LOCAL_STORAGE_SAFETY_ACK_KEY) === "true";
  } catch {
    return false;
  }
}

export function setAcknowledgedSafety(ack = true): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_SAFETY_ACK_KEY, ack ? "true" : "false");
  } catch {}
}

// Name sanitization & Indian Name validation
export function validateAndSanitizeFullName(input: string): { isValid: boolean; sanitized: string; error?: string } {
  const sanitized = input
    .replace(/<[^>]*>?/gm, "") // Strip HTML/script tags
    .trim();

  if (!sanitized) {
    return { isValid: false, sanitized: "", error: "దయచేసి మీ పూర్తి పేరును నమోదు చేయండి (Full name cannot be blank)" };
  }

  // Minimum length check (at least 2 characters for initials + name like 'K. Raju' or 'రవి')
  if (sanitized.length < 2) {
    return { isValid: false, sanitized, error: "దయచేసి కనీసం 2 అక్షరాలతో కూడిన చెల్లుబాటు అయ్యే పేరును ఇవ్వండి" };
  }

  // Reject obvious junk / spam patterns like numbers-only or random special chars
  if (/^[\d\W_]+$/.test(sanitized)) {
    return { isValid: false, sanitized, error: "చెల్లుబాటు అయ్యే పేరును ఇవ్వండి (Please enter a valid human name)" };
  }

  return { isValid: true, sanitized };
}
