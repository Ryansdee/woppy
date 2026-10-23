import { redirect } from 'next/navigation';

/* Ancienne page : les candidatures sont dans l'onglet « Mes jobs » de Mon activité */
export default function MesCandidaturesPage() {
  redirect('/dashboard/activity');
}
