import type { Metadata } from 'next';
import Image from 'next/image';
import { pageMetadata } from '@/lib/metadata';
import { getSiteSettings } from '@/lib/siteSettings';

// Bio, email and social links come from Site Settings (with fallbacks).
export const revalidate = 300;

export const metadata: Metadata = pageMetadata({
  title: 'Contact',
  description:
    'Arman Parsa — writer, photographer and filmmaker, UK based and working worldwide. Get in touch about commissions, collaborations and editorial projects.',
  path: '/contact',
});

export default async function ContactPage() {
  const { bio, contactEmail, socialLinks } = await getSiteSettings();

  return (
    <main id="main-content" className="flex flex-1 flex-col justify-center py-24">
      <div className="contact-layout">
        <div className="contact-portrait">
          <Image
            src="/images/about-portrait.jpg"
            alt="Arman Parsa hiking in the Dolomites, carrying a camera pack and tripod"
            fill
            preload
            quality={90}
            // The photo is landscape (≈1.5:1) cropped into a 3:4 frame of at
            // most 330px wide, so it renders ~2× the frame's width: 660px.
            sizes="660px"
            className="contact-portrait__img"
          />
        </div>

        <div className="contact-text">
          <h1 className="contact-heading">Arman Parsa</h1>
          <div className="contact-bio">
            {bio.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <hr className="contact-rule" />

          <div className="contact-details">
            <a href={`mailto:${contactEmail}`} className="contact-link contact-link--email">
              {contactEmail}
            </a>
            {socialLinks.length > 0 && (
              <ul className="contact-social" aria-label="Elsewhere">
                {socialLinks.map(({ platform, url }) => (
                  <li key={url}>
                    <a href={url} target="_blank" rel="noopener noreferrer" className="contact-link">
                      {platform}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
