import React from 'react';
import './Settings.scss';

const Settings = () => {
  const userEmail = localStorage.getItem('userEmail') || 'user@example.com';

  return (
    <div className="settings-page">
      <h2>Account Settings</h2>
      <div className="settings-card">
        <p><strong>Email:</strong> {userEmail}</p>
        <p><strong>Status:</strong> Logged in</p>
      </div>
    </div>
  );
};

export default Settings;
