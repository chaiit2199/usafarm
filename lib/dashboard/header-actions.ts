export const HEADER_EVENT = "dashboard:header";

export type HeaderAction = "create" | "filter" | "search" | "export" | "authorization";

export type HeaderEventDetail = {
    action: HeaderAction;
    page: string;       // pathname, vd "/staff"
    query?: string;     // chỉ search
};

export function emitHeaderAction(detail: HeaderEventDetail) {
    window.dispatchEvent(new CustomEvent(HEADER_EVENT, { detail }));
}

export function subscribeHeaderAction(
    page: string,
    onAction: (detail: HeaderEventDetail) => void,
) {
    function listener(event: Event) {
        const detail = (event as CustomEvent<HeaderEventDetail>).detail;
        if (detail.page !== page) return;
        onAction(detail);
    }

    window.addEventListener(HEADER_EVENT, listener);
    return () => window.removeEventListener(HEADER_EVENT, listener);
}