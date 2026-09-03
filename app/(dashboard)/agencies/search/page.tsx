import type { Metadata } from "next";

import { Dashboard } from "@/components/dashboard";
import { AgencySearchForm } from "@/components/agencies/agency_search_form";
import { pageMetadata } from "@/lib/dashboard/navbar";

export const metadata: Metadata = pageMetadata("/agencies");

export default function AgenciesSearchPage() {
  return (
    <Dashboard id="agency-search-main">
      <AgencySearchForm />
    </Dashboard>
  );
}
