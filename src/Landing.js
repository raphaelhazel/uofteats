import { useState, useEffect } from "react";
import "./Landing.css";

export default function Landing({ onEnterMap }) {
  const [dark, setDark] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('uofteats-dark');
    if (saved === 'true') setDark(true);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('uofteats-dark', dark);
  }, [dark]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className={`landing ${dark ? 'dark' : 'light'}`}>

      {/* NAV */}
      <nav className={`l-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="l-nav-logo">UofT<span>Eats</span></div>
        <div className="l-nav-links">
          <a href="#how">How it works</a>
          <a href="#groups">For groups</a>
        </div>
        <div className="l-nav-right">
          <button className="dark-toggle" onClick={() => setDark(!dark)} title="Toggle dark mode">
            {dark ? '☀️' : '🌙'}
          </button>
          <button className="l-cta-btn" onClick={onEnterMap}>Open Map →</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="l-hero">
        <div className="l-hero-bg" />
        <div className="l-hero-grid" />
        <div className="l-hero-content">
          <div className="l-hero-tag">📍 UofT St. George Campus</div>
          <h1 className="l-hero-h1">
            Find food.<br />
            <em>Support students.</em>
          </h1>
          <p className="l-hero-sub">
            UofTEats is the campus food discovery map where student groups
            sell food, raise funds, and feed the community — all in real time.
          </p>
          <div className="l-hero-btns">
            <button className="l-btn-primary" onClick={onEnterMap}>Browse the Map →</button>
            <button className="l-btn-secondary" onClick={onEnterMap}>List Your Food Sale</button>
          </div>

          {/* MAP MOCKUP */}
          <div className="l-map-mockup">
            <div className="l-mockup-bar">
              <div className="l-mockup-dot" style={{background:'#ff5f56'}}/>
              <div className="l-mockup-dot" style={{background:'#ffbd2e'}}/>
              <div className="l-mockup-dot" style={{background:'#27c93f'}}/>
              <span className="l-mockup-url">uofteats.ca</span>
            </div>
            <div className="l-mockup-body">
              <div className="l-mockup-header">
                <span className="l-mockup-logo">UofT<em>Eats</em></span>
                <div className="l-mockup-search">Search groups, food...</div>
                <div className="l-mockup-signin">Sign in</div>
              </div>
              <div className="l-mockup-map">
                <svg viewBox="0 0 800 280" style={{width:'100%',height:'100%'}}>
                  <rect width="800" height="280" fill="#e8ede0"/>
                  <line x1="0" y1="140" x2="800" y2="140" stroke="#ccc" strokeWidth="16"/>
                  <line x1="0" y1="90" x2="800" y2="90" stroke="#ccc" strokeWidth="9"/>
                  <line x1="0" y1="190" x2="800" y2="190" stroke="#ccc" strokeWidth="9"/>
                  <line x1="180" y1="0" x2="180" y2="280" stroke="#ccc" strokeWidth="9"/>
                  <line x1="400" y1="0" x2="400" y2="280" stroke="#ccc" strokeWidth="12"/>
                  <line x1="600" y1="0" x2="600" y2="280" stroke="#ccc" strokeWidth="9"/>
                  <rect x="240" y="100" width="280" height="90" rx="4" fill="#d4e6c3" opacity="0.8"/>
                  <text x="380" y="150" textAnchor="middle" fontSize="10" fill="#5a7a5a" fontFamily="sans-serif">University of Toronto St. George</text>
                  {/* pins */}
                  <circle cx="310" cy="138" r="18" fill="#E24B4A" stroke="white" strokeWidth="3"/>
                  <text x="310" y="145" textAnchor="middle" fontSize="14">🍽️</text>
                  <circle cx="370" cy="122" r="18" fill="#BA7517" stroke="white" strokeWidth="3"/>
                  <text x="370" y="129" textAnchor="middle" fontSize="14">☕</text>
                  <circle cx="440" cy="155" r="18" fill="#3B6D11" stroke="white" strokeWidth="3"/>
                  <text x="440" y="162" textAnchor="middle" fontSize="14">🍔</text>
                  <circle cx="340" cy="168" r="18" fill="#185FA5" stroke="white" strokeWidth="3"/>
                  <text x="340" y="175" textAnchor="middle" fontSize="14">🌙</text>
                  <circle cx="480" cy="130" r="18" fill="#1D9E75" stroke="white" strokeWidth="3"/>
                  <text x="480" y="137" textAnchor="middle" fontSize="14">🥦</text>
                  {/* popup */}
                  <rect x="490" y="60" width="170" height="80" rx="10" fill="white" filter="url(#shadow)"/>
                  <defs><filter id="shadow"><feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.15"/></filter></defs>
                  <text x="575" y="82" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#1a1a1a">Engineering Society</text>
                  <text x="575" y="98" textAnchor="middle" fontSize="10" fill="#888">Jerk Chicken Plates</text>
                  <text x="575" y="115" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#ff6b6b">$12</text>
                  <text x="575" y="130" textAnchor="middle" fontSize="9" fill="#aaa">📍 Bahen Centre · Today 12–2pm</text>
                  <polygon points="565,140 585,140 575,152" fill="white"/>
                </svg>
                {/* filter bar */}
                <div className="l-mockup-filters">
                  <span>Filters</span>
                  <span className="l-mf-active">🍽️ Restaurants</span>
                  <span className="l-mf">☕ Cafes</span>
                  <span className="l-mf">🍔 Fast Food</span>
                  <span className="l-mf">🌙 Halal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className="l-stats">
        {[
          { num: '97K+', label: 'UofT Students' },
          { num: 'Real-time', label: 'Live listings' },
          { num: 'Free', label: 'Always for students' },
          { num: 'St. George', label: 'Campus focused' },
        ].map((s, i) => (
          <div className="l-stat" key={i}>
            <div className="l-stat-num">{s.num}</div>
            <div className="l-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* HOW IT WORKS */}
      <section className="l-section" id="how">
        <div className="l-section-inner">
          <div className="l-tag">How it works</div>
          <h2 className="l-section-title">Simple for students.<br />Powerful for groups.</h2>
          <p className="l-section-sub">Whether you're looking for lunch or raising funds for your club, UofTEats connects you in seconds.</p>
          <div className="l-steps">
            {[
              { num: '01', title: 'Browse the map', body: 'Open UofTEats and instantly see all active food sales on campus. Filter by food type, search by name, tap any pin for details.' },
              { num: '02', title: 'Find your food', body: 'Tap any pin to see what a group is selling, the price, exact location, and when they\'re available. No app download needed.' },
              { num: '03', title: 'Show up & eat', body: 'Head to the location at the listed time. Support your fellow students while getting a great meal. Everyone wins.' },
            ].map((s, i) => (
              <div className="l-step" key={i}>
                <div className="l-step-num">{s.num}</div>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOR GROUPS */}
      <section className="l-for-groups" id="groups">
        <div className="l-fg-inner">
          <div className="l-fg-left">
            <div className="l-tag">For student groups</div>
            <h2 className="l-fg-title">Sell food.<br /><span>Raise funds.</span><br />Build community.</h2>
            <p className="l-fg-sub">UofTEats gives your student group a pin on the campus map. Post your sale, set your time, and let hungry students find you.</p>
            <ul className="l-features">
              {[
                'Post a listing in under 2 minutes',
                'Place your pin anywhere on St. George campus',
                'Edit or remove your listing anytime',
                'Vetted groups get a verified badge',
                'Completely free — always',
              ].map((f, i) => <li key={i}>{f}</li>)}
            </ul>
            <button className="l-btn-primary" style={{marginTop: 28}} onClick={onEnterMap}>Apply as a Group →</button>
          </div>
          <div className="l-fg-cards">
            {[
              { emoji: '🍖', name: 'Engineering Society', sub: 'Jerk Chicken · $12' },
              { emoji: '🧁', name: 'Pre-Med Club', sub: 'Bake Sale · $3' },
              { emoji: '🌮', name: 'Latin Students Assoc.', sub: 'Tacos · $8' },
              { emoji: '🧋', name: 'CS Student Union', sub: 'Bubble Tea · $5' },
            ].map((c, i) => (
              <div className="l-fg-card" key={i}>
                <div className="l-fg-emoji">{c.emoji}</div>
                <div className="l-fg-name">{c.name}</div>
                <div className="l-fg-sub">{c.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="l-section">
        <div className="l-section-inner">
          <div className="l-tag">Categories</div>
          <h2 className="l-section-title">Every craving covered.</h2>
          <p className="l-section-sub">Filter by what you're in the mood for.</p>
          <div className="l-cats">
            {[
              { emoji: '🍽️', label: 'Restaurants', color: '#E24B4A' },
              { emoji: '☕', label: 'Cafes & Coffee', color: '#BA7517' },
              { emoji: '🍔', label: 'Fast Food', color: '#3B6D11' },
              { emoji: '🌙', label: 'Halal', color: '#185FA5' },
              { emoji: '🥦', label: 'Vegan / Vegetarian', color: '#1D9E75' },
              { emoji: '🧋', label: 'Bubble Tea & Desserts', color: '#993556' },
            ].map((c, i) => (
              <div className="l-cat" key={i} style={{'--cat-color': c.color}}>
                {c.emoji} {c.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="l-cta">
        <div className="l-cta-bg" />
        <h2 className="l-cta-title">Hungry? <em>Find food</em><br />on campus now.</h2>
        <p className="l-cta-sub">Real-time listings updated by student groups across UofT St. George.</p>
        <button className="l-btn-primary l-btn-lg" onClick={onEnterMap}>Open the Map →</button>
      </section>

      {/* FOOTER */}
      <footer className="l-footer">
        <div className="l-footer-logo">UofT<span>Eats</span></div>
        <div className="l-footer-links">
          <a href="#how">How it works</a>
          <a href="#groups">For Groups</a>
          <a href="#" onClick={onEnterMap}>Map</a>
          <a href="mailto:hello@uofteats.ca">Contact</a>
        </div>
        <div className="l-footer-copy">© 2025 UofTEats</div>
      </footer>

    </div>
  );
}
