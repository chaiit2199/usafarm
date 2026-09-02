import { Dashboard } from "@/components/dashboard";
import Image from "next/image";


export default function NotFound() {
  return (
    <div className="flex items-center justify-center flex-col px-4 bg-white min-h-screen">
      <Image src="/images/banners/404-banner.jpg" alt="banner" width={515} height={515} />
      <div className="flex justify-center flex-col max-w-[510px] w-full">
        <p className="text-2xl font-smb mb-3 text-center">Trang không tồn tại</p>
        <p className="mb-6 text-center">
          Ôi không! Có vẻ bạn đang tìm một trang đã bị xóa, đổi tên hoặc chưa bao giờ tồn tại.
        </p>
        <div className="flex justify-center">
          <a
            href="/"
            className="rounded-xl bg-primary hover:bg-primary/80 transition-all duration-300 text-white font-semibold flex items-center justify-center px-5 h-10"
          >
            Về Trang chủ
          </a>
        </div>
      </div>
    </div>
  );
}
