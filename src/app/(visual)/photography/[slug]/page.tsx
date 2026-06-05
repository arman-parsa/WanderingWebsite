export default function PhotographyPage({ params }: { params: { slug: string } }) {
  return <main id="main-content"><p>Photography: {params.slug}</p></main>;
}
