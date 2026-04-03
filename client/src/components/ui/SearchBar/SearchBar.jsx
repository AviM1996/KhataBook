import React from 'react';
import styles from './SearchBar.module.css';
import { MdSearch,MdClear  } from 'react-icons/md';

export default function SearchInput({value, onChange, onClear, placeholder = 'Search...', className = '', style}){
  const handleChange=(e)=>{
    onChange(e.target.value)
  }

  return (
    <div className={`${styles.searchInputWrap} ${className}`}>
      <MdSearch className={styles.searchIcon} />

       <input
        className={styles.searchInput}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
      />
      {value && onClear && (
        <button className={styles.clearBtn} onClick={onClear}>
          <MdClear />
        </button>
      )}
    </div>
  )
}
