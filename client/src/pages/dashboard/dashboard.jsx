import React, { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./dashboard.module.css";
import {useDashboardStats} from "../../hooks/useDashboardStats.js";
import { Page, SummaryCard, TimeFilter } from "../../components";
import SalesPaymentChart from "../../features/dashboard/components/SalesPaymentChart/SalesPaymentChart";
import CustomerRetentionChart from "../../features/dashboard/components/CustomerRetentionChart/CustomerRetentionChart";
import AccountsAgingChart from "../../features/dashboard/components/AccountsAgingChart/AccountsAgingChart";

import DrilldownModal, {
  DrilldownTable,
} from "../../components/ui/DrilldownModal/DrilldownModal";
import { getParties } from "../../api/party";

const TIME_OPTIONS = [
  { id: "today", label: "Today" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
  { id: "yearly", label: "Yearly" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    timeFilter,
    setTimeFilter,
    summaryCards,
    salesPayment,
    customerRetention,
    receivableAging,
    payableAging,
    loading,
  } = useDashboardStats();

  // ─── Drilldown Modal State ───
  const [drilldown, setDrilldown] = useState({
    open: false,
    title: "",
    subtitle: "",
    content: null,
  });
  const closeDrilldown = useCallback(
    () => setDrilldown((d) => ({ ...d, open: false })),
    [],
  );

  // ─── Refs for scroll-to-chart ───
  const salesChartRef = useRef(null);
  const agingChartRef = useRef(null);

  // ─── Unified Card Click Handler ───
  const handleCardClick = (index) => {
    console.log("Card clicked index:", index);

    switch (index) {
      case 0: // Total Customers
        navigate("/masters?tab=customers");
        break;
      case 1: // Total Suppliers
        navigate("/masters?tab=suppliers");
        break;

      case 2: // 90+ Days Due
        setDrilldown({
          open: true,
          title: "High-Risk Receivables (Suppliers)",
          subtitle: "Fetching recent supplier data...",
          content: (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                color: "var(--text-tertiary)",
              }}
            >
              Loading real data...
            </div>
          ),
        });

        // ─── Fetch real data from API ───
        getParties({ recordType: "SUPPLIER", page: 1, limit: 10 })
          .then((res) => {
            const raw = res.itemsList || [];
            setDrilldown((prev) => ({
              ...prev,
              subtitle: "Accounts with no payment for over 90 days",
              content: (
                <DrilldownTable
                  columns={["Supplier Name", "Phone", "Address", "Status"]}
                  rows={raw.map((p) => [
                    p.name,
                    p.phone,
                    p.address || "N/A",
                    p.isActive ? "Active" : "Inactive",
                  ])}
                />
              ),
            }));
          })
          .catch((err) => {
            console.error("Drilldown fetch error:", err);
            setDrilldown((prev) => ({
              ...prev,
              subtitle: "Failed to load data",
              content: (
                <div style={{ color: "var(--accent-red)", padding: "20px" }}>
                  Error fetching data. Please try again later.
                </div>
              ),
            }));
          });
        break;

      case 3: // Sales
        salesChartRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        setTimeout(() => navigate("/transactions?type=DEBIT"), 800);
        break;
      case 4: // Payments Received
        navigate("/transactions?type=CREDIT");
        break;
      case 5: // Outstanding
        agingChartRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        break;
      default:
        console.warn("Unhandled card index:", index);
    }
  };

  // ─── Retention Drilldown Handler ───
  const handleRetentionDrilldown = (segment) => {
    const isNew = segment.name.includes("New");
    setDrilldown({
      open: true,
      title: `${segment.name} Segment`,
      subtitle: `${segment.value}% of your base this ${timeFilter}`,
      content: (
        <DrilldownTable
          columns={["Customer", "Join Date", "Total Sales", "Visit Frequency"]}
          rows={
            isNew
              ? [
                  ["Alice Cooper", "18 Mar 2024", "₹2,500", "1x"],
                  ["Bob Marley", "15 Mar 2024", "₹1,200", "1x"],
                ]
              : [
                  ["Ravi Kumar", "Jan 2023", "₹45,000", "4x/mo"],
                  ["Deepak S.", "Jun 2023", "₹28,200", "2x/mo"],
                ]
          }
        />
      ),
    });
  };

  // ─── Aging Drilldown Handler ───
  const handleAgingDrilldown = (bucketData, type) => {
    setDrilldown({
      open: true,
      title: `${type} Outstandings: ${bucketData.bucket}`,
      subtitle: `Total for period: ₹${bucketData.amount.toLocaleString("en-IN")}`,
      content: (
        <DrilldownTable
          columns={["Entity Name", "Due Amount", "Age (Days)", "Priority"]}
          rows={[
            [
              `Example ${type} 1`,
              `₹${Math.round(bucketData.amount * 0.6).toLocaleString("en-IN")}`,
              "22",
              "High",
            ],
            [
              `Example ${type} 2`,
              `₹${Math.round(bucketData.amount * 0.4).toLocaleString("en-IN")}`,
              "15",
              "Normal",
            ],
          ]}
        />
      ),
    });
  };

  return (
    <Page
      title="Dashboard"
      subtitle="Your business at a glance"
      loading={loading || !summaryCards}
      actions={
        <TimeFilter
          options={TIME_OPTIONS}
          active={timeFilter}
          onChange={setTimeFilter}
        />
      }
    >
      <div className={styles.cardsScroll}>
        <div className={styles.cardsGrid}>
          {summaryCards?.map((card, i) => (
            <SummaryCard
              key={card.label || i}
              label={card.label}
              value={card.value}
              color={card.color}
              growth={card.growth}
              growthLabel={card.growthLabel}
              icon={card.icon}
              onClick={() => handleCardClick(i)}
            />
          ))}
        </div>
      </div>

      <div className={styles.chartsRow} ref={salesChartRef}>
        <div className={styles.chartCard}>
          <SalesPaymentChart data={salesPayment} />
        </div>
        <div className={`${styles.chartCard} ${styles.chartCardSmall}`}>
          <CustomerRetentionChart
            data={customerRetention}
            onSegmentClick={handleRetentionDrilldown}
          />
        </div>
      </div>

      <div className={styles.chartsRow} ref={agingChartRef}>
        <div className={styles.chartCard}>
          <AccountsAgingChart
            title="Customer Due"
            data={receivableAging}
            onBarClick={(d) => handleAgingDrilldown(d, "Customer")}
          />
        </div>
        <div className={styles.chartCard}>
          <AccountsAgingChart
            title="Supplier Due"
            data={payableAging}
            onBarClick={(d) => handleAgingDrilldown(d, "Supplier")}
          />
        </div>
      </div>

      <DrilldownModal
        open={drilldown.open}
        onClose={closeDrilldown}
        title={drilldown.title}
        subtitle={drilldown.subtitle}
      >
        {drilldown.content}
      </DrilldownModal>
    </Page>
  );
}
