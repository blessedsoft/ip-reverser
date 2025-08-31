import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [ipAddress, setIpAddress] = useState('');
  const [reversedIp, setReversedIp] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  //  Use NodePort exposed on localhost
  const backendUrl = "http://localhost:30081";

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
