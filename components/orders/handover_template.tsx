"use client";

import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";

import type { GoodsIssue } from "@/lib/api/types";

function SlipCell({
  children,
  header = false,
  left = false,
  colSpan,
}: {
  children?: React.ReactNode;
  header?: boolean;
  left?: boolean;
  colSpan?: number;
}) {
  const Tag = header ? "th" : "td";
  return (
    <Tag colSpan={colSpan} className={left ? "is-left" : undefined}>
      {children}
    </Tag>
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatIssuedDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const day = date.getDate();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `Ngày ${day} tháng ${month} năm ${date.getFullYear()}`;
}

export function HandoverTemplate({ issue }: { issue: GoodsIssue }) {
  const rows = issue.lines ?? [];
  const totalBags =
    issue.total_quantity ?? rows.reduce((sum, line) => sum + (line.quantity ?? 0), 0);
  const totalKg =
    issue.total_weight_kg ??
    rows.reduce(
      (sum, line) => sum + (line.quantity ?? 0) * (line.packaging_weight_kg ?? 0),
      0,
    );
  const formCode = issue.form_code ? `Mẫu số ${issue.form_code}` : "Mẫu số 02 - VT";

  return (
    <div className="goods-issue-slip">
      <header className="goods-issue-slip__header">
        <div className="goods-issue-slip__brand">
          <img src="/images/logo.png" alt="USA Farm Agri" className="goods-issue-slip__logo" />
        </div>
        <p className="goods-issue-slip__company">
          CÔNG TY TNHH NÔNG NGHIỆP
          <br />
          USA FARM
        </p>
        <div className="goods-issue-slip__form-meta">
          <strong>{formCode}</strong>
          <em>(Ban hành theo Thông tư số 200/2014/TT-BTC</em>
          <br />
          <em>Ngày 22/12/2014 của Bộ Tài chính)</em>
        </div>
      </header>

      <div className="goods-issue-slip__title">
        <h1>PHIẾU XUẤT KHO</h1>
        <p>{formatIssuedDate(issue.issued_at)}</p>
        <p>Số phiếu: {issue.code}</p>
      </div>

      <table className="goods-issue-slip__info">
        <tbody>
          <tr>
            <td>Họ và tên người nhận: {issue.agency_name ?? ""}</td>
            <td>Nhà Vận Chuyển : {issue.carrier_name}</td>
          </tr>
          <tr>
            <td>Lý do xuất kho : Xuất hàng cho {issue.agency_name ?? ""}</td>
            <td>Số CMND/CCCD: {issue.driver_identity_or_phone ?? ""}</td>
          </tr>
          <tr>
            <td>Xuất tại kho : {issue.warehouse_name}</td>
            <td>Lái xe: {issue.driver_name}</td>
          </tr>
          <tr>
            <td></td>
            <td>Số Xe : {issue.vehicle_plate}</td>
          </tr>
        </tbody>
      </table>

      <table className="goods-issue-slip__table">
        <thead>
          <tr>
            <SlipCell header>STT</SlipCell>
            <SlipCell header>Tên hàng hoá, mẫu bao</SlipCell>
            <SlipCell header>Quy cách bao</SlipCell>
            <SlipCell header>Đơn vị tính</SlipCell>
            <SlipCell header colSpan={2}>
              Số lượng
            </SlipCell>
            <SlipCell header>Đơn giá</SlipCell>
            <SlipCell header>Thành tiền</SlipCell>
          </tr>
          <tr>
            <SlipCell header>A</SlipCell>
            <SlipCell header>B</SlipCell>
            <SlipCell header>C</SlipCell>
            <SlipCell header>D</SlipCell>
            <SlipCell header>Số kg 1</SlipCell>
            <SlipCell header>Số túi/bao 2</SlipCell>
            <SlipCell header>3</SlipCell>
            <SlipCell header>4</SlipCell>
          </tr>
        </thead>
        <tbody>
          {rows.map((line, index) => (
            <tr key={`${line.id}-${index}`}>
              <SlipCell>{index + 1}</SlipCell>
              <SlipCell left>{line.sku_name}</SlipCell>
              <SlipCell>{line.packaging_weight_kg ?? "—"}</SlipCell>
              <SlipCell>{line.unit ?? "kg"}</SlipCell>
              <SlipCell>{formatNumber((line.quantity ?? 0) * (line.packaging_weight_kg ?? 0))}</SlipCell>
              <SlipCell>{line.quantity}</SlipCell>
              <SlipCell />
              <SlipCell />
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <SlipCell colSpan={2}>Tổng Cộng</SlipCell>
            <SlipCell>x</SlipCell>
            <SlipCell>x</SlipCell>
            <SlipCell>{formatNumber(totalKg)}</SlipCell>
            <SlipCell>{totalBags}</SlipCell>
            <SlipCell />
            <SlipCell />
          </tr>
          <tr>
            <SlipCell colSpan={8} left>
              <div className="mb-2">Tổng số tiền bằng chữ: ………………………………………………………………………………………………………………</div>
              <div>Số chứng từ kèm theo: ………………………………………………………………………………………………………………</div>
            </SlipCell>
          </tr>
          <tr>
            <SlipCell colSpan={8} left>
              <i>
                GHI CHÚ: Quý khách vui lòng kiểm tra hàng hoá trước khi rời khỏi kho, mọi
                thắc mắc liên quan đến vấn đề về hàng hoá sau này chúng tôi sẽ không giải
                quyết trân trọng cảm ơn!
              </i>
            </SlipCell>
          </tr>
        </tfoot>
      </table>

      <SlipSignatures />
    </div>
  );
}

function SlipSignatures() {
  const roles: Array<{ title: string; name?: string }> = [
    { title: "Người lập phiếu", name: "Nguyễn Tấn Đạt" },
    { title: "Người nhận hàng" },
    { title: "Thủ kho" },
    { title: "Bảo vệ" },
    { title: "Giám đốc" },
  ];

  return (
    <table className="goods-issue-slip__signs">
      <tbody>
        <tr>
          {roles.map((role) => (
            <td key={role.title}>
              <p>{role.title}</p>
              <p>(Ký, họ tên)</p>
              {role.name ? <strong>{role.name}</strong> : null}
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  );
}

const SLIP_PAGE_WIDTH = 1200;
const SLIP_PAGE_HEIGHT = 800;
const SLIP_CAPTURE_SCALE = 2;

function prepareCloneForCapture(doc: Document) {
  doc.documentElement.style.setProperty("line-height", "1", "important");
  doc.body.style.setProperty("line-height", "1", "important");
  doc.body.style.setProperty("font-size", "12px", "important");
  doc.body.style.setProperty("font-family", '"Times New Roman", Times, serif', "important");
}

function keepBlockOnOnePage(slip: HTMLElement, selector: string, pageHeight: number, forceNextPage = false) {
  const block = slip.querySelector(selector);
  if (!(block instanceof HTMLElement)) return;
  const offsetInPage = block.offsetTop % pageHeight;
  if (offsetInPage === 0) return;
  const wouldSplit = offsetInPage + block.offsetHeight > pageHeight;
  if (!forceNextPage && !wouldSplit) return;
  const spacer = document.createElement("div");
  spacer.style.height = `${pageHeight - offsetInPage}px`;
  block.parentElement?.insertBefore(spacer, block);
}

function sliceCanvasPages(source: HTMLCanvasElement, pageHeightPx: number) {
  const pages: HTMLCanvasElement[] = [];
  let y = 0;
  while (y < source.height) {
    const remaining = source.height - y;
    if (remaining <= 4) break;
    const sliceHeight = Math.min(pageHeightPx, remaining);
    const page = document.createElement("canvas");
    page.width = source.width;
    page.height = pageHeightPx;
    const ctx = page.getContext("2d");
    if (!ctx) break;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, page.width, page.height);
    ctx.drawImage(source, 0, y, source.width, sliceHeight, 0, 0, source.width, sliceHeight);
    pages.push(page);
    y += pageHeightPx;
  }
  return pages;
}

export async function exportHandoverPdf(issue: GoodsIssue) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  const host = document.createElement("div");
  Object.assign(host.style, {
    position: "fixed", 
    left: "0",
    top: "0",
    width: `${SLIP_PAGE_WIDTH}px`,
    background: "#ffffff",
    color: "#111111",
    zIndex: "-1",
  });
  document.body.appendChild(host);

  const root = createRoot(host);
  try {
    flushSync(() => {
      root.render(<HandoverTemplate issue={issue} />);
    });

    const slip = host.querySelector(".goods-issue-slip");
    if (!(slip instanceof HTMLElement) || slip.offsetWidth === 0 || slip.offsetHeight === 0) {
      throw new Error("Không capture được phiếu xuất kho");
    }

    await Promise.all(
      Array.from(slip.querySelectorAll("img")).map((img) =>
        img.complete
          ? Promise.resolve()
          : new Promise<void>((resolve) => {
              img.addEventListener("load", () => resolve(), { once: true });
              img.addEventListener("error", () => resolve(), { once: true });
            }),
      ),
    );
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }
    keepBlockOnOnePage(
      slip,
      ".goods-issue-slip__signs",
      SLIP_PAGE_HEIGHT,
      (issue.lines?.length ?? 0) > 5,
    );
    await new Promise((resolve) => setTimeout(resolve, 50));

    const canvas = await html2canvas(slip, {
      scale: SLIP_CAPTURE_SCALE,
      backgroundColor: "#ffffff",
      useCORS: true,
      width: SLIP_PAGE_WIDTH,
      windowWidth: SLIP_PAGE_WIDTH,
      scrollX: -window.scrollX,
      scrollY: -window.scrollY,
      onclone: prepareCloneForCapture,
    });

    if (!canvas.width || !canvas.height) {
      throw new Error("Không capture được phiếu xuất kho");
    }

    const pages = sliceCanvasPages(canvas, SLIP_PAGE_HEIGHT * SLIP_CAPTURE_SCALE);
    if (pages.length === 0) {
      throw new Error("Không capture được phiếu xuất kho");
    }

    const pdf = new jsPDF({
      unit: "px",
      format: [SLIP_PAGE_WIDTH, SLIP_PAGE_HEIGHT],
      orientation: "landscape",
      hotfixes: ["px_scaling"],
    });

    pages.forEach((page, index) => {
      if (index > 0) {
        pdf.addPage([SLIP_PAGE_WIDTH, SLIP_PAGE_HEIGHT], "landscape");
      }
      pdf.addImage(page.toDataURL("image/jpeg", 0.98), "JPEG", 0, 0, SLIP_PAGE_WIDTH, SLIP_PAGE_HEIGHT);
    });

    pdf.save(`${issue.code}.pdf`);
  } finally {
    root.unmount();
    host.remove();
  }
}
