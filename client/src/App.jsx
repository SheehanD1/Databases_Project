import { useEffect, useState } from 'react';
import AddApplication from './AddApplication';

function App() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    async function loadApplications() {
      try {
        const response = await fetch(
          'http://localhost:5000/api/applications'
        );

        if (!response.ok) {
          throw new Error('Could not load applications');
        }

        const data = await response.json();
        setApplications(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadApplications();
  }, [refreshKey]);

  async function handleDelete(application) {
    const confirmed = window.confirm(
      `Delete "${application.role_title}" at ${application.company}?`
    );

    if (!confirmed) return;

    setDeletingId(application.application_id);
    setDeleteError('');

    try {
      const response = await fetch(
        `http://localhost:5000/api/applications/${application.application_id}`,
        { method: 'DELETE' }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Could not delete application.');
      }

      setApplications((previous) =>
        previous.filter(
          (item) => item.application_id !== application.application_id
        )
      );
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main style={{ padding: '24px', fontFamily: 'sans-serif' }}>
      <h1>Internship Application Tracker</h1>

      <AddApplication
        onAdded={() => setRefreshKey((previous) => previous + 1)}
      />

      {deleteError && <p role="alert">{deleteError}</p>}

      {loading ? (
        <p>Loading applications...</p>
      ) : error ? (
        <p role="alert">{error}</p>
      ) : applications.length === 0 ? (
        <p>No applications yet.</p>
      ) : (
        <>
          <p>Total applications: {applications.length}</p>

          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                <th>Company</th>
                <th>Role</th>
                <th>Location</th>
                <th>Status</th>
                <th>Application Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((application) => (
                <tr key={application.application_id}>
                  <td>{application.company}</td>
                  <td>{application.role_title}</td>
                  <td>{application.location || '—'}</td>
                  <td>{application.status}</td>
                  <td>{application.application_date}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleDelete(application)}
                      disabled={deletingId !== null}
                    >
                      {deletingId === application.application_id ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </main>
  );
}

export default App;
