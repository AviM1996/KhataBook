import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePartyMutations } from '../../hooks/usePartyMutations';
import { ENTITY_CONFIG } from '../../config/entityConfig';
import { DynamicFormField } from '../../components';
import { Page, Button } from '../../components';
import styles from './AddCustomerPage.module.css';

export default function AddSupplierPage() {
  const navigate = useNavigate();
  const config = ENTITY_CONFIG.SUPPLIER;
  const recordType = config.apiKey;

  // Build initial form state from config fields
  const buildEmptyForm = () =>
    config.fields.reduce((acc, f) => ({ ...acc, [f.name]: '' }), {});

  const [form, setForm] = useState(buildEmptyForm);
  const [error, setError] = useState('');

  const { addParty, isSaving } = usePartyMutations();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const required = config.fields.filter((f) => f.required);
    const missing = required.find((f) => !form[f.name]?.trim());
    if (missing) {
      setError(`${missing.label} is required`);
      return;
    }

    try {
      await addParty({ ...form, recordType });
      navigate('/masters/supplier');
    } catch {
      setError('Failed to save. Please try again.');
    }
  };

  return (
    <Page
      title={`Add ${config.label}`}
      subtitle={`Create a new ${config.label.toLowerCase()} profile`}
      showBack
      onBack={() => navigate('/masters/supplier')}
    >
      <form className={styles.card} onSubmit={handleSubmit} noValidate>
        <div className={styles.section}>
          {/* Dynamic fields from config */}
          {config.fields.map((field) => (
            <DynamicFormField
              key={field.name}
              field={field}
              value={form[field.name] ?? ''}
              onChange={handleChange}
              styles={styles}
            />
          ))}
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.actions}>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/masters/supplier')}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={isSaving}>
            Save {config.label}
          </Button>
        </div>
      </form>
    </Page>
  );
}
