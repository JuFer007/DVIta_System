import { useState, type ReactNode } from "react";
import { Search, Plus, Pencil, ArrowUpDown, ArrowUp, ArrowDown, Loader2, Inbox } from "lucide-react";

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (value: any, row: T) => ReactNode;
  sortable?: boolean;
}

interface Props<T> {
  title: string;
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  error?: string | null;
  onNew?: () => void;
  onEdit?: (row: T) => void;
}

type SortDir = "asc" | "desc";

function getValue(v: any): any {
  if (v == null || v === "—") return "";
  const n = Number(v);
  return !isNaN(n) && v !== "" ? n : String(v);
}

function compare(a: any, b: any, dir: SortDir): number {
  const va = getValue(a);
  const vb = getValue(b);
  const mul = dir === "asc" ? 1 : -1;
  if (typeof va === "number" && typeof vb === "number") return (va - vb) * mul;
  return String(va).localeCompare(String(vb), "es", { sensitivity: "base" }) * mul;
}

const SortIcon = ({ dir }: { dir?: SortDir }) => {
  if (dir === "asc") return <ArrowUp className="w-3 h-3 inline-block ml-1" />;
  if (dir === "desc") return <ArrowDown className="w-3 h-3 inline-block ml-1" />;
  return <ArrowUpDown className="w-3 h-3 inline-block ml-1 opacity-30" />;
};

export default function DataTable<T extends Record<string, any>>({
  title,
  columns,
  data,
  loading,
  error,
  onNew,
  onEdit,
}: Props<T>) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(columns[0]?.key as string ?? null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDir === "asc") setSortDir("desc");
      else { setSortKey(null); setSortDir("asc"); }
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const filtered = data.filter((row) =>
    Object.values(row).some((v) =>
      String(v).toLowerCase().includes(search.toLowerCase())
    )
  );

  const sorted = sortKey
    ? [...filtered].sort((a, b) => compare(a[sortKey], b[sortKey], sortDir))
    : filtered;

  const hasActions = !!onEdit;
  const colspan = columns.length + 1 + (hasActions ? 1 : 0);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-gray-800">{title}</h2>
          <span className="bg-brand-100 text-brand-700 text-xs font-semibold px-2 py-0.5 rounded-full">
            {filtered.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
            <input
              className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-100 w-44"
              placeholder="Buscar…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {onNew && (
            <button
              onClick={onNew}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Nuevo
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="px-5 py-2 bg-yellow-50 border-b border-yellow-100 text-yellow-700 text-xs">
          ⚠ {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap w-10">
                #
              </th>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  onClick={() => col.sortable !== false && handleSort(String(col.key))}
                  className={`px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wide whitespace-nowrap ${
                    col.sortable !== false
                      ? "cursor-pointer select-none hover:text-gray-700 hover:bg-gray-100 transition-colors"
                      : "text-gray-500"
                  } ${sortKey === String(col.key) ? "text-brand-700" : "text-gray-500"}`}
                >
                  {col.label}
                  {col.sortable !== false && <SortIcon dir={sortKey === String(col.key) ? sortDir : undefined} />}
                </th>
              ))}
              {onEdit && (
                <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  ACCIONES
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={colspan} className="px-4 py-16 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-brand-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Cargando datos…</p>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={colspan} className="px-4 py-16 text-center">
                  <Inbox className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-500 mb-1">Sin registros</p>
                  <p className="text-xs text-gray-400">{search ? "No hay resultados para esta búsqueda" : "Aún no hay datos registrados"}</p>
                </td>
              </tr>
            ) : (
              sorted.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-gray-50 hover:bg-brand-50 transition-colors"
                >
                  <td className="px-4 py-3 text-left text-gray-400 text-xs whitespace-nowrap">{i + 1}</td>
                  {columns.map((col) => (
                    <td key={String(col.key)} className="px-4 py-3 text-left text-gray-700 whitespace-nowrap">
                      {col.render
                        ? col.render(row[col.key as string], row)
                        : row[col.key as string] ?? "—"}
                    </td>
                  ))}
                  {onEdit && (
                    <td className="px-4 py-3">
                      <button
                        onClick={() => onEdit(row)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold text-brand-700 bg-brand-100 hover:bg-brand-200 rounded-lg transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        EDITAR
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-5 py-2.5 bg-gray-50 border-t border-gray-100">
        <span className="text-xs text-gray-400">{filtered.length} registro(s)</span>
      </div>
    </div>
  );
}
