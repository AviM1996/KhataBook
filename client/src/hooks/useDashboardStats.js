import { useState, useEffect, useMemo } from "react";
import { getDashboardData } from "../api/dashboard";
import { getParties } from "../api/party";

export function useDashboardStats() {
  const [timeFilter, setTimeFilter] = useState("today");
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [dashboardRes, partiesRes] = await Promise.all([
          getDashboardData(),
          getParties(),
        ]);

        if (!cancelled) {
          setApiData({
            ...dashboardRes.data,
            parties: partiesRes.data,
          });
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  const data = useMemo(() => {
    if (!apiData) return null;

    const {
      salesPayment,
      retentionByFilter,
      receivableAging,
      payableAging,
      summaryByFilter,
      partyCounts,
    } = apiData;

    // ─── Summary values from API ───
    const s = summaryByFilter?.[timeFilter] ||
      summaryByFilter?.today || {
        sales: 0,
        salesGrowth: 0,
        credit: 0,
        creditGrowth: 0,
        outstanding: 0,
        outstandingGrowth: 0,
      };

    const summaryCards = [
      {
        label: "Total Customers",
        value: partyCounts?.totalCustomers || 0,
        color: "",
        // icon: "people",
      },
      {
        label: "Total Suppliers",
        value: partyCounts?.totalSuppliers || 0,
        color: "",
        // icon: "store",
      },
      {
        label: "90+ Days Due",
        value: partyCounts?.overdue90 || 0,
        color: "red",
        // icon: "warning",
      },
      {
        label: "Sales",
        value: `₹${s.sales.toLocaleString("en-IN")}`,
        color: "green",
        growth: s.salesGrowth,
        growthLabel: "vs last period",
        // icon: true ? <MdTrendingUp /> : null,
      },
      {
        label: "Payments Received",
        value: `₹${s.credit.toLocaleString("en-IN")}`,
        color: "green",
        growth: s.creditGrowth,
        growthLabel: "vs last period",
        // icon: <MdAccountBalanceWallet />,
      },
      {
        label: "Outstanding",
        value: `₹${s.outstanding.toLocaleString("en-IN")}`,
        color: "red",
        growth: s.creditGrowth,
        growthLabel: "vs last period",
        // icon: <MdPendingActions />,
      },
    ];

    const ret = retentionByFilter?.[timeFilter] ||
      retentionByFilter?.today || { returning: 0, new: 0 };
    const customerRetention = [
      { name: "Returning Customers", value: ret.returning },
      { name: "New Customers", value: ret.new },
    ];

    const formatAging = (agingObj) => {
      const buckets = ["0–30 Days", "31–60 Days", "61–90 Days", "90+ Days"];
      return buckets.map((b) => ({
        bucket: b,
        amount: agingObj?.[b] || 0,
      }));
    };

    return {
      summaryCards,
      salesPayment: salesPayment?.[timeFilter] || salesPayment?.today || [],
      customerRetention,
      receivableAging: formatAging(receivableAging),
      payableAging: formatAging(payableAging),
    };
  }, [apiData, timeFilter]);

  return { timeFilter, setTimeFilter, loading, ...(data || {}) };
}
