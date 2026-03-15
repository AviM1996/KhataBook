import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import styles from './SalesPaymentChart.module.css';

const formatCurrency = (v) =>
  v >= 100000
    ? `₹${(v / 100000).toFixed(1)}L`
    : v >= 1000
    ? `₹${(v / 1000).toFixed(0)}k`
    : `₹${v}`;

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipLabel}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className={styles.tooltipValue}>
          {p.name}: ₹{p.value.toLocaleString('en-IN')}
        </p>
      ))}
      <p className={styles.tooltipHint}>Click to view details →</p>
    </div>
  );
};

/**
 * SalesPaymentChart – Line chart comparing Sales vs Payments over time
 * @param {Array} data - Array of { label, sales, payment }
 * @param {function} [onPointClick] - Called with { label, sales, payment } when a data point is clicked
 */
export default function SalesPaymentChart({ data = [], onPointClick }) {
  const handleClick = (point) => {
    if (onPointClick && point?.activePayload?.length) {
      const payload = point.activePayload[0].payload;
      onPointClick(payload);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Sales vs Payments</h3>
        <span className={styles.subtitle}>Business performance trend</span>
      </div>
      <div className={`${styles.chartWrap} ${onPointClick ? styles.clickable : ''}`}>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart
            data={data}
            margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
            onClick={handleClick}
          >
            <defs>
              <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="paymentGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
            <XAxis
              dataKey="label"
              stroke="var(--text-tertiary)"
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: 'var(--border-color)' }}
              tickLine={false}
            />
            <YAxis
              stroke="var(--text-tertiary)"
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatCurrency}
              width={50}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ paddingTop: 12, fontSize: 13, fontWeight: 600 }}
              formatter={(value) => (
                <span style={{ color: 'var(--text-primary)', marginLeft: 4 }}>{value}</span>
              )}
            />
            <Line
              type="monotone"
              dataKey="sales"
              stroke="#22c55e"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#22c55e', strokeWidth: 0 }}
              activeDot={{ r: 7, fill: '#22c55e', stroke: '#fff', strokeWidth: 2, cursor: 'pointer' }}
              name="Sales"
            />
            <Line
              type="monotone"
              dataKey="payment"
              stroke="#38bdf8"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#38bdf8', strokeWidth: 0 }}
              activeDot={{ r: 7, fill: '#38bdf8', stroke: '#fff', strokeWidth: 2, cursor: 'pointer' }}
              name="Payments"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
