import Link from "next/link";

/*
 * THESIS: A photo preparation page that makes privacy and practical readiness equally clear.
 * OWN-WORLD: Cream paper, burgundy ink, blush accents, fine rules, and editorial display type.
 * STORY: Review four calm guidelines, understand the local-only boundary, then choose an illustrative next action.
 * FIRST VIEWPORT: A restrained header and progress line lead into the heading beside a single face-frame outline.
 * FORM: An Operate-mode instruction sheet, directly extending the established Wela visual system.
 */
const guidelines = [
  "Use soft, even lighting",
  "Face the camera directly",
  "Remove glasses and keep hair away",
  "Avoid filters and beauty effects",
];

export default function PhotoPreparationPage() {
  return (
    <main className="photo-preparation">
      <section
        className="photo-preparation__screen"
        aria-labelledby="photo-preparation-title"
      >
        <header className="photo-preparation__header">
          <Link className="photo-preparation__back" href="/">
            <span aria-hidden="true">←</span>
            Back
          </Link>
          <p className="photo-preparation__disclosure">
            Prototype · Simulated experience
          </p>
        </header>

        <div className="photo-preparation__progress" aria-label="Step 4 of 6">
          <span className="photo-preparation__progress-line" aria-hidden="true" />
          <p>Step 4 of 6</p>
        </div>

        <div className="photo-preparation__introduction">
          <p className="photo-preparation__eyebrow">Photo preparation</p>
          <h1 id="photo-preparation-title">Prepare for your skin check</h1>
          <p className="photo-preparation__description">
            For the clearest simulated result, please follow these simple
            guidelines before selecting a photo.
          </p>
        </div>

        <div
          className="photo-preparation__face-frame"
          role="img"
          aria-label="A minimal illustration of a face prepared for a photograph"
        >
          <svg viewBox="0 0 240 300" aria-hidden="true">
            <path d="M80 54C91 31 107 22 120 22C133 22 149 31 160 54" />
            <path d="M77 94C77 64 93 47 120 47C147 47 163 64 163 94V142C163 183 144 208 120 208C96 208 77 183 77 142V94Z" />
            <path d="M102 207V226C96 236 87 242 75 246" />
            <path d="M138 207V226C144 236 153 242 165 246" />
            <path d="M52 264C63 249 81 241 102 238H138C159 241 177 249 188 264" />
          </svg>
        </div>

        <section className="photo-preparation__guidance" aria-labelledby="guidance-title">
          <h2 id="guidance-title">Before you begin</h2>
          <ul>
            {guidelines.map((guideline) => (
              <li key={guideline}>
                <span className="photo-preparation__check" aria-hidden="true">
                  ✓
                </span>
                {guideline}
              </li>
            ))}
          </ul>
        </section>

        <aside className="photo-preparation__privacy" aria-label="Privacy information">
          <span className="photo-preparation__privacy-mark" aria-hidden="true">◦</span>
          <p>
            Your photo remains on this device and will not be uploaded, stored,
            or analysed in this prototype.
          </p>
        </aside>

        <div className="photo-preparation__actions" role="group" aria-label="Photo options">
          <button className="button button--primary" type="button">
            Take a photo
          </button>
          <button className="button button--secondary" type="button">
            Choose from library
          </button>
        </div>
      </section>
    </main>
  );
}
