import type { ReactNode } from "react";
import Link from "next/link";

export type Column<T> = { header: string; render: (item: T) => ReactNode; align?: "left" | "right" };

export function DataTable<T extends { id: string }>({
  items,
  columns,
  emptyTitle = "No records found",
  emptyDescription = "Add a record or adjust the current filters.",
  rowHref,
}: {
  items: T[];
  columns: Column<T>[];
  emptyTitle?: string;
  emptyDescription?: string;
  rowHref?: (item: T) => string;
}) {
  if (items.length === 0) {
    return (
      <div className="card table-empty">
        <h3 className="state-title">{emptyTitle}</h3>
        <p className="state-description">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="card table-card">
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.header} scope="col" style={{ textAlign: column.align ?? "left" }}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                {columns.map((column, index) => (
                  <td key={column.header} style={{ textAlign: column.align ?? "left" }}>
                    {index === 0 && rowHref ? <Link href={rowHref(item)}>{column.render(item)}</Link> : column.render(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
