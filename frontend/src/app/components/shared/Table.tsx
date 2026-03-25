import { ReactNode } from 'react';

interface TableColumn {
  key: string;
  label: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface TableProps {
  columns: TableColumn[];
  data: any[];
  onRowClick?: (row: any) => void;
  emptyState?: ReactNode;
}

export function Table({ columns, data, onRowClick, emptyState }: TableProps) {
  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div className="overflow-x-auto -mx-6">
      <table className="w-full">
        <thead>
          <tr style={{ borderBottom: '1px solid var(--ghost-border)' }}>
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                style={{ 
                  color: 'var(--text-secondary)',
                  width: column.width,
                  textAlign: column.align || 'left',
                }}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={idx}
              onClick={() => onRowClick?.(row)}
              className={onRowClick ? 'cursor-pointer transition-colors hover:bg-opacity-50' : ''}
              style={{ 
                borderBottom: idx < data.length - 1 ? '1px solid var(--ghost-border)' : 'none',
                background: onRowClick ? 'transparent' : undefined,
              }}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className="px-6 py-4 text-sm"
                  style={{ 
                    color: 'var(--text-primary)',
                    textAlign: column.align || 'left',
                  }}
                >
                  {row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface TableCellProps {
  children: ReactNode;
  muted?: boolean;
  bold?: boolean;
}

export function TableCell({ children, muted, bold }: TableCellProps) {
  return (
    <span
      className={bold ? 'font-medium' : ''}
      style={{
        color: muted ? 'var(--text-secondary)' : 'var(--text-primary)',
      }}
    >
      {children}
    </span>
  );
}
