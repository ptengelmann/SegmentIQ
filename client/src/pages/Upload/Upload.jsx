import React, { useState } from 'react';
import Papa from 'papaparse';
import { useNavigate } from 'react-router-dom';
import './Upload.scss';

const Upload = () => {
  const [rows, setRows] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [fileName, setFileName] = useState(null);
  const navigate = useNavigate();

  const handleFile = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  setFileName(file.name);
  Papa.parse(file, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    complete: function (results) {
      console.log('[CSV Parse Results]', {
        fields: results.meta.fields,
        dataLength: results.data.length,
        sampleRow: results.data[0],
        errors: results.errors
      });
      
      // Filter out completely empty rows
      const cleanData = results.data.filter(row => 
        Object.values(row).some(val => val !== null && val !== undefined && val !== '')
      );
      
      console.log('[Cleaned Data]', {
        originalLength: results.data.length,
        cleanedLength: cleanData.length,
        sampleCleanRow: cleanData[0]
      });
      
      setHeaders(results.meta.fields);
      setRows(cleanData);
    },
  });
};

  const handleSubmit = async () => {
    const token = localStorage.getItem('token');
    if (!token) return alert('You must be logged in');

    try {
      const res = await fetch('http://localhost:5000/api/segment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ data: rows })
      });

      const contentType = res.headers.get('content-type');
      const result = contentType?.includes('application/json')
        ? await res.json()
        : { error: await res.text() };

      console.log('[AI Response]', result);

      if (!res.ok || result.error) {
        alert('AI Error: ' + result.error || 'Server error');
        return;
      }

      localStorage.setItem('segments', JSON.stringify(result));
      navigate('/dashboard');

    } catch (err) {
      console.error(err);
      alert('Failed to submit data');
    }
  };

  return (
    <div className="upload-page">
      <h2>Upload Customer CSV</h2>
      <input type="file" accept=".csv" onChange={handleFile} />

      {fileName && (
        <div>
          <h4>Preview: {fileName}</h4>
          <button onClick={handleSubmit} disabled={!rows.length}>
            Submit for Segmentation
          </button>

          <table>
            <thead>
              <tr>
                {headers.map((head) => (
                  <th key={head}>{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 10).map((row, i) => (
                <tr key={i}>
                  {headers.map((head) => (
                    <td key={head}>{row[head]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Upload;
