/**
 * EditPartyPage.jsx (entity-agnostic edit page)
 * Reads existing party data via React Query, renders fields dynamically from ENTITY_CONFIG.
 */
import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getPartyById } from '../../api/party';
import { usePartyMutations } from '../../hooks/usePartyMutations';
import { ENTITY_CONFIG, getConfigByTab } from '../../config/entityConfig';
import { DynamicFormField } from '../../components';
import { Page, Button } from '../../components';
import styles from './editCustomerPage.module.css';

export default function EditPartyPage() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const location   = useLocation();

  // Derive config from navigation state or default to CUSTOMER
  const returnTab  = location.state?.activeTab || 'customer';
  const config     = getConfigByTab(returnTab);

  const buildEmptyForm = () =>
    config.fields.reduce((acc, f) => ({ ...acc, [f.name]: '' }), {});

  const [form, setForm]   = useState(buildEmptyForm);
  const [error, setError] = useState('');

  const { updateParty, deleteParty, isSaving } = usePartyMutations();

  // Fetch party data
  const { data: res, isLoading: loading } = useQuery({
    queryKey: ['party', id],
    queryFn:  () => getPartyById(id),
    enabled:  !!id,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!loading && res) {
      const party = res?.item || res?.data || res;
      if (!party?.name) { navigate('/masters'); return; }

      // Hydrate only the fields declared in the config
      const hydrated = config.fields.reduce((acc, f) => ({
        ...acc,
        [f.name]: party[f.name] ?? '',
      }), {});
      setForm(hydrated);
    }
  }, [loading, res]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await updateParty(id, form);
      navigate('/masters', { state: { activeTab: config.tabId } });
    } catch {
      setError('Failed to update. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete ${form.name}? This cannot be undone.`)) return;
    try {
      await deleteParty(id);
      navigate('/masters', { state: { activeTab: config.tabId } });
    } catch {
      setError('Failed to delete.');
    }
  };

  return (
    <Page
      title={`Edit ${config.label}`}
      subtitle={form.name ? `Editing: ${form.name}` : ''}
      showBack
      onBack={() => navigate('/masters', { state: { activeTab: config.tabId } })}
      loading={loading && 'Loading…'}
    >
      <form className={styles.card} onSubmit={handleSubmit} noValidate>
        <div className={styles.section}>
          <h4>Edit Information</h4>

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

        <div className={`${styles.actions} ${styles.space}`}>
          <Button
            type="button"
            variant="outline"
            className={styles.dangerBtn}
            onClick={handleDelete}
            disabled={isSaving}
          >
            Delete {config.label}
          </Button>

          <div className={styles.rightActions}>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/masters', { state: { activeTab: config.tabId } })}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={isSaving}>
              Update {config.label}
            </Button>
          </div>
        </div>
      </form>
    </Page>
  );
}
