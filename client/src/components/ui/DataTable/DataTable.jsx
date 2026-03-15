import React from 'react';
import styles from './DataTable.module.css';
import { EmptyState } from '../../index';

/**
 * Reusable DataTable component with configurable columns
 * @param {Array<{key: string, label: string, render?: function, align?: string}>} columns - Column definitions
 * @param {Array<Object>} data - Row data
 * @param {boolean} [loading=false] - Loading state
 * @param {string} [emptyTitle='No records found'] - Empty state title
 * @param {string} [emptyDescription=''] - Empty state description
 * @param {number} [serialNumberStart=0] - SL No offset
 */
export default function DataTable({
  columns,
  data,
  loading = false,
  emptyTitle = 'No records found',
  emptyDescription = '',
  serialNumberStart = 0,
}) {
  return (
    <div className={styles.tableWrapper}>
      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <p>Loading records...</p>
        </div>
      ) : data.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>SL No</th>
              {columns.map((col) => (
                <th key={col.key} style={col.align ? { textAlign: col.align } : undefined}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={row.id || row._id || index} className={styles.row}>
                <td className={styles.slNo}>{serialNumberStart + index + 1}</td>
                {columns.map((col) => (
                  <td
                    key={col.key}
                    style={col.align ? { textAlign: col.align } : undefined}
                  >
                    {col.render ? col.render(row, index) : row[col.key] ?? '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
