import type { Metadata } from 'next';

import { LegalPage } from '@/components/site/LegalPage';
import { Footer, CONTACT } from '@/components/site/Footer';
import { getServerStrings } from '@/lib/i18n/server';
import { privacyDoc } from '@/lib/legal';

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getServerStrings();
  const doc = privacyDoc(locale, {
    siteName: t.site.name,
    email: CONTACT.email,
    phone: CONTACT.phone,
  });

  return { title: doc.title, description: doc.lead };
}

export default async function Privatnost() {
  const { locale, t } = await getServerStrings();
  const doc = privacyDoc(locale, {
    siteName: t.site.name,
    email: CONTACT.email,
    phone: CONTACT.phone,
  });

  return (
    <>
      <LegalPage doc={doc} backLabel={t.confirmation.backHome} />
      <Footer />
    </>
  );
}
