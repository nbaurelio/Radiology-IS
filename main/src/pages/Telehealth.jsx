import React from 'react';
import Header from '../components/Header';

function Telehealth() {
  return (
    <>
      <Header activePage="telehealth" />
      <main className="container">
        <section className="grid">
          <article className="card" style={{ gridColumn: '1 / -1', padding: '2rem' }}>
            <h2 style={{ color: 'var(--brand)', marginBottom: '1rem' }}>Telehealth</h2>
            <p style={{ color: 'var(--muted)' }}>Telehealth consultation page - to be implemented</p>
          </article>
        </section>
      </main>
    </>
  );
}

export default Telehealth;
