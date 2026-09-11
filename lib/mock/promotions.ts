import { UserStatus, type RecordStatus } from "@/lib/constants";

export type Promotion = {
  id: number;
  code: string;
  name: string;
  status: RecordStatus;
  createdAt: string;
  startsAt: string;
  endsAt: string;
};

export const MOCK_PROMOTIONS: Promotion[] = [
  {
    id: 1,
    code: "KM001",
    name: "Mua 10 tặng 1 NPK 20-20-15",
    status: UserStatus.Active,
    createdAt: "2026-08-01T08:00:00.000Z",
    startsAt: "2026-08-15T00:00:00.000Z",
    endsAt: "2026-09-30T00:00:00.000Z",
  },
  {
    id: 2,
    code: "KM002",
    name: "Giảm 5% DAP mùa vụ",
    status: UserStatus.Active,
    createdAt: "2026-07-20T08:00:00.000Z",
    startsAt: "2026-08-01T00:00:00.000Z",
    endsAt: "2026-10-31T00:00:00.000Z",
  },
  {
    id: 3,
    code: "KM003",
    name: "Tặng bao bì khi mua từ 50 bao",
    status: UserStatus.Inactive,
    createdAt: "2026-06-10T08:00:00.000Z",
    startsAt: "2026-06-15T00:00:00.000Z",
    endsAt: "2026-07-15T00:00:00.000Z",
  },
  {
    id: 4,
    code: "KM004",
    name: "Ưu đãi đại lý mới Urê",
    status: UserStatus.WaitingForApproval,
    createdAt: "2026-09-01T08:00:00.000Z",
    startsAt: "2026-09-10T00:00:00.000Z",
    endsAt: "2026-12-31T00:00:00.000Z",
  },
  {
    id: 5,
    code: "KM005",
    name: "Combo Kali + NPK cuối vụ",
    status: UserStatus.Active,
    createdAt: "2026-09-05T08:00:00.000Z",
    startsAt: "2026-09-08T00:00:00.000Z",
    endsAt: "2026-11-15T00:00:00.000Z",
  },
];
