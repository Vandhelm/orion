type WindowBarProps = {
  titleId: string;
  title: string;
  /** Si présent, la case de gauche devient un bouton « Fermer ». */
  onClose?: () => void;
};

/** Barre de titre façon fenêtre Mac : case de fermeture, hachures, titre centré. */
export function WindowBar({ titleId, title, onClose }: WindowBarProps) {
  return (
    <div className="wbar">
      {onClose ? (
        <button className="closebox cbtn" type="button" aria-label="Fermer" onClick={onClose} />
      ) : (
        <div className="closebox" />
      )}
      <div className="stripes grow h-full" />
      <h2 id={titleId} className="wtitle" tabIndex={-1}>
        {title}
      </h2>
      <div className="stripes grow h-full" />
    </div>
  );
}
