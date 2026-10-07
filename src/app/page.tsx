import { Clock } from "./_components/Clock";
import { FishIllustration } from "./_components/FishIllustration";
import { LoginCard } from "./_components/LoginCard";
import { Logo } from "./_components/Logo";
import { ReplayButton } from "./_components/ReplayButton";
import { ReplayProvider } from "./_components/replay-context";
import { StageSection } from "./_components/StageSection";
import { Stripes } from "./_components/Stripes";
import { TitleSvg } from "./_components/TitleSvg";
import styles from "./page.module.css";

export default function Home() {
  return (
    <>
      <header className={styles.menubar}>
        <Logo width={22} height={14} />
        <span>Fichier</span>
        <span>Édition</span>
        <span className="max-[600px]:hidden">Affichage</span>
        <span className="max-[600px]:hidden">Spécial</span>
        <Clock />
      </header>

      <main className={styles.window}>
        <div className={styles.titlebar}>
          <div className="w-4 h-4 border-2 border-border bg-background box-border shrink-0" />
          <Stripes />
          <div className="font-sans text-[14px] px-[12px] whitespace-nowrap">Orion.app — v1.0</div>
          <Stripes />
        </div>

        <ReplayProvider>
          <div className={styles.content}>
            <div className={styles.head}>
              <div className="flex flex-col gap-[6px]">
                <div className="bg-foreground text-background px-[10px] py-[2px] font-sans text-[14px] self-start">
                  N°07
                </div>
                <div>
                  SÉRIE PROFONDEURS
                  <span className="max-[600px]:hidden"><br />ÉTUDE EN ESPACE NÉGATIF</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-[10px] text-right">
                <div className="max-[600px]:hidden">
                  HI-SCORE : 000
                  <br />
                  NIV : 01
                </div>
                <ReplayButton />
              </div>
            </div>

            <StageSection illustration={<FishIllustration />}>
              <LoginCard />
            </StageSection>

            <div className={styles.titlewrap}>
              <h1 className="m-0">
                <TitleSvg />
              </h1>
              <p className={`${styles.tagline} m-0`}>
                Système d&apos;accès rétro. Identifiez-vous pour plonger dans les profondeurs.
              </p>
            </div>
          </div>
        </ReplayProvider>
      </main>
    </>
  );
}
