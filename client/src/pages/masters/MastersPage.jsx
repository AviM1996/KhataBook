import React, { useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  MdDashboard,
  MdAdd,
  MdSearch,
  MdWarning,
  MdTrendingUp,
  MdToday,
  MdNotifications,
  MdPeople,
  MdBarChart,
  MdEdit,
  MdDelete,
} from "react-icons/md";
import { Toaster, toast } from "react-hot-toast";
import { useMastersStore } from "../../store/useMastersStore";
import { usePartyQuery } from "../../hooks/usePartyQuery";
import { usePartyMutations } from "../../hooks/usePartyMutations";
import { ENTITY_CONFIG, getConfigByTab } from "../../config/entityConfig";
import {
  ActionButtons,
} from "../../components";
import { useModal } from "../../context/ModalContext";
import styles from "./MastersPage.module.css";

/* ─── TABS ─── */
const TABS = Object.values(ENTITY_CONFIG).map((c) => ({
  id: c.tabId,
  label: c.label,
}));

/* ─── RISK BADGE ─── */
function RiskBadge({ score = 0 }) {
  const isHigh = score >= 60;
  return (
    <span
      className={`${styles.riskBadge} ${isHigh ? styles.riskHigh : styles.riskLow}`}
    >
      {isHigh ? "High" : "Low"} ({score}/100)
    </span>
  );
}

/* ─── AMOUNT CELL ─── */
function AmountCell({ value = 0, color }) {
  return (
    <span className={styles.amountCell} data-color={color}>
      ₹&nbsp;{Math.abs(value).toLocaleString("en-IN")}
    </span>
  );
}

export default function MastersPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    handleFieldChange,
    formValues,
  } = useMastersStore();

  const { openModal, closeModal } = useModal();

  /* sync tab from location */
  useEffect(() => {
    const returnedTab = location.state?.activeTab;
    if (returnedTab) {
      setActiveTab(returnedTab);
      return;
    }
    const params = new URLSearchParams(location.search);
    const queryTab = params.get("tab");
    if (queryTab && TABS.some((t) => t.id === queryTab.toLowerCase())) {
      setActiveTab(queryTab.toLowerCase());
    }
  }, [location.search, location.state, setActiveTab]);

  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const [activeFilter, setActiveFilter] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [eyeOpen, setEyeOpen] = useState(true);

  const LIMIT = 10;
  const config = getConfigByTab(activeTab);
  const recordType = config.apiKey;
  const entityLabel = config.label;

  const { data, loading, summary, summaryLoading, pagination } = usePartyQuery({
    recordType,
    page: currentPage,
    limit: LIMIT,
    search: debouncedSearch,
  });

  const { addParty, updateParty, deleteParty, isSaving } = usePartyMutations();

  const handleViewLedger = useCallback(
    (row) => navigate(`/ledger/${activeTab}/${row._id || row.id}`),
    [activeTab, navigate],
  );

  /* close dropdown on outside click */
  useEffect(() => {
    const close = () => setOpenMenuId(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  /* ─── DERIVED SUMMARY ─── */
  const totalCount = summaryLoading ? 0 : (summary?.totalCount ?? 0);
  const outstanding = summaryLoading
    ? 0
    : Math.abs(summary?.totalOutstanding ?? 0);
  const totalSales = summaryLoading ? 0 : (summary?.totalSalesOrPurchase ?? 0);
  const totalPayment = summaryLoading ? 0 : (summary?.totalPayment ?? 0);

  /* ─── FILTER CHIPS ─── */
  const filterChips = [
    {
      id: "overdue",
      icon: <MdWarning />,
      label: `90+ Overdue ${entityLabel}`,
      count: Math.round(totalCount * 0.1),
      amount: outstanding,
      color: "red",
    },
    {
      id: "highrisk",
      icon: <MdTrendingUp />,
      label: `High Risk ${entityLabel}`,
      count: Math.round(totalCount * 0.2),
      amount: totalSales * 0.12,
      color: "orange",
    },
    {
      id: "today",
      icon: <MdToday />,
      label: "Today Collection",
      count: null,
      amount: totalPayment * 0.07,
      color: "green",
    },
    {
      id: "followup",
      icon: <MdNotifications />,
      label: `Follow-ups ${entityLabel}`,
      count: Math.round(totalCount * 0.3),
      amount: outstanding * 0.45,
      color: "blue",
    },
  ];

  return (
    <Page
      title={config.pluralLabel}
      subtitle={`Manage ${entityLabel.toLowerCase()} accounts and payments`}
      loading={loading}
      actions={
        <div className={styles.headerBar}>
          {/* Customer / Supplier toggle */}
          <div className={styles.tabToggle}>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                className={`${styles.tabBtn} ${activeTab === tab.id ? styles.tabBtnActive : ""}`}
                onClick={() => {
                  setActiveTab(tab.id);
                  setCurrentPage(1);
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className={styles.searchInputWrap}>
            <MdSearch className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              placeholder={`Search ${entityLabel.toLowerCase()}…`}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Add Button */}
          <button
            className={styles.addBtn}
            onClick={() => openModal('createEdit', {
              title: `Add ${entityLabel}`,
              fields: config.fields,
              values: {},
              onChange: handleFieldChange,
              onSubmit: async () => {
                await addParty({ ...formValues, recordType });
                closeModal();
              },
              saving: isSaving
            })}
          >
            <MdAdd /> Add {entityLabel}
          </button>

          {/* Dashboard */}
          <button
            className={styles.dashboardBtn}
            onClick={() => navigate("/dashboard")}
          >
            <MdDashboard /> Dashboard
          </button>
        </div>
      }
    >
      <Toaster position="top-right" />

      {/* ─── FILTER CHIPS ─── */}
      <div className={styles.filterChips}>
        {filterChips.map((chip) => (
          <button
            key={chip.id}
            className={`${styles.chip} ${styles[`chip_${chip.color}`]} ${activeFilter === chip.id ? styles.chipActive : ""}`}
            onClick={() =>
              setActiveFilter(activeFilter === chip.id ? null : chip.id)
            }
          >
            <span className={styles.chipIcon}>{chip.icon}</span>
            <span className={styles.chipLabel}>
              {chip.label}
              {chip.count != null ? ` (${chip.count})` : ""}
            </span>
            <span className={styles.chipAmount}>
              ₹{Math.round(chip.amount).toLocaleString("en-IN")}
            </span>
          </button>
        ))}
      </div>

      {/* ─── STATS CARD ─── */}
      <div className={styles.statsCard}>
        {/* Top: total count + eye toggle */}
        <div className={styles.statsCardTop}>
          <span className={styles.totalLabel}>
            <MdPeople className={styles.tcIcon} />
            Total {entityLabel}
            <span className={styles.totalBadge}>
              {summaryLoading ? "…" : totalCount}
            </span>
          </span>
          <button
            className={styles.eyeBtn}
            title={eyeOpen ? "Hide amounts" : "Show amounts"}
            onClick={() => setEyeOpen((v) => !v)}
          >
            {eyeOpen ? (
              <LuEye size={20} color="#ffffff" />
            ) : (
              <LuEyeOff size={20} color="#ffffff" />
            )}
          </button>
        </div>

        <div className={styles.statsCardDivider} />

        {/* Body: left stats / right analyse */}
        <div className={styles.statsCardBody}>
          <div className={styles.statsBodyLeft}>
            <div className={styles.statBlock}>
              <span className={styles.statSubLabel}>Total Outstanding</span>
              <span className={styles.statValue} data-color="red">
                {eyeOpen ? `₹${outstanding.toLocaleString("en-IN")}` : "••••••"}
              </span>
            </div>
            <div className={styles.statBlock}>
              <span className={styles.statSubLabel}>
                Total {config.summary?.sales ?? "Goods Sales"}
              </span>
              <span className={styles.statValue} data-color="blue">
                {eyeOpen ? `₹${totalSales.toLocaleString("en-IN")}` : "••••••"}
              </span>
            </div>
          </div>

          <div className={styles.statsBodyRight}>
            <button className={styles.analyseBtn}>
              <MdBarChart className={styles.analyseIcon} /> Analyse
            </button>
            <div className={styles.statBlock}>
              <span className={styles.statSubLabel}>Total Payment</span>
              <span className={styles.statValue} data-color="green">
                {eyeOpen
                  ? `₹${totalPayment.toLocaleString("en-IN")}`
                  : "••••••"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── DATA TABLE ─── */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              {[
                "Sl.No",
                "Name",
                "Phone",
                "Risk Health",
                "Credits",
                "Payments",
                "Net Balance",
                "Last Transaction",
                "Action",
              ].map((h) => (
                <th key={h} className={styles.th}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={9} className={styles.emptyRow}>
                  Loading…
                </td>
              </tr>
            )}
            {!loading && (!data || data.length === 0) && (
              <tr>
                <td colSpan={9} className={styles.emptyRow}>
                  {searchQuery
                    ? "No matches found"
                    : `No ${entityLabel.toLowerCase()}s yet`}
                </td>
              </tr>
            )}
            {!loading &&
              data?.map((row, idx) => {
                const net =
                  (row.totalSalesOrPurchase ?? 0) - (row.totalPayment ?? 0);
                const riskScore = row.riskScore ?? (net > 5000 ? 72 : 20);
                const lastTx = row.lastTransactionDate
                  ? new Date(row.lastTransactionDate).toLocaleDateString(
                    "en-IN",
                    { day: "2-digit", month: "short", year: "2-digit" },
                  )
                  : "—";
                return (
                  <tr key={row._id || idx} className={styles.tr}>
                    <td className={styles.td}>
                      {(currentPage - 1) * LIMIT + idx + 1}
                    </td>
                    <td className={styles.td}>
                      <div className={styles.nameCell}>
                        <span className={styles.avatar}>
                          {(row.name || "U")[0].toUpperCase()}
                        </span>
                        <span className={styles.boldText}>
                          {row.name || "—"}
                        </span>
                      </div>
                    </td>
                    <td className={styles.td}>
                      <span className={styles.phoneText}>
                        {row.phone || "—"}
                      </span>
                    </td>
                    <td className={styles.td}>
                      <RiskBadge score={riskScore} />
                    </td>
                    <td className={styles.td}>
                      <AmountCell
                        value={row.totalSalesOrPurchase ?? 0}
                        color="blue"
                      />
                    </td>
                    <td className={styles.td}>
                      <AmountCell value={row.totalPayment ?? 0} color="green" />
                    </td>
                    <td className={styles.td}>
                      <AmountCell
                        value={net}
                        color={net > 0 ? "red" : "green"}
                      />
                    </td>
                    <td className={styles.td}>
                      <span className={styles.lastTx}>{lastTx}</span>
                    </td>
                    <td className={styles.td}>
                      <div className={styles.actionCell}>
                        <ActionButtons
                          onViewLedger={() => handleViewLedger(row)}
                          editModalProps={{
                            title: `Edit ${entityLabel}`,
                            fields: config.fields,
                            values: row,
                            onChange: handleFieldChange,
                            onSubmit: async () => {
                              await updateParty(row._id, formValues);
                              closeModal();
                            },
                            saving: isSaving
                          }}
                          deleteModalProps={{
                            entityName: row.name,
                            title: `Delete ${entityLabel}`,
                            onConfirm: async () => {
                              await deleteParty(row._id);
                              closeModal();
                            },
                            loading: isSaving
                          }}
                          menuItems={[
                            {
                              label: "Edit",
                              icon: <MdEdit />,
                              onClick: () => openModal('createEdit', {
                                title: `Edit ${entityLabel}`,
                                fields: config.fields,
                                values: row,
                                onChange: handleFieldChange,
                                onSubmit: async () => {
                                  await updateParty(row._id, formValues);
                                  closeModal();
                                },
                                saving: isSaving
                              }),
                            },
                            {
                              label: "Delete",
                              icon: <MdDelete />,
                              danger: true,
                              onClick: () => openModal('confirmDelete', {
                                entityName: row.name,
                                title: `Delete ${entityLabel}`,
                                onConfirm: async () => {
                                  await deleteParty(row._id);
                                  closeModal();
                                },
                                loading: isSaving
                              }),
                            },
                          ]}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* ─── PAGINATION ─── */}
      {!loading && pagination?.pageCount > 1 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.pageCount}
          onPageChange={setCurrentPage}
          onNext={() =>
            setCurrentPage(Math.min(pagination.pageCount, currentPage + 1))
          }
          onPrev={() => setCurrentPage(Math.max(1, currentPage - 1))}
          hasNext={pagination.hasNext}
          hasPrev={pagination.hasPrev}
          startIndex={(pagination.currentPage - 1) * LIMIT}
          endIndex={Math.min(
            pagination.currentPage * LIMIT,
            pagination.itemCount,
          )}
          totalItems={pagination.itemCount}
        />
      )}

    </Page>
  );
}
