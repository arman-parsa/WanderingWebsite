export default function VideographyPage({ params }: { params: { slug: string } }) {
  return <main id="main-content"><p>Videography: {params.slug}</p></main>;
}
