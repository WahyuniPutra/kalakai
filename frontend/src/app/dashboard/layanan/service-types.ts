export const requestStatuses = {
  submitted: "Diajukan",
  quoted: "Ada penawaran",
  accepted: "Penawaran diterima",
  in_progress: "Dikerjakan",
  completed: "Selesai",
  cancelled: "Dibatalkan",
} as const;

export type RequestStatus = keyof typeof requestStatuses;
export type ServiceItem = {
  id: number;
  title: string;
  description: string | null;
  status: RequestStatus;
  quantity: number | null;
  quoted_price: number | string | null;
  details?: { quote_note?: string | null } | null;
  created_at: string;
  user?: { id: number; name: string };
  event?: { id: number; title: string } | null;
  partner_profile?: { id: number; business_name: string };
};
export type PartnerChoice = { id: number; business_name: string; category: string; city: string | null };

export function rupiah(value: number | string) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(value));
}
