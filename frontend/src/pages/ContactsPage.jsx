import { Link } from 'react-router-dom'

// Données factices (à remplacer par API plus tard)
const MOCK_CONTACTS = [
  { id: 1, nom: 'Marie Martin', email: 'marie.martin@exemple.fr' },
  { id: 2, nom: 'Paul Bernard', email: 'paul.bernard@exemple.fr' },
  { id: 3, nom: 'Sophie Petit', email: 'sophie.petit@exemple.fr' },
  { id: 4, nom: 'Lucas Dubois', email: 'lucas.dubois@exemple.fr' },
  { id: 5, nom: 'Emma Laurent', email: 'emma.laurent@exemple.fr' },
  { id: 6, nom: 'Hugo Moreau', email: 'hugo.moreau@exemple.fr' },
]

export default function ContactsPage() {
  return (
    <div className="contacts-page">
      <div className="home-bg" aria-hidden>
        <div className="home-bg-layer home-bg-layer--1" />
        <div className="home-bg-layer home-bg-layer--2" />
        <div className="home-bg-layer home-bg-layer--3" />
        <div className="home-bg-layer home-bg-layer--4" />
        <div className="home-bg-noise" />
      </div>

      <header className="contacts-header">
        <Link to="/dashboard" className="back-home" aria-label="Retour au tableau de bord">
          <span className="back-home-arrow" aria-hidden>←</span>
        </Link>
        <h1 className="contacts-title">Contacts</h1>
      </header>

      <main className="contacts-main">
        <section className="contacts-content home-glass home-glass--card">
          <ul className="contacts-list">
            {MOCK_CONTACTS.map((c) => (
              <li key={c.id} className="contacts-list-item">
                <span className="contacts-list-item-name">{c.nom}</span>
                <span className="contacts-list-item-email">{c.email}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="home-footer home-glass" />
    </div>
  )
}
