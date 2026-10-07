/**
 * Les comptes pseudo n'ont pas de courriel, mais Better Auth en exige un (colonne unique).
 * On en dérive un du pseudo, dans le domaine réservé .invalid : jamais une vraie adresse.
 */
const PSEUDO_EMAIL_DOMAIN = "pseudo.orion.invalid";

export function pseudoEmail(pseudo: string): string {
  return `${pseudo.trim().toLowerCase()}@${PSEUDO_EMAIL_DOMAIN}`;
}
