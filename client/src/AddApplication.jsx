import { useEffect, useState } from 'react';

const API = 'http://localhost:5000/api';

const emptyForm = {
  company_id: '',
  status_id: '',
  role_title: '',
  location: '',
  application_date: ''
};

export default function AddApplication({
  onAdded,
  application = null,
  onCancel
}) {
  const [companies, setCompanies] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const isEditing = application !== null;

  const [form, setForm] = useState(() =>
    application
      ? {
          company_id: String(application.company_id),
          status_id: String(application.status_id),
          role_title: application.role_title,
          location: application.location || '',
          application_date: application.application_date
        }
      : { ...emptyForm }
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [optionsError, setOptionsError] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadOptions() {
      try {
        const [companyResponse, statusResponse] = await Promise.all([
          fetch(`${API}/companies`),
          fetch(`${API}/statuses`)
        ]);

        if (!companyResponse.ok || !statusResponse.ok) {
          throw new Error('Could not load company and status options.');
        }

        setCompanies(await companyResponse.json());
        setStatuses(await statusResponse.json());
      } catch (err) {
        setOptionsError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadOptions();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (saving) return;

    setSaving(true);
    setError('');
    setMessage('');

    try {
      const url = isEditing
        ? `${API}/applications/${application.application_id}`
        : `${API}/applications`;

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          company_id: Number(form.company_id),
          status_id: Number(form.status_id)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Could not save application.');
      }

      if (!isEditing) {
        setForm({ ...emptyForm });
        setMessage('Application added successfully!');
      }

      onAdded();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>Loading form options...</p>;
  if (optionsError) return <p role="alert">{optionsError}</p>;

  if (!companies.length || !statuses.length) {
    return <p>Add companies and statuses to the database first.</p>;
  }

  return (
    <section>
      <h2>{isEditing ? 'Edit Application' : 'Add Application'}</h2>

      <form onSubmit={handleSubmit}>
        <fieldset disabled={saving} style={{ display: 'grid', gap: '12px' }}>
          <legend>Application details</legend>

          <label>
            Company{' '}
            <select
              name="company_id"
              value={form.company_id}
              onChange={handleChange}
              required
            >
              <option value="">Select a company</option>
              {companies.map((company) => (
                <option key={company.company_id} value={company.company_id}>
                  {company.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Status{' '}
            <select
              name="status_id"
              value={form.status_id}
              onChange={handleChange}
              required
            >
              <option value="">Select a status</option>
              {statuses.map((status) => (
                <option key={status.status_id} value={status.status_id}>
                  {status.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Role title{' '}
            <input
              name="role_title"
              value={form.role_title}
              onChange={handleChange}
              maxLength={150}
              required
            />
          </label>

          <label>
            Location{' '}
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              maxLength={150}
            />
          </label>

          <label>
            Application date{' '}
            <input
              type="date"
              name="application_date"
              value={form.application_date}
              onChange={handleChange}
              min="1000-01-01"
              max="9999-12-31"
              required
            />
          </label>

          <button type="submit">
            {saving
              ? 'Saving...'
              : isEditing
                ? 'Save Changes'
                : 'Add Application'}
          </button>

          {isEditing && (
            <button type="button" onClick={onCancel}>
              Cancel
            </button>
          )}
        </fieldset>
      </form>

      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}
    </section>
  );
}
