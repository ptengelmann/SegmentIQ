import React, { useEffect, useState } from 'react';
import './Dashboard.scss';

const Dashboard = () => {
  const [segments, setSegments] = useState([]);
  const [summary, setSummary] = useState('');

  useEffect(() => {
    const raw = localStorage.getItem('segments');
    if (raw) {
      const parsed = JSON.parse(raw);
      setSegments(parsed.segments || []);
      setSummary(parsed.summary || '');
    }
  }, []);

  const segmentGroups = segments.reduce((acc, row) => {
    const seg = row.segment;
    if (!acc[seg]) acc[seg] = [];
    acc[seg].push(row);
    return acc;
  }, {});

  return (
    <div className="dashboard-page">
      <h2>📊 Segmentation Results</h2>
      <p>{summary}</p>

      <div className="segment-grid">
        {Object.entries(segmentGroups).map(([segmentId, users]) => (
          <div key={segmentId} className="segment-card">
            <h3>Segment {segmentId}</h3>
            <p>{users.length} users</p>
            <ul>
              {users.slice(0, 3).map((u, i) => (
                <li key={i}>{Object.values(u)[1]} — {Object.values(u)[2]}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <h4>Segmented Users (first 20)</h4>
      <table>
        <thead>
          <tr>
            {segments[0] && Object.keys(segments[0]).map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {segments.slice(0, 20).map((row, i) => (
            <tr key={i}>
              {Object.values(row).map((val, j) => (
                <td key={j}>{val}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Dashboard;
