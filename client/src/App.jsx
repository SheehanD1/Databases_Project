import { useEffect, useState } from 'react';

function App() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
  }, []);

  return (
    <main style={{ padding: '24px', fontFamily: 'sans-serif' }}>
      <h1>Internship Application Tracker</h1>

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
