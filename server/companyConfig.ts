/**
 * Company metadata configuration for IWRITE
 * Supports both MH Trading GmbH and other operating entities
 */

export interface CompanyMetadata {
  name: string;
  brandLine: string;
  addressLine1: string;
  addressLine2: string;
  regId: string;
  vatId: string;
  phone: string;
  email: string;
  iban?: string;
  bic?: string;
}

export function getCompanyMetadata(): CompanyMetadata {
  return {
    name: process.env.COMPANY_NAME || "MH Trading GmbH",
    brandLine: process.env.COMPANY_BRAND_LINE || "Developed by Crew Art · Powered by MH Trading GmbH",
    addressLine1: process.env.COMPANY_ADDRESS_LINE1 || "Street Address",
    addressLine2: process.env.COMPANY_ADDRESS_LINE2 || "City, Country",
    regId: process.env.COMPANY_REG_ID || "HRB XXXXXXX",
    vatId: process.env.COMPANY_VAT_ID || "DE XXXXXXXXX",
    phone: process.env.COMPANY_PHONE || "+49 (0) XXX XXXXXXXX",
    email: process.env.COMPANY_EMAIL || "contact@example.com",
    iban: process.env.COMPANY_IBAN,
    bic: process.env.COMPANY_BIC,
  };
}

/**
 * Public company info for frontend - excludes sensitive fields
 */
export function getPublicCompanyInfo() {
  const metadata = getCompanyMetadata();
  return {
    name: metadata.name,
    brandLine: metadata.brandLine,
    addressLine1: metadata.addressLine1,
    addressLine2: metadata.addressLine2,
    regId: metadata.regId,
    vatId: metadata.vatId,
    phone: metadata.phone,
    email: metadata.email,
  };
}
