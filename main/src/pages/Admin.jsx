import React from 'react';
import Header from '../components/Header';

function Admin() {
  return (
    <>
      <Header activePage="admin" />
      <main className="container">
        <section className="grid">
          <article className="card" style={{ gridColumn: '1 / -1', padding: '2rem' }}>
            <h2 style={{ color: 'var(--brand)', marginBottom: '1rem' }}>Admin Panel</h2>
            <p style={{ color: 'var(--muted)' }}>Admin panel - to be implemented</p>
          </article>
        </section>
      </main>
    </>
  );
}

export default Admin;
