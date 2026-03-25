interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  onRowClick?: (row: any) => void;
  emptyMessage?: string;
}

export function DataTable({ columns, data, onRowClick, emptyMessage = 'Няма данни' }: DataTableProps) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl p-12 text-center" style={{ background: 'var(--bg-card)' }}>
        <p style={{ color: 'var(--text-tertiary)' }}>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-card)' }}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ background: 'var(--bg-panel)' }}>
              {columns.map((column) => (
                <th 
                  key={column.key} 
                  className={`px-6 py-4 text-${column.align || 'left'}`}
                >
                  <span className="label-utility">{column.label}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr
                key={index}
                onClick={() => onRowClick?.(row)}
                className={`
                  border-t transition-colors
                  ${onRowClick ? 'cursor-pointer hover:bg-[var(--bg-panel)]' : ''}
                `}
                style={{ borderColor: 'var(--ghost-border)' }}
              >
                {columns.map((column) => (
                  <td 
                    key={column.key} 
                    className={`px-6 py-4 text-${column.align || 'left'}`}
                  >
                    {column.render 
                      ? column.render(row[column.key], row)
                      : <span style={{ color: 'var(--text-secondary)' }}>{row[column.key]}</span>
                    }
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
