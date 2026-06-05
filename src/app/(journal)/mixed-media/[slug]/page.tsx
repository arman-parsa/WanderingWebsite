export default function MixedMediaPage({ params }: { params: { slug: string } }) {
  return <main id="main-content"><p>Mixed Media: {params.slug}</p></main>;
}
