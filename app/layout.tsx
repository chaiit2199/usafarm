import "@/styles/app.scss";
import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { customMetadata, customViewport } from "@/components/custom-metadata";
import { FlashProvider } from "@/components/flash";
import { FLASH_COOKIE, decodeFlash } from "@/lib/flash/flash";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
export const metadata: Metadata = customMetadata;
export const viewport: Viewport = customViewport;

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const cookieStore = await cookies();
  const initialFlash = decodeFlash(cookieStore.get(FLASH_COOKIE)?.value);

  return (
    <html className={inter.className} lang="vi" data-theme="light">
      <body className="overflow-hidden">
        <FlashProvider initialFlash={initialFlash}>{children}</FlashProvider>
      </body>
    </html>
  );
}
