interface Props {
  status: string;
}

const colorMap: Record<string, string> = {
  DISPONIBLE:    "bg-green-100 text-green-700",
  CONFIRMADA:    "bg-green-100 text-green-700",
  OCUPADA:       "bg-red-100 text-red-700",
  CANCELADA:     "bg-red-100 text-red-700",
  PENDIENTE:     "bg-yellow-100 text-yellow-700",
  MANTENIMIENTO: "bg-yellow-100 text-yellow-700",
  COMPLETADA:    "bg-blue-100 text-blue-700",
};

export default function StatusBadge({ status }: Props) {
  const cls = colorMap[status] ?? "bg-gray-100 text-gray-600";
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {status}
    </span>
  );
}