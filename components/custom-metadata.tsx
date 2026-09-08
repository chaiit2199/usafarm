import type { Metadata, Viewport } from "next";

const meta_name = "USA FARM AGRI";
const meta_title = "Hệ thống quản lý phân phối phân bón";
const meta_description =
  "Nền tảng quản lý kho, đơn hàng, đại lý và sản phẩm cho USA FARM AGRI.";
const meta_url = "https://usafarm-agri.com";

export const customViewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export const customMetadata: Metadata = {
  metadataBase: new URL(meta_url),
  title: {
    default: meta_title,
    template: `%s · ${meta_name}`,
  },
  description: meta_description,
  authors: [{ name: meta_name, url: meta_url }],
  creator: meta_name,
  publisher: meta_name,
  applicationName: meta_name,
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
  appleWebApp: {
    title: meta_name,
    statusBarStyle: "default",
  },
  openGraph: {
    title: meta_title,
    description: meta_description,
    url: meta_url,
    siteName: meta_name,
    locale: "vi_VN",
    type: "website",
    images: [
      {
        url: "/images/thumbnail.jpg",
        width: 222,
        height: 180,
        alt: meta_name,
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: meta_title,
    description: meta_description,
    images: ["/images/thumbnail.jpg"],
  },
  icons: {
    icon: [{ url: "/icons/favicon.png", type: "image/png" }],
    shortcut: "/icons/favicon.png",
    apple: "/icons/favicon.png",
  },
};
