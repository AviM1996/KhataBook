import styles from "./Pagination.module.css";

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
  startIndex,
  endIndex,
  totalItems,
}) {
  if (totalPages <= 1) return null;

  const pageNumbers = [];
  const maxVisible = 5;
  
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);
  
  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className={styles.pagination}>
      <div className={styles.info}>
        Showing {startIndex}-{endIndex} of {totalItems}
      </div>
      
      <div className={styles.controls}>
        <button
          className={styles.pageBtn}
          onClick={onPrev}
          disabled={!hasPrev}
          title="Previous page"
        >
          ←
        </button>

        {startPage > 1 && (
          <>
            <button
              className={styles.pageBtn}
              onClick={() => onPageChange(1)}
            >
              1
            </button>
            {startPage > 2 && <span className={styles.ellipsis}>...</span>}
          </>
        )}

        {pageNumbers.map((num) => (
          <button
            key={num}
            className={`${styles.pageBtn} ${
              num === currentPage ? styles.active : ""
            }`}
            onClick={() => onPageChange(num)}
          >
            {num}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <span className={styles.ellipsis}>...</span>
            )}
            <button
              className={styles.pageBtn}
              onClick={() => onPageChange(totalPages)}
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          className={styles.pageBtn}
          onClick={onNext}
          disabled={!hasNext}
          title="Next page"
        >
          →
        </button>
      </div>
    </div>
  );
}

