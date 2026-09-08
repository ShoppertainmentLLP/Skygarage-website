export const SITE = {
  name: 'Cars911',
  tagline: 'Trust. Choose. Cruise.',
  description:
    'Cars911 is the UAE’s car service aggregator. Tell us what your car needs, get quotes from verified garages, compare and book — all in one place.',
  url: 'https://www.cars911.co',
  whatsapp: import.meta.env.PUBLIC_WHATSAPP_NUMBER ?? '971501234567',
  phone: import.meta.env.PUBLIC_PHONE_NUMBER ?? '+971501234567',
};

/*
  Name, address and phone — the trio Google cross-checks between this site and the Google
  Business Profile, and the reason LocalBusiness schema needs a real postal address. Every field
  here is empty until the client confirms it: the trust bar, the footer block and the
  LocalBusiness markup each render only the parts that are filled in, so nothing invented ever
  ships. Filling this object in is the whole job when the details arrive.

  If Cars911 has no premises a customer can visit, leave `street` empty permanently. An
  aggregator without a physical shopfront should stay an Organization with a service area rather
  than claim a LocalBusiness address it does not have.
*/
export const NAP = {
  street: '',
  locality: '',
  region: 'Dubai',
  postalCode: '',
  country: 'AE',
  /** From the Google Business Profile. Leave null until confirmed; the trust bar hides it. */
  googleRating: null as number | null,
  googleReviewCount: null as number | null,
  /** Year the business started trading, for the "years operating" figure. */
  foundedYear: null as number | null,
  /** { name, logo } where logo is a path under /public. */
  certifications: [] as { name: string; logo: string }[],
  /** { name, url } for the footer's social row. */
  socials: [] as { name: string; url: string }[],
};

export const hasPostalAddress = () => Boolean(NAP.street && NAP.locality);

export function napSchema() {
  if (!hasPostalAddress()) return null;
  return {
    '@type': 'PostalAddress',
    streetAddress: NAP.street,
    addressLocality: NAP.locality,
    addressRegion: NAP.region,
    ...(NAP.postalCode ? { postalCode: NAP.postalCode } : {}),
    addressCountry: NAP.country,
  };
}

export function waLink(message: string): string {
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}`;
}

/** The number as people read it aloud: +971 50 123 4567. Dialling still uses telLink(). */
export function phoneDisplay(): string {
  const digits = SITE.phone.replace(/\D/g, '');
  const m = digits.match(/^(\d{3})(\d{2})(\d{3})(\d{4})$/);
  return m ? `+${m[1]} ${m[2]} ${m[3]} ${m[4]}` : SITE.phone;
}

export function telLink(): string {
  return `tel:${SITE.phone.replace(/\s/g, '')}`;
}

export function priceLabel(from: number | null, to: number | null): string {
  if (from && to) return `AED ${from}–${to}`;
  if (from) return `from AED ${from}`;
  return 'quoted per job';
}

export const TIER_LABELS: Record<string, string> = {
  premium: 'Premium garage',
  verified: 'Verified garage',
  mobile: 'Mobile mechanic',
};
