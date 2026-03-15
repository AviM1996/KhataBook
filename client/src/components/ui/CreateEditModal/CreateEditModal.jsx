import React from 'react';
import styles from './CreateEditModal.module.css';

/**
 * Reusable Modal for Create/Edit forms
 * @param {boolean} isOpen - Whether modal is visible
 * @param {function} onClose - Close handler
 * @param {string} title - Modal heading
 * @param {Array<{name: string, label: string, type: string, required?: boolean, options?: Array<{value: string, label: string}>}>} fields
 * @param {Object} values - Form state keyed by field name
 * @param {function} onChange - (fieldName, value) => void
 * @param {function} onSubmit - Form submit handler
 * @param {boolean} [saving=false] - Whether save is in progress
 */
export default function CreateEditModal({
  isOpen,
  onClose,
  title,
  fields,
  values,
  onChange,
  onSubmit,
  saving = false,
}) {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>{title}</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {fields.map((field) => (
            <div className={styles.formGroup} key={field.name}>
              <label htmlFor={field.name}>{field.label}</label>
              {field.type === 'select' ? (
                <select
                  id={field.name}
                  value={values[field.name] ?? ''}
                  onChange={(e) => onChange(field.name, e.target.value)}
                  required={field.required}
                >
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea
                  id={field.name}
                  value={values[field.name] ?? ''}
                  onChange={(e) => onChange(field.name, e.target.value)}
                  required={field.required}
                  rows={3}
                />
              ) : (
                <input
                  id={field.name}
                  type={field.type || 'text'}
                  value={values[field.name] ?? ''}
                  onChange={(e) => onChange(field.name, e.target.value)}
                  required={field.required}
                />
              )}
            </div>
          ))}

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.saveBtn}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
