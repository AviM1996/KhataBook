import styles_default from './DynamicFormField.module.css';

export default function DynamicFormField({ field, value, onChange, styles }) {
  const s = styles || styles_default;
  const { name, label, type = 'text', required, options = [] } = field;

  const commonProps = {
    name,
    id: name,
    value: value ?? '',
    onChange,
    required: !!required,
    className: type === 'textarea' ? s.textarea : s.input,
  };

  const renderControl = () => {
    switch (type) {
      case 'textarea':
        return <textarea {...commonProps} rows={3} />;

      case 'select':
        return (
          <select {...commonProps} className={s.input}>
            <option value="">— Select —</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        );

      default:
        return (
          <input
            {...commonProps}
            type={type}
          />
        );
    }
  };

  return (
    <label className={s.label} htmlFor={name}>
      {label}{required && <span className={s.required}> *</span>}
      {renderControl()}
    </label>
  );
}
