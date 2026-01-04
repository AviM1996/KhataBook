import styles from "./dashboard.module.css";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useCustomers } from "../../hooks/useCustomers";
import { useTransactions } from "../../hooks/useTransactions";
import { useWindowSize } from "../../hooks/useWindowSize";
import { getTodayStats, getOverallStats } from "../../utils/dashboardStats";
import { getWeeklySalesData } from "../../utils/weeklyStats";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import BufferIcon from "../../components/BufferIcon";
import { useDashboardStats } from "../../backend/hooks/useDashboardStats";
import { useDashboardCharts } from "../../backend/hooks/useDashboardCharts";

export default function Dashboard() {
  const navigate = useNavigate();

  const {
    customers,
    customerCount,
    loading: customersLoading,
    error: customersError,
  } = useCustomers();

  const selectedCustomerId = customers?.[0]?.id || null;
  const {
    transactions,
    recent,
    loading: transactionsLoading,
    error: transactionsError,
  } = useTransactions(selectedCustomerId);
  const { role, loading: authLoading } = useAuth();
  const { isMobile } = useWindowSize();

  // const { todaySales, todayCredit } = getTodayStats(transactions);
  // const { totalCredit, totalDebit, outstandingBalance } = getOverallStats(transactions);

  // Memoize to prevent unnecessary recalculations
  // const weeklySalesData = useMemo(
  //   () => getWeeklySalesData(transactions),
  //   [transactions]
  // );

  // // Cash Flow data
  // const cashFlowData = useMemo(
  //   () => [
  //     { name: "Credit", amount: totalCredit },
  //     { name: "Debit", amount: totalDebit },
  //   ],
  //   [totalCredit, totalDebit]
  // );

  // const totalAmount = totalCredit + totalDebit;
  // const creditPercentage =
  //   totalAmount > 0 ? Math.round((totalCredit / totalAmount) * 100) : 0;

  const getCustomerName = (customerId) => {
    const customer = customers?.find((c) => c.id === customerId);
    return customer?.name || "Unknown";
  };

  // Helper to format date and time
  const formatDateTime = (createdAt) => {
    if (!createdAt) return "";
    let date;
    if (typeof createdAt === "object" && createdAt.toDate) {
      date = createdAt.toDate();
    } else if (createdAt instanceof Date) {
      date = createdAt;
    } else if (typeof createdAt === "number") {
      date = new Date(createdAt);
    } else {
      return "";
    }
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  
  const stats = useDashboardStats(transactions);
  const charts = useDashboardCharts(transactions);

  return (
    <div>
      <div className={styles.statsScroll}>
        <div className={styles.stats}>
          <StatCard
            label="Total Customers"
            value={customerCount}
            isLoading={customersLoading}
            color={styles.green}
            onClick={() => navigate("/customers")}
          />
          <StatCard
            label="Today Sales"
            // value={`₹${todaySales.toLocaleString('en-IN')}`}
            value={`₹${stats.todaySales.toLocaleString("en-IN")}`}
            isLoading={transactionsLoading}
            color={styles.green}
            onClick={() => navigate("/transactions?type=DEBIT&date=today")}
          />
          <StatCard
            label="Today Credit"
            value={`₹${stats.todayCredit.toLocaleString("en-IN")}`}
            isLoading={transactionsLoading}
            color={styles.green}
            onClick={() => navigate("/transactions?type=CREDIT&date=today")}
          />
          <StatCard
            label="Credit"
            value={`₹${stats.totalCredit.toLocaleString("en-IN")}`}
            isLoading={transactionsLoading}
            color={styles.green}
            onClick={() => navigate("/transactions?type=CREDIT&date=all")}
          />
          <StatCard
            label="Debit"
            value={`₹${stats.totalDebit.toLocaleString("en-IN")}`}
            isLoading={transactionsLoading}
            color={styles.red}
            onClick={() => navigate("/transactions?type=DEBIT&date=all")}
          />
          <StatCard
            label="Outstanding Balance"
            value={`₹${stats.outstandingBalance.toLocaleString("en-IN")}`}
            isLoading={transactionsLoading}
            color={stats.outstandingBalance >= 0 ? styles.blue : styles.red}
          />
          <StatCard
            label="Stock Value"
            value="₹1,32,500"
            color={styles.yellow}
          />
        </div>
      </div>

      {/* ===== SECTIONS ===== */}
      <div className={styles.dashboardSections}>
        <div className={styles.sectionRow}>
          <div className={styles.sectionCard}>
            <h4>Weekly Sales & Credit</h4>
            <div
              className={styles.chartContainer}
              style={{
                height: isMobile ? 250 : 300,
                minHeight: isMobile ? 250 : 300,
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={charts.weeklySalesData}
                  margin={{
                    top: isMobile ? 10 : 20,
                    right: 15,
                    left: 0,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis
                    dataKey="day"
                    stroke="#94a3b8"
                    style={{ fontSize: isMobile ? "11px" : "12px" }}
                    tick={{ dy: 5 }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    style={{ fontSize: isMobile ? "10px" : "12px" }}
                    width={isMobile ? 35 : 45}
                    tickFormatter={(value) =>
                      value >= 1000
                        ? `₹${(value / 1000).toFixed(0)}k`
                        : `₹${value}`
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "2px solid #22c55e",
                      borderRadius: "8px",
                      padding: isMobile ? "8px" : "12px",
                      boxShadow: "0 4px 12px rgba(34, 197, 94, 0.2)",
                      fontSize: isMobile ? "12px" : "14px",
                    }}
                    formatter={(value) => `₹${value.toLocaleString("en-IN")}`}
                    labelStyle={{ color: "#e2e8f0", fontWeight: "bold" }}
                    cursor={{ fill: "rgba(34, 197, 94, 0.1)" }}
                    wrapperStyle={{ outline: "none" }}
                  />
                  <Legend
                    wrapperStyle={{
                      paddingTop: isMobile ? "16px" : "24px",
                      paddingBottom: "8px",
                    }}
                    iconType="rect"
                    iconSize={12}
                    formatter={(value, entry) => (
                      <span
                        style={{
                          color: "#e2e8f0",
                          fontSize: isMobile ? "12px" : "13px",
                          fontWeight: 600,
                          marginLeft: "8px",
                          textTransform: "none",
                        }}
                      >
                        {value}
                      </span>
                    )}
                    wrapperClassName={styles.chartLegend}
                    content={(props) => {
                      const { payload } = props;
                      return (
                        <ul className={styles.customLegend}>
                          {payload?.map((entry, index) => (
                            <li key={index} className={styles.legendItem}>
                              <span
                                className={styles.legendIcon}
                                style={{
                                  backgroundColor: entry.color,
                                  boxShadow: `0 0 8px ${entry.color}40`,
                                }}
                              />
                              <span className={styles.legendLabel}>
                                {entry.value}
                              </span>
                            </li>
                          ))}
                        </ul>
                      );
                    }}
                  />
                  <Bar
                    dataKey="sales"
                    fill="#22c55e"
                    radius={[6, 6, 0, 0]}
                    name="Sales (Debit)"
                    isAnimationActive={false}
                    maxBarSize={40}
                  />
                  <Bar
                    dataKey="credit"
                    fill="#38bdf8"
                    radius={[6, 6, 0, 0]}
                    name="Credit"
                    isAnimationActive={false}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className={styles.sectionCard}>
            <h4>Recent Transactions</h4>
            {transactionsLoading ? (
              <BufferIcon
                size="medium"
                color="green"
                text="Loading transactions..."
              />
            ) : recent && recent.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Date & Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((tx) => (
                    <tr key={tx.id}>
                      <td>{getCustomerName(tx.customerId)}</td>
                      <td
                        className={
                          tx.type === "CREDIT" ? styles.green : styles.red
                        }
                      >
                        {tx.type}
                      </td>
                      <td>₹{(tx.amount || 0).toLocaleString("en-IN")}</td>
                      <td style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                        {formatDateTime(tx.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div
                style={{
                  padding: "20px",
                  textAlign: "center",
                  color: "#64748b",
                }}
              >
                No transactions yet
              </div>
            )}
          </div>
        </div>

        {/* ROW 2 */}
        <div className={styles.sectionRow}>
          {/* Cash Flow */}
          <div className={styles.sectionCard}>
            <h4>Cash Flow</h4>

            {transactionsLoading ? (
              <BufferIcon size="medium" color="green" text="Loading..." />
            ) : (
              <div className={styles.cashflow}>
                {/* Horizontal Bars Section */}
                <div className={styles.cashflowBars}>
                  {/* Credit Bar */}
                  <div className={styles.cashflowItem}>
                    <div className={styles.cashflowLabel}>Credit</div>
                    <div className={styles.cashflowBarWrapper}>
                      <div
                        className={`${styles.cashflowBar} ${styles.creditBar}`}
                        style={{
                          width: `${
                            (stats.totalCredit, stats.totalDebit) > 0
                              ? (stats.totalCredit /
                                  Math.max(stats.totalCredit, stats.totalDebit)) *
                                100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <div className={`${styles.cashflowValue} ${styles.green}`}>
                      ₹{stats.totalCredit.toLocaleString("en-IN")}
                    </div>
                  </div>

                  {/* Debit Bar */}
                  <div className={styles.cashflowItem}>
                    <div className={styles.cashflowLabel}>Debit</div>
                    <div className={styles.cashflowBarWrapper}>
                      <div
                        className={`${styles.cashflowBar} ${styles.debitBar}`}
                        style={{
                          width: `${
                            (stats.totalCredit, stats.totalDebit) > 0
                              ? (stats.totalDebit /
                                  Math.max(stats.totalCredit, stats.totalDebit)) *
                                100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <div className={`${styles.cashflowValue} ${styles.red}`}>
                      ₹{stats.totalDebit.toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>

                {/* Donut Chart Section */}
                <div className={styles.donutSection}>
                  <div className={styles.donutWrapper}>
                    <ResponsiveContainer
                      width={isMobile ? 140 : 180}
                      height={isMobile ? 140 : 180}
                    >
                      <PieChart>
                        <Pie
                          data={charts.cashFlowData}
                          dataKey="amount"
                          startAngle={90}
                          endAngle={450}
                          innerRadius={isMobile ? 35 : 45}
                          outerRadius={isMobile ? 55 : 70}
                          paddingAngle={2}
                        >
                          {charts.cashFlowData.map((entry, idx) => (
                            <Cell
                              key={idx}
                              fill={
                                entry.name === "Credit" ? "#22c55e" : "#f87171"
                              }
                            />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>

                    {/* Center Label */}
                    <div className={styles.donutCenter}>
                      <div className={styles.donutCenterLabel}>Credit</div>
                      <div className={styles.donutCenterValue}>
                        {charts.creditPercentage}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Inventory */}
          <div className={styles.sectionCard}>
            <h4>Inventory Movement (Month-wise)</h4>

            <div className={styles.inventoryChart}>
              <div className={styles.yAxis}>
                {[100, 80, 60, 40, 20, 0].map((v) => (
                  <span key={v}>{v}</span>
                ))}
              </div>

              <div className={styles.monthArea}>
                {[
                  ["Jan", 70, 30],
                  ["Feb", 65, 35],
                  ["Mar", 80, 20],
                  ["Apr", 60, 40],
                ].map(([m, f, s]) => (
                  <div key={m} className={styles.month}>
                    <div className={styles.bars}>
                      <div
                        className={`${styles.h} ${styles.greenBg}`}
                        style={{ height: `${f}%` }}
                      />
                      <div
                        className={`${styles.bar} ${styles.redBg}`}
                        style={{ height: `${s}%` }}
                      />
                    </div>
                    <small>{m}</small>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.legend}>
              <span>
                <i className={`${styles.dot} ${styles.greenBg}`} /> Fast Moving
              </span>
              <span>
                <i className={`${styles.dot} ${styles.redBg}`} /> Slow Moving
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color, isLoading, onClick }) {
  return (
    <div
      className={`${styles.card} ${onClick ? styles.clickable : ""}`}
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      <p>{label}</p>
      {isLoading ? (
        <BufferIcon size="small" color="green" />
      ) : (
        <h3 className={color}>{value}</h3>
      )}
    </div>
  );
}
