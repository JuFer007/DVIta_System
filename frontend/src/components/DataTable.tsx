import React, { useState } from "react";
import styles from "../styles/DataTable.module.css";

interface DataTableProps {
  columns: Array<{ key: string; label: string; render?: (val: any, row: any) => React.ReactNode }>;
  data: any[];
  title: string;
  onNew?: () => void;
  badge?: any;
}

export default function DataTable({ columns, data, title, onNew, badge }: DataTableProps) {
  const [search, setSearch] = useState("");
  const filtered = data.filter(row =>
    Object.values(row).some(v =>
      String(v).toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h3 className={styles.title}>{title}</h3>
          {badge !== undefined && <span className={styles.badge}>{filtered.length}</span>}
        </div>
        <div className={styles.actions}>
          <div className={styles.searchBox}>
            <SearchIcon />
            <input
              className={styles.search}
              placeholder="Buscar…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {onNew && (
            <button className={styles.btnNew} onClick={onNew}>
              <PlusIcon /> Nuevo
            </button>
          )}
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map(c => (
                <th key={c.key} className={styles.th}>{c.label}</th>
              ))}
              <th className={styles.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className={styles.empty}>
                  <EmptyIcon />
                  <p>No se encontraron registros</p>
                </td>
              </tr>
            ) : (
              filtered.map((row, i) => (
                <tr key={i} className={styles.tr} style={{ animationDelay: `${i * 30}ms` }}>
                  {columns.map(c => (
                    <td key={c.key} className={styles.td}>
                      {c.render ? c.render(row[c.key], row) : row[c.key]}
                    </td>
                  ))}
                  <td className={styles.td}>
                    <div className={styles.rowActions}>
                      <button className={styles.btnEdit} title="Editar"><EditIcon /></button>
                      <button className={styles.btnDel} title="Eliminar"><TrashIcon /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className={styles.footer}>
        <span className={styles.count}>{filtered.length} registros</span>
      </div>
    </div>
  );
}

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M12 5v14M5 12h14"/>
  </svg>
);
const EditIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6M9 6V4h6v2"/>
  </svg>
);
const EmptyIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" opacity=".3">
    <circle cx="12" cy="12" r="10"/><path d="M8 15s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/>
  </svg>
);
