import { GameProvider, GameShell, type PlayerAccount, type SharedLink } from "@/features/game/GameProvider";
import { CreateRoomDialog } from "@/features/game/components/GameDialogs";
import { GameWindow } from "@/features/game/components/GameWindow";
import { LobbyWindow } from "@/features/game/components/LobbyWindow";
import { MobileTabs, SideTabs } from "@/features/game/components/ModeTabs";
import { RoomsKiosk } from "@/features/game/components/RoomsKiosk";
import { ReplayProvider } from "../replay-context";
import { Backband } from "./Backband";
import { Hero, HowToPlay, Sun } from "./HomeSections";
import { Intro } from "./Intro";
import { Masthead } from "./Masthead";
import "../orion.css";

/** Page d'accueil O.R.I.O.N : intro, colonne journal, fenêtre de jeu, salons. */
type OrionHomeProps = {
  initialAccount: PlayerAccount | null;
  socialSignInFailed: boolean;
  sharedLink: SharedLink | null;
};

export function OrionHome({ initialAccount, socialSignInFailed, sharedLink }: OrionHomeProps) {
  return (
    <ReplayProvider>
      <GameProvider initialAccount={initialAccount} socialSignInFailed={socialSignInFailed} sharedLink={sharedLink}>
        <GameShell>
          <Intro />
          <div className="scene">
            <Backband />
            <div className="grid">
              <SideTabs />
              <div className="col">
                <main className="paper">
                  <Masthead />
                  <Hero />
                  <section className="redblock" id="jouer">
                    <p className="lead">
                      Un jeu de course en ligne : rejoins la grille de départ, affronte les autres pilotes et vise la
                      première place.
                    </p>
                    <div className="stage">
                      <MobileTabs />
                      <GameWindow />
                      <LobbyWindow />
                    </div>
                  </section>
                  <Sun />
                  <p className="tagline">
                    Du feu vert à la ligne d&apos;arrivée, chaque virage compte. Et tout peut basculer au dernier tour.
                  </p>
                  <HowToPlay />
                  <footer className="pfoot">
                    <small>O.R.I.O.N · jeu de course en ligne</small>
                  </footer>
                </main>
              </div>
            </div>
          </div>
          <RoomsKiosk />
          <CreateRoomDialog />
        </GameShell>
      </GameProvider>
    </ReplayProvider>
  );
}
