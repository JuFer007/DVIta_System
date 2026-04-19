import type { LucideIcon } from "lucide-react";
 
interface Props {
  title: string;
  value: string | number;
  sub: string;
  icon: LucideIcon;
  color?: "brand" | "green" | "blue" | "yellow";
}
 
const colorMap = {
  brand:  { bg: "bg-brand-50",  text: "text-brand-600",  border: "border-t-brand-500" },
  green:  { bg: "bg-green-50",  text: "text-green-600",  border: "border-t-green-500" },
  blue:   { bg: "bg-blue-50",   text: "text-blue-600",   border: "border-t-blue-500" },
  yellow: { bg: "bg-yellow-50", text: "text-yellow-600", border: "border-t-yellow-500" },
};
 
export default function StatsCard({ title, value, sub, icon: Icon, color = "brand" }: Props) {
  const c = colorMap[color];
  return (
    <div className={`bg-white rounded-xl border border-gray-200 border-t-2 ${c.border} p-5 animate-fade-up`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg ${c.bg} flex items-center justify-center`}>
          <Icon className={`w-4.5 h-4.5 ${c.text}`} />
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>{sub}</span>
      </div>
      <p className="font-display text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{title}</p>
    </div>
  );
}
 