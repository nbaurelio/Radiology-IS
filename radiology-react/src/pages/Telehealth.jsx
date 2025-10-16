import React from 'react'

const Telehealth = () => {
  return (
    <section className="grid">
      {/* Placeholder for future telehealth functionality */}
      <article className="card" style={{gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px'}}>
        <div style={{fontSize: '64px', marginBottom: '20px', color: 'var(--brand)'}}>⚕</div>
        <h2 style={{margin: '0 0 16px 0', fontSize: '24px', fontWeight: '700', color: 'var(--ink)'}}>
          Telehealth Services
        </h2>
        <p style={{margin: '0 0 24px 0', color: 'var(--muted)', fontSize: '16px'}}>
          Remote consultation and patient communication platform
        </p>
        <p style={{color: 'var(--muted)', fontSize: '14px'}}>
          This feature will be implemented in future updates.
        </p>
      </article>
    </section>
  )
}

export default Telehealth
