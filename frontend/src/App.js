import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [ipAddress, setIpAddress] = useState('');
  const [reversedIp, setReversedIp] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  // NEW: State for the manual IP input and POST request result
  const [manualIp, setManualIp] = useState('');
  const [postResult, setPostResult] = useState(null);
  const [postError, setPostError] = useState(null);
  
  const backendUrl = "/api/";

  const fetchHistory = async () => {
    try {
      const historyResponse = await fetch(`${backendUrl}/history`);
      const historyData = await historyResponse.json();
      setHistory(historyData);
    } catch (err) {
      setError('Failed to fetch history');
    }
  };

  const clearHistory = async () => {
    try {
      await fetch(`${backendUrl}/clear-history`, { method: 'DELETE' });
      setHistory([]);
    } catch (err) {
      setError('Failed to clear history');
    }
  };

  // NEW: Function to handle a POST request for a manually entered IP
  const handlePost = async () => {
    setPostResult(null);
    setPostError(null);
    try {
      const response = await fetch(`${backendUrl}/reverse-ip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ip: manualIp }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reverse IP via POST');
      }

      const data = await response.json();
      setPostResult(data);
      fetchHistory(); // Refresh history after a successful POST
    } catch (err) {
      setPostError(err.message);
    }
  };

  useEffect(() => {
    const fetchAndReverseIp = async () => {
      try {
        const backendResponse = await fetch(`${backendUrl}/reverse-ip`);
        if (!backendResponse.ok) throw new Error('Failed to reverse IP.');
        const backendData = await backendResponse.json();
        setIpAddress(backendData.ip);
        setReversedIp(backendData.reversedIp);

        await fetchHistory();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAndReverseIp();
  }, []);

  if (loading) return <div className="App">Loading...</div>;
  if (error) return <div className="App">Error: {error}</div>;

  return (
    <div className="App">
      <h1>IP Address Reverser</h1>
      <p>Your original IP: <strong>{ipAddress}</strong></p>
      <p>Reversed IP: <strong>{reversedIp}</strong></p>

      {/* NEW: Section for manual IP input and POST test */}
      <hr />
      <h2>Manually Reverse an IP</h2>
      <input
        type="text"
        value={manualIp}
        onChange={(e) => setManualIp(e.target.value)}
        placeholder="Enter an IP address"
      />
      <button onClick={handlePost}>Reverse via POST</button>
      {postResult && (
        <p>
          POST result: {postResult.ip} → {postResult.reversedIp}
        </p>
      )}
      {postError && (
        <p style={{ color: 'red' }}>POST Error: {postError}</p>
      )}
      <hr />

      <h2>History (latest 20)</h2>
      <button onClick={clearHistory}>Clear History</button>
      <ul>
        {history.map((entry) => (
          <li key={entry._id}>
            {entry.ip} → {entry.reversedIp} ({new Date(entry.createdAt).toLocaleString()})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;