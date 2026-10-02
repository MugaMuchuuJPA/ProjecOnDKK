export interface BeltInfo {
  label: string;
  colorClass: string;
  borderClass: string;
  bgHex: string;
}

export const BELT_MAP: Record<string, BeltInfo> = {
  "7_kyu_branca": { label: "Branca (7° Kyu)", colorClass: "bg-white text-black", borderClass: "border-neutral-300", bgHex: "#FFFFFF" },
  "6_kyu_amarela": { label: "Amarela (6° Kyu)", colorClass: "bg-yellow-400 text-black", borderClass: "border-yellow-500", bgHex: "#EAB308" },
  "5_kyu_vermelha": { label: "Vermelha (5° Kyu)", colorClass: "bg-dragao-red text-white", borderClass: "border-red-700", bgHex: "#C8102E" },
  "4_kyu_laranja": { label: "Laranja (4° Kyu)", colorClass: "bg-orange-500 text-white", borderClass: "border-orange-600", bgHex: "#F97316" },
  "3_kyu_verde": { label: "Verde (3° Kyu)", colorClass: "bg-emerald-600 text-white", borderClass: "border-emerald-700", bgHex: "#059669" },
  "2_kyu_roxa": { label: "Roxa (2° Kyu)", colorClass: "bg-purple-600 text-white", borderClass: "border-purple-700", bgHex: "#9333EA" },
  "1_kyu_marrom": { label: "Marrom (1° Kyu)", colorClass: "bg-amber-900 text-white", borderClass: "border-amber-950", bgHex: "#78350F" },
  "1_dan_preta": { label: "Preta (1° Dan)", colorClass: "bg-dragao-black text-white", borderClass: "border-neutral-700", bgHex: "#111111" },
};
