/*
 * THESIS: A private consultation opening, not a technology landing page.
 * OWN-WORLD: Cream paper, burgundy lacquer, blush textile, and quiet editorial type.
 * STORY: Understand the simulated experience, trust its limits, then begin a concise routine.
 * FIRST VIEWPORT: Brand and status lead into a tactile still life, personal headline, and one clear action.
 * FORM: A focused mobile editorial cover that stays intimate at larger widths.
 */
export default function Home() {
  return (
    <main className="welcome">
      <section className="welcome__screen" aria-labelledby="welcome-title">
        <header className="welcome__header">
          <p className="brand" aria-label="Wela">
            Wela
          </p>
          <p className="prototype-label">Prototype · Simulated results</p>
        </header>

        <div className="welcome__visual" aria-hidden="true">
          <span className="still-life__folio" />
          <span className="still-life__fabric" />
          <span className="still-life__tray" />
          <span className="still-life__vessel" />
          <span className="still-life__pearl" />
        </div>

        <div className="welcome__copy">
          <p className="welcome__kicker">Private skin consultation</p>
          <h1 id="welcome-title">
            <span>Understand your skin.</span>
            <span>Choose with confidence.</span>
          </h1>
          <p className="welcome__description">
            Discover a refined skincare routine tailored to your skin goals,
            lifestyle, and the time you have available.
          </p>
          <p className="welcome__supporting">
            Personalised guidance. Thoughtful choices. A routine designed around
            you.
          </p>
        </div>

        <div
          className="welcome__actions"
          role="group"
          aria-label="Consultation options"
        >
          <button className="button button--primary" type="button">
            Begin your consultation
          </button>
          <button className="button button--secondary" type="button">
            See how it works
          </button>
        </div>

        <footer className="welcome__footer">
          <span className="welcome__rule" aria-hidden="true" />
          <ul className="welcome__trust-list">
            <li>Takes approximately 2–3 minutes</li>
            <li>Your information remains under your control</li>
            <li>Results are not a medical diagnosis</li>
          </ul>
        </footer>
      </section>
    </main>
  );
}
