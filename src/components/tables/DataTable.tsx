import type { ReactNode } from "react";

export type Column<T> = { header: string; render: (item: T) => ReactNode };

export function DataTable<T extends { id: string }>({ items, columns }: { items: T[]; columns: Column<T>[] }) {
  return (
    <div className="card table-card">
      <div className="table-wrap">
        <table>
          <thead><tr>{columns.map((column) => <th key={column.header}>{column.header}</th>)}</tr></thead>
          <tbody>
            {items.map((item) => <tr key={item.id}>{columns.map((column) => <td key={column.header}>{column.render(item)}</td>)}</tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}
