"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Icon } from "@/components/icon";
import {
  FLASH_COOKIE,
  FLASH_COOKIE_PATH,
  FLASH_EVENT,
  FLASH_TITLES,
  type FlashKind,
  type FlashPayload,
} from "@/lib/flash/flash";

const SLIDE_MS = 300;

const FLASH_ICONS: Record<FlashKind, string> = {
  info: "hero-information-circle-mini",
  success: "hero-check-circle-mini",
  error: "hero-exclamation-circle-mini",
};

type FlashProviderProps = {
  children: React.ReactNode;
  initialFlash?: FlashPayload | null;
};

export { putFlash } from "@/lib/flash/flash";

function clearFlashCookie() {
  const expired = `${FLASH_COOKIE}=; Max-Age=0; Path=${FLASH_COOKIE_PATH}; SameSite=Lax`;
  document.cookie = expired;
  document.cookie = `${expired}; Secure`;
}

export function FlashProvider({ children, initialFlash = null }: FlashProviderProps) {
  const [items, setItems] = useState<FlashPayload[]>(initialFlash ? [initialFlash] : []);
  const seenIds = useRef(new Set(initialFlash ? [initialFlash.id] : []));

  const enqueue = useCallback((payload: FlashPayload) => {
    if (seenIds.current.has(payload.id)) return;
    seenIds.current.add(payload.id);

    setItems((current) => [...current.filter((item) => item.kind !== payload.kind), payload]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  useEffect(() => {
    clearFlashCookie();
    if (initialFlash) enqueue(initialFlash);
  }, [enqueue, initialFlash]);

  useEffect(() => {
    function onFlash(event: Event) {
      const payload = (event as CustomEvent<FlashPayload>).detail;
      if (!payload?.message) return;
      enqueue(payload);
    }

    window.addEventListener(FLASH_EVENT, onFlash);
    return () => window.removeEventListener(FLASH_EVENT, onFlash);
  }, [enqueue]);

  return (
    <>
      {children}
      <div className="core_flash_group">
        {items.map((item) => (
          <FlashCard key={item.id} item={item} onDismiss={dismiss} />
        ))}
      </div>
    </>
  );
}

function FlashCard({
  item,
  onDismiss,
}: {
  item: FlashPayload;
  onDismiss: (id: string) => void;
}) {
  const [phase, setPhase] = useState<"enter" | "shown" | "leave">("enter");
  const cardRef = useRef<HTMLDivElement>(null);

  const dismiss = useCallback(() => {
    setPhase((current) => (current === "leave" ? current : "leave"));
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setPhase((current) => (current === "enter" ? "shown" : current));
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (phase !== "leave") return;
    const timeoutId = window.setTimeout(() => onDismiss(item.id), SLIDE_MS);
    return () => window.clearTimeout(timeoutId);
  }, [item.id, onDismiss, phase]);

  useEffect(() => {
    if (phase !== "shown" || !item.duration) return;

    const el = cardRef.current;
    let remaining = item.duration;
    let startedAt = Date.now();
    let timeoutId = 0;
    let paused = false;

    function schedule() {
      timeoutId = window.setTimeout(dismiss, remaining);
    }

    function onEnter() {
      if (paused) return;
      paused = true;
      remaining -= Date.now() - startedAt;
      window.clearTimeout(timeoutId);
    }

    function onLeave() {
      if (!paused) return;
      paused = false;
      startedAt = Date.now();
      schedule();
    }

    schedule();
    el?.addEventListener("mouseenter", onEnter);
    el?.addEventListener("mouseleave", onLeave);

    return () => {
      window.clearTimeout(timeoutId);
      el?.removeEventListener("mouseenter", onEnter);
      el?.removeEventListener("mouseleave", onLeave);
    };
  }, [dismiss, item.duration, phase]);

  const slideClass =
    phase === "leave"
      ? "flash-slide-out flash-slide-out-end"
      : phase === "shown"
        ? "flash-slide-right flash-slide-right-end"
        : "flash-slide-right flash-slide-right-start";

  return (
    <div
      ref={cardRef}
      id={`flash-${item.kind}`}
      role="alert"
      className={["core_flash group", `core_flash--${item.kind}`, slideClass].join(" ")}
      onClick={dismiss}
    >
      <p className="core_flash__title">
        <Icon name={FLASH_ICONS[item.kind]} className="h-5 w-5" />
        {FLASH_TITLES[item.kind]}
      </p>
      <p className="core_flash__content">{item.message}</p>
      <button type="button" className="core_flash__close" aria-label="Đóng" onClick={dismiss}>
        <Icon name="hero-x-mark-solid" className="h-5 w-5" />
      </button>
      {item.duration ? (
        <span
          className="core_flash__progress group-hover:[animation-play-state:paused]"
          style={{ animationDuration: `${item.duration}ms` }}
        />
      ) : null}
    </div>
  );
}
