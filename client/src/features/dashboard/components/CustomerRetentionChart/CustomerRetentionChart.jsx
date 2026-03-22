import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from 'recharts';
import styles from './CustomerRetentionChart.module.css';

const COLORS = ['#22c55e', '#38bdf8'];

const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 2}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{ filter: `drop-shadow(0 0 8px ${fill}50)`, cursor: 'pointer' }}
      />
    </g>
  );
};

/**
 * CustomerRetentionChart – Donut chart showing returning vs new customers
 * @param {Array} data - Array of { name, value }  (percentages)
 * @param {function} [onSegmentClick] - Called with { name, value } when a segment is clicked
 */
export default function CustomerRetentionChart({ data = [], onSegmentClick }) {
  const [activeIndex, setActiveIndex] = React.useState(null);
  const returning = data.find((d) => d.name.includes('Returning'))?.value || 0;

  const handleClick = (_, index) => {
    if (onSegmentClick && data[index]) {
      onSegmentClick(data[index]);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Customer Retention</h3>
        <span className={styles.subtitle}>Repeat vs new customers</span>
      </div>

      <div className={styles.chartArea}>
        <div className={styles.donutWrap}>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                startAngle={90}
                endAngle={450}
                innerRadius="60%"
                outerRadius="85%"
                paddingAngle={3}
                stroke="none"
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                onClick={handleClick}
                style={{ cursor: onSegmentClick ? 'pointer' : 'default' }}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className={styles.centerLabel}>
            <span className={styles.centerValue}>{returning}%</span>
            <span className={styles.centerText}>Returning</span>
          </div>
        </div>

        <div className={styles.legend}>
          {data.map((entry, i) => (
            <div
              key={i}
              className={`${styles.legendItem} ${onSegmentClick ? styles.legendClickable : ''}`}
              onClick={() => onSegmentClick?.(entry)}
              onMouseEnter={() => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <span
                className={styles.legendDot}
                style={{ background: COLORS[i % COLORS.length] }}
              />
              <div className={styles.legendInfo}>
                <span className={styles.legendName}>{entry.name}</span>
                <span className={styles.legendValue}>{entry.value}%</span>
              </div>
              {onSegmentClick && <span className={styles.legendArrow}>→</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
