import { useGame, type StatusArea } from "../GameProvider";

type StatusMessageProps = {
  area: StatusArea;
  /** "alert" dans les boîtes de dialogue, où l'erreur doit être annoncée tout de suite. */
  role?: "status" | "alert";
};

/** Message d'état d'une zone (info ou erreur), masqué quand il n'y en a pas. */
export function StatusMessage({ area, role = "status" }: StatusMessageProps) {
  const status = useGame().statuses[area];
  return (
    <p className={`status${status?.error ? " err" : ""}`} role={role} hidden={!status}>
      {status?.message}
    </p>
  );
}
