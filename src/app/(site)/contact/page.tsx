import type { Metadata } from 'next';
import Image from 'next/image';
import { pageMetadata } from '@/lib/metadata';
import { getSiteSettings } from '@/lib/siteSettings';
import { SocialIcon, hasSocialIcon } from '@/components/content/SocialIcon';

// Bio, email and social links come from Site Settings (with fallbacks).
export const revalidate = 300;

export const metadata: Metadata = pageMetadata({
  title: 'Contact',
  description:
    'Arman Parsa — writer, photographer and filmmaker, UK based and working worldwide. Get in touch about commissions, collaborations and editorial projects.',
  path: '/contact',
});

const BIO_CLASS = 'font-serif text-[length:var(--text-lg)] leading-[var(--leading-relaxed)]';

export default async function ContactPage() {
  const { bio, contactEmail, socialLinks } = await getSiteSettings();
  const [lead, ...rest] = bio;

  return (
    <main id="main-content" className="flex flex-1 flex-col">
      <h1 className="sr-only">Contact Arman Parsa</h1>

      {/* Portrait and bio, then straight on to the contact details. */}
      <section aria-label="About" className="pt-[clamp(7rem,16vh,10rem)]">
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
            {lead && <p className={`${BIO_CLASS} font-bold`}>{lead}</p>}
            {rest.map((paragraph) => (
              <p key={paragraph} className={`mt-6 ${BIO_CLASS}`}>
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Then: how to get in touch. */}
      <section
        aria-label="Get in touch"
        className="mx-auto w-full max-w-[var(--content-max-width)] px-[var(--content-padding-x)] pb-32 pt-16 text-center"
      >
        <p className={BIO_CLASS}>
          For partnerships, editorial enquiries, or just to say hello — reach out by email.
        </p>

        <a
          href={`mailto:${contactEmail}`}
          className="mt-8 inline-block font-sans text-sm uppercase tracking-widest text-ink underline-offset-4 opacity-75 transition-opacity duration-[var(--duration-fast)] hover:opacity-100"
        >
          {contactEmail}
        </a>

        {socialLinks.length > 0 && (
          <ul className="mt-10 flex flex-wrap items-center justify-center gap-7">
            {socialLinks.map(({ platform, url }) => (
                <li key={url}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Arman Parsa on ${platform}`}
                    className="-m-3 inline-flex p-3 font-sans text-xs uppercase tracking-widest text-ink opacity-55 transition-opacity duration-[var(--duration-fast)] hover:opacity-80 active:opacity-80"
                  >
                    {/* Platforms without an icon show their name. */}
                    {hasSocialIcon(platform) ? <SocialIcon platform={platform} /> : platform}
                  </a>
                </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
