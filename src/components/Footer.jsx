export default function Footer() {
  return (
    <footer
      style={{
        padding: "12px",
        textAlign: "center",
        fontSize: "12px",
        color: "#9ca3af",
        background: "#020617",
      }}
    >
      © {new Date().getFullYear()} LedgerFlow
    </footer>
  );
}
