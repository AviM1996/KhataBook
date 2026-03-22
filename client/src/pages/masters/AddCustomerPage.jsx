/**
 * AddCustomerPage.jsx (now entity-agnostic — should be renamed AddPartyPage)
 * Form fields are driven by ENTITY_CONFIG[recordType].fields — no hardcoding.
 */
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePartyMutations } from '../../hooks/usePartyMutations';
import { ENTITY_CONFIG } from '../../config/entityConfig';
import { DynamicFormField } from '../../components';
import { Page, Button, Tabs } from '../../components';
import styles from './AddCustomerPage.module.css';

const ENTITY_TABS = Object.values(ENTITY_CONFIG).map((c) => ({
  id: c.apiKey,
  label: c.label,
}));

export default function AddPartyPage() {
  const navigate   = useNavigate();
  const location   = useLocation();

  const initialType = location.state?.defaultTab || 'CUSTOMER';
  const [recordType, setRecordType] = useState(initialType);

  const config = ENTITY_CONFIG[recordType] || ENTITY_CONFIG.CUSTOMER;

  // Build initial form state from config fields
  const buildEmptyForm = () =>
    config.fields.reduce((acc, f) => ({ ...acc, [f.name]: '' }), {});

  const [form, setForm]   = useState(buildEmptyForm);
  const [error, setError] = useState('');

  const { addParty, isSaving } = usePartyMutations();

  const handleTypeChange = (type) => {
    setRecordType(type);
    setForm(ENTITY_CONFIG[type]?.fields.reduce((acc, f) => ({ ...acc, [f.name]: '' }), {}));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const required = config.fields.filter((f) => f.required);
    const missing  = required.find((f) => !form[f.name]?.trim());
    if (missing) {
      setError(`${missing.label} is required`);
      return;
    }

    try {
      await addParty({ ...form, recordType });
      // Return to masters with the correct tab active
      navigate('/masters', {
        state: { activeTab: config.tabId },
      });
    } catch {
      setError('Failed to save. Please try again.');
    }
  };

  return (
    <Page
      title={`Add ${config.label}`}
      subtitle={`Create a new ${config.label.toLowerCase()} profile`}
      showBack
      onBack={() => navigate('/masters')}
    >
      <form className={styles.card} onSubmit={handleSubmit} noValidate>
        {/* Entity type switcher */}
        <div className={styles.section}>
          <div className={styles.tabs}>
            <Tabs
              tabs={ENTITY_TABS}
              activeTab={recordType}
              onChange={handleTypeChange}
            />
          </div>

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
            onClick={() => navigate('/masters')}
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
