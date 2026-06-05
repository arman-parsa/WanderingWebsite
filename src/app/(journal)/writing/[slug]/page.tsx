export default function WritingPage({ params }: { params: { slug: string } }) {
  return <main id="main-content"><p>Writing: {params.slug}</p></main>;
}
