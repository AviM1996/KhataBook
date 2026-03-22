import { useState, useEffect } from 'react';

/**
 * A custom hook that delays updating a value until a specified time has passed
 * after the last change. Useful for debouncing search input.
 *
 * @param {any} value - The value to debounce
 * @param {number} delay - Delay in milliseconds (e.g., 400)
 * @returns {any} - The debounced value
 */
export default function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set debouncedValue to value (passed in) after the specified delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cancel the timeout if value changes (also on delay change or unmount)
    // This forms the core debouncing mechanism
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
