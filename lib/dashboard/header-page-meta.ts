import type { HeaderPageOptions } from "@/lib/dashboard/navbar";

type Listener = () => void;

let options: HeaderPageOptions | null = null;
const listeners = new Set<Listener>();

export function getHeaderPageOptions(): HeaderPageOptions | null {
  return options;
}

export function setHeaderPageOptions(next: HeaderPageOptions | null) {
  options = next;
  listeners.forEach((listener) => listener());
}

export function subscribeHeaderPageOptions(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
