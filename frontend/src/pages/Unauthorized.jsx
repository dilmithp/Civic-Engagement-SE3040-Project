import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1>403 - Unauthorized</h1>
      <p>You do not have the required permissions to view this page.</p>
      <Link to="/">Return to Dashboard</Link>
    </div>
  );
};

export default Unauthorized;
