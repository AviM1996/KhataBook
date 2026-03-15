import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import styles from './AccountsAgingChart.module.css';

const BUCKET_COLORS = ['#22c55e', '#facc15', '#f97316', '#ef4444'];

const formatCurrency = (v) =>
  v >= 100000
    ? `₹${(v / 100000).toFixed(1)}L`
    : v >= 1000
    ? `₹${(v / 1000).toFixed(1)}k`
    : `₹${v}`;

const CustomTooltip = ({ active, payload, showHint }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipBucket}>{d.bucket}</p>
      <p className={styles.tooltipAmount}>₹{d.amount.toLocaleString('en-IN')}</p>
      {showHint && <p className={styles.tooltipHint}>Click to view customers →</p>}
    </div>
  );
};

/**
 * AccountsAgingChart – Horizontal bar chart for receivable/payable aging
 * @param {string} title - e.g. "Receivable Aging" or "Payable Aging"
 * @param {Array} data - Array of { bucket, amount }
 * @param {function} [onBarClick] - Called with { bucket, amount } when a bar is clicked
 */
export default function AccountsAgingChart({ title, data = [], onBarClick }) {
  const handleClick = (entry) => {
    if (onBarClick && entry) {
      onBarClick(entry);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        <span className={styles.badge}>Static</span>
      </div>
      <div className={`${styles.chartWrap} ${onBarClick ? styles.clickable : ''}`}>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <XAxis
              type="number"
              stroke="var(--text-tertiary)"
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatCurrency}
            />
            <YAxis
              dataKey="bucket"
              type="category"
              stroke="var(--text-tertiary)"
              tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
              axisLine={false}
              tickLine={false}
              width={85}
            />
            <Tooltip
              content={<CustomTooltip showHint={!!onBarClick} />}
              cursor={{ fill: 'var(--bg-hover)', opacity: 0.4 }}
            />
            <Bar
              dataKey="amount"
              radius={[0, 6, 6, 0]}
              maxBarSize={24}
              onClick={(entry) => handleClick(entry)}
              style={{ cursor: onBarClick ? 'pointer' : 'default' }}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={BUCKET_COLORS[i % BUCKET_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Summary row */}
      <div className={styles.summary}>
        {data.map((d, i) => (
          <div
            key={i}
            className={`${styles.summaryItem} ${onBarClick ? styles.summaryClickable : ''}`}
            onClick={() => onBarClick?.(d)}
          >
            <span
              className={styles.summaryDot}
              style={{ background: BUCKET_COLORS[i % BUCKET_COLORS.length] }}
            />
            <span className={styles.summaryBucket}>{d.bucket}</span>
            <span className={styles.summaryAmount}>{formatCurrency(d.amount)}</span>
            {onBarClick && <span className={styles.summaryArrow}>→</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
