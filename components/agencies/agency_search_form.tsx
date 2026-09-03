"use client";

import dynamic from "next/dynamic";
import { useState, type FormEvent } from "react";

import { Input } from "@/components/input";
import { Icon } from "@/components/icon";
import { geocodeAddress, type NominatimResult } from "@/lib/geocode/nominatim";

const AgencyMap = dynamic(
  () => import("@/components/agencies/agency_map").then((mod) => mod.AgencyMap),
  {
    ssr: false,
    loading: () => <p className="agency-search__hint">Đang tải bản đồ…</p>,
  },
);

export function AgencySearchForm() {
  const [place, setPlace] = useState<NominatimResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = String(new FormData(event.currentTarget).get("q") ?? "").trim();
    if (!q) return;

    setLoading(true);
    setError(null);

    try {
      const result = await geocodeAddress(q);
      setPlace(result);
      if (!result) setError("Không tìm thấy địa chỉ.");
    } catch (err) {
      setPlace(null);
      setError(err instanceof Error ? err.message : "Không thể geocode.");
    } finally {
      setLoading(false);
    }
  }

  const lat = place ? Number(place.lat) : NaN;
  const lon = place ? Number(place.lon) : NaN;
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lon);

  return (
    <div className="agency-search overflow-y-auto"> 

      <form onSubmit={handleSubmit} className="agency-search__form">
        <div className="agency-search__field">
          <Input
            id="agency-search-q"
            name="q"
            type="search"
            label="Địa chỉ"
            placeholder="VD: 161 Võ Văn Tần, Quận 3, Hồ Chí Minh"
            autoComplete="off"
            required
          />
        </div>
        <button
          type="submit"
          className="core_button core_button--primary agency-search__submit"
          disabled={loading}
        >
          <Icon name="hero-magnifying-glass" className="size-4" />
          {loading ? "Đang tìm…" : "Tìm kiếm"}
        </button>
      </form>

      {error && <p className="agency-search__error">{error}</p>}

      {place && hasCoords && (
        <div className="agency-search__result">
          <p className="agency-search__address">{place.display_name}</p>
          <p className="agency-search__coords">
            Lat: {place.lat} · Lon: {place.lon}
          </p>
          <AgencyMap lat={lat} lon={lon} label={place.display_name} />
        </div>
      )}
    </div>
  );
}
