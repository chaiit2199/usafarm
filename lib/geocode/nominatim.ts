"use server";

export type NominatimResult = {
  lat: string;
  lon: string;
  display_name: string;
  place_id?: number;
};

export async function geocodeAddress(q: string): Promise<NominatimResult | null> {
  const query = q.trim();
  if (!query) return null;

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrycodes", "vn");

  const res = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      "User-Agent": "usafarm-agri-geocoder/1.0 (contact: support@usafarm-agri.com)",
    },
    next: { revalidate: 86400 },
  });

  if (!res.ok) {
    throw new Error(`Không thể geocode (${res.status})`);
  }

  const data = (await res.json()) as NominatimResult[];
  return data[0] ?? null;
}
