import { useEffect, useState } from 'react';

function App() {
  const [backendMessage, setBackendMessage] = useState('Loading...');

  useEffect(() => {
    fetch('http://localhost:5000/api/message')
      .then((res) => res.json())
      .then((data) => setBackendMessage(data.message))
      .catch(() => setBackendMessage('Could not reach backend server'));
  }, []);

  return (
    <div style={{ fontFamily: 'sans-serif', textAlign: 'center', marginTop: '50px' }}>
      <h1>CS348 Project - Stage 1</h1>
      <p><strong>Stack:</strong> PERN (PostgreSQL, Express, React, Node.js)</p>
      <div style={{ border: '2px solid #333', display: 'inline-block', padding: '15px 30px', borderRadius: '8px' }}>
        <p><strong>Backend Status:</strong> {backendMessage}</p>
      </div>
    </div>
  );
}

export default App;