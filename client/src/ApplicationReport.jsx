import { useEffect, useState } from 'react';

const API = 'http://localhost:5000/api';

const emptyFilters = {
  company_id: '',
  status_id: '',
  start_date: '',
  end_date: ''
};

export default function ApplicationReport({ refreshKey }) {
  const [companies, setCompanies] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [optionsError, setOptionsError] = useState('');
  const [optionsLoading, setOptionsLoading] = useState(true);

  const [filters, setFilters] = useState({ ...emptyFilters });
  const [appliedFilters, setAppliedFilters] = useState({
    ...emptyFilters
  });

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function loadOptions() {
      try {
        const responses = await Promise.all([
          fetch(`${API}/companies`, { signal: controller.signal }),
          fetch(`${API}/statuses`, { signal: controller.signal })
        ]);

        if (responses.some(response => !response.ok)) {
          throw new Error('Could not load report filter options.');
        }

        const [companyData, statusData] = await Promise.all(
          responses.map(response => response.json())
        );

        if (!controller.signal.aborted) {
          setCompanies(companyData);
          setStatuses(statusData);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setOptionsError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setOptionsLoading(false);
        }
      }
    }

    loadOptions();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadReport() {
      setLoading(true);
      setError('');

      const params = new URLSearchParams();

      for (const [name, value] of Object.entries(appliedFilters)) {
        if (value) params.set(name, value);
      }

      try {
        const response = await fetch(
          `${API}/reports/applications?${params.toString()}`,
          { signal: controller.signal }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Could not load report.');
        }

        if (!controller.signal.aborted) {
          setReport(data);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadReport();
    return () => controller.abort();
  }, [appliedFilters, refreshKey]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFilters(previous => ({ ...previous, [name]: value }));
    setValidationError('');
  }

  function handleApply(event) {
    event.preventDefault();

    if (
      filters.start_date &&
      filters.end_date &&
      filters.start_date > filters.end_date
    ) {
      setValidationError('Start date must be on or before end date.');
      return;
    }

    setValidationError('');
    setAppliedFilters({ ...filters });
  }

  function handleReset() {
    setFilters({ ...emptyFilters });
    setAppliedFilters({ ...emptyFilters });
    setValidationError('');
  }

  return (
    <section style={{ marginTop: '40px' }}>
      <h2>Application Report</h2>
      <p>
        Choose filters, then click Apply Filters. Results reflect the
        last applied filters.
      </p>

      {optionsLoading && <p>Loading filter options...</p>}
      {optionsError && <p role="alert">{optionsError}</p>}

      <form onSubmit={handleApply}>
        <fieldset
          disabled={optionsLoading || Boolean(optionsError)}
          style={{ display: 'grid', gap: '12px', marginTop: '12px' }}
        >
          <legend>Report filters</legend>

          <label>
            Company{' '}
            <select
              name="company_id"
              value={filters.company_id}
              onChange={handleChange}
            >
              <option value="">All companies</option>
              {companies.map(company => (
                <option
                  key={company.company_id}
                  value={company.company_id}
                >
                  {company.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Status{' '}
            <select
              name="status_id"
              value={filters.status_id}
              onChange={handleChange}
            >
              <option value="">All statuses</option>
              {statuses.map(status => (
                <option key={status.status_id} value={status.status_id}>
                  {status.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            From{' '}
            <input
              type="date"
              name="start_date"
              value={filters.start_date}
              onChange={handleChange}
              min="1000-01-01"
              max="9999-12-31"
            />
          </label>

          <label>
            Through{' '}
            <input
              type="date"
              name="end_date"
              value={filters.end_date}
              onChange={handleChange}
              min="1000-01-01"
              max="9999-12-31"
            />
          </label>

          <button type="submit">Apply Filters</button>
          <button type="button" onClick={handleReset}>
            Reset Filters
          </button>
        </fieldset>
      </form>

      {validationError && <p role="alert">{validationError}</p>}

      <div aria-live="polite" aria-busy={loading}>
        {loading ? (
          <p>Loading report...</p>
        ) : error ? (
          <p role="alert">{error}</p>
        ) : report ? (
          <>
            <h3>Matching applications: {report.total}</h3>

            {report.total === 0 ? (
              <p>No applications match these filters.</p>
            ) : (
              <>
                <ul>
                  {report.by_status.map(item => (
                    <li key={item.status_id}>
                      {item.status}: {item.count}
                    </li>
                  ))}
                </ul>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', textAlign: 'left' }}>
                    <caption>Filtered application details</caption>
                    <thead>
                      <tr>
                        <th scope="col">Company</th>
                        <th scope="col">Role</th>
                        <th scope="col">Location</th>
                        <th scope="col">Status</th>
                        <th scope="col">Application Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.applications.map(application => (
                        <tr key={application.application_id}>
                          <td>{application.company}</td>
                          <td>{application.role_title}</td>
                          <td>{application.location || '—'}</td>
                          <td>{application.status}</td>
                          <td>{application.application_date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        ) : null}
      </div>
    </section>
  );
}
