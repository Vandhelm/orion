import { LineFish } from "./LineFish";

/** Héros : disque noir, poisson au trait et accroche. */
export function Hero() {
  return (
    <section className="hero">
      <div className="hart">
        <div className="disc" />
        <LineFish className="lfish" />
      </div>
      <div className="htxt">
        <p className="big">
          PRÊTS.
          <br />
          PARTEZ.
          <br />
          <span>FONCEZ !</span>
        </p>
      </div>
    </section>
  );
}

/** Soleil à rayons rouges, poisson au centre. */
export function Sun() {
  return (
    <section className="sun">
      <div className="bcircle">
        <LineFish className="lfish big" />
      </div>
    </section>
  );
}

const HOW_TO_PLAY_STEPS = ["Étape 1", "Étape 2", "Étape 3", "Étape 4"];

/** « Comment jouer » : cartes en attente de leur contenu (maquette). */
export function HowToPlay() {
  return (
    <section className="how">
      <h2 className="sec">Comment jouer</h2>
      <ol className="cards">
        {HOW_TO_PLAY_STEPS.map((step) => (
          <li key={step} className="mock">
            <svg viewBox="0 0 64 64" aria-hidden="true">
              <path d="M0 0 L64 64 M64 0 L0 64" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <b>{step}</b>
            <span>Texte à venir</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
