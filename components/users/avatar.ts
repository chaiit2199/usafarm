const DEFAULT_COLOR = "#3B7A57";

export function getInitials(fullname?: string | null): string {
  if (!fullname?.trim()) return "??";

  const parts = fullname.trim().split(/\s+/u).filter(Boolean);

  if (parts.length === 0) return "??";

  if (parts.length === 1) {
    return graphemeInitial(parts[0]).toUpperCase();
  }

  const first = graphemeInitial(parts[0]);
  const last = graphemeInitial(parts[parts.length - 1]);
  return `${first}${last}`.toUpperCase();
}

function graphemeInitial(word: string): string {
  return Array.from(word)[0] ?? "";
}

export function getColor(fullname?: string | null): string {
  if (!fullname?.trim()) return DEFAULT_COLOR;

  const value = fullname.trim().toLowerCase();
  let hash = 0;

  for (let i = 0; i < value.length; i += 1) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash) % 360;
  return hslToHex(hue, 0.48, 0.45);
}

function hslToHex(h: number, s: number, l: number): string {
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };

  return `#${f(0)}${f(8)}${f(4)}`;
}

export function normalizeRole(role?: string | number | null): string {
  if (role === null || role === undefined || role === "") return "1002";
  return String(role);
} 