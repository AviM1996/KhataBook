import React, { useMemo, useState } from "react";
import styles from "./dashboard.module.css";

export default function Dashboard() {
  const [month, setMonth] = useState("ALL");

  return (
    <div>
      {/* ===== STATS ===== */}
      <div className={styles.statsScroll}>
        <div className={styles.stats}>
          <StatCard label="Total Customers" value="128" color={styles.green} />
          <StatCard label="Today Sales" value="₹12,450" color={styles.green} />
          <StatCard label="Today Credit" value="₹4,200" color={styles.green} />
          <StatCard label="Total Credit" value="₹78,900" color={styles.green} />
          <StatCard label="Total Debit" value="₹52,300" color={styles.red} />
          <StatCard
            label="Outstanding Balance"
            value="₹26,600"
            color={styles.blue}
          />
          <StatCard
            label="Stock Value"
            value="₹1,32,500"
            color={styles.yellow}
          />
        </div>
      </div>

      {/* ===== WEEKLY CHART ===== */}
      <div className={styles.box}>
        <h4 className={styles.chartTitle}>Weekly Product Sales</h4>

        <div className={styles.weeklyChart}>
          {/* Y AXIS */}
          <div className={styles.yAxis}>
            {["₹10k", "₹8k", "₹6k", "₹4k", "₹2k", "₹0"].map((v) => (
              <span key={v}>{v}</span>
            ))}
          </div>

          {/* GRID + BARS */}
          <div className={styles.chartWrapper}>
            {/* GRID LINES */}
            <div className={styles.grid}>
              {Array.from({ length: 6 }).map((_, i) => (
                <span key={i} />
              ))}
            </div>

            {/* BARS */}
            <div className={styles.chartArea}>
              {[
                ["Mon", 40],
                ["Tue", 55],
                ["Wed", 48],
                ["Thu", 70],
                ["Fri", 65],
                ["Sat", 85],
                ["Sun", 60],
              ].map(([day, height]) => (
                <div key={day} className={styles.barCol}>
                  <div
                    className={styles.bar}
                    style={{ height: `${height}%` }}
                  />
                  <small>{day}</small>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className={styles.card}>
      <p>{label}</p>
      <h3 className={color}>{value}</h3>
    </div>
  );
}
