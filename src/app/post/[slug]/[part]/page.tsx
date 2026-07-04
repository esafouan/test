import { getArticleBySlug, getArticles } from '@/lib/data';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export async function generateStaticParams() {
  const articles = getArticles();
  const params = [];
  for (const article of articles) {
    for (const part of article.parts) {
      params.push({
        slug: article.slug,
        part: part.partNumber.toString(),
      });
    }
  }
  return params;
}

export default async function PostPartPage({ params }: { params: Promise<{ slug: string, part: string }> }) {
  const { slug, part } = await params;
  const partNumber = parseInt(part, 10);
  const article = getArticleBySlug(slug);

  if (!article) notFound();

  const currentPart = article.parts.find(p => p.partNumber === partNumber);
  if (!currentPart) notFound();

  const hasNext = article.parts.some(p => p.partNumber === partNumber + 1);
  const hasPrev = partNumber > 1;

  return (
    <div className="container">
      <article className="single-post-container">
        {article.category && (
          <Link href={`/category/${article.category.toLowerCase().replace(/\s+/g, '-')}`} className="post-category" style={{ marginBottom: '20px', display: 'inline-block' }}>
            {article.category}
          </Link>
        )}

        <h1 className="single-post-title">{article.title} {article.parts.length > 1 ? `(Part ${partNumber})` : ''}</h1>

        <div className="post-meta" style={{ marginBottom: '30px', fontSize: '14px' }}>
          <span className="entry-author">By {article.author}</span>
          <span className="sep">&bull;</span>
          <span className="entry-date">{article.date}</span>
        </div>

        {partNumber === 1 && article.image && (
          <div className="single-post-image-wrap">
            <Image 
              src={article.image} 
              alt={article.title}
              width={800}
              height={500}
              priority
              className="single-post-image" 
            />
          </div>
        )}

        <div className="single-post-content">
          {currentPart.elements.map((el, index) => {
            if (el.type === 'text') {
              return <p key={index}>{el.content}</p>;
            } else if (el.type === 'image' && el.src) {
              return <img key={index} src={el.src} alt="" className="single-post-image" />;
            }
            return null;
          })}
        </div>

        <div className="custom-post-pagination-wrap" style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
          {hasPrev ? (
             <Link href={`/post/${slug}/${partNumber - 1}`} className="nav-btn prev-btn" style={{ padding: '10px 20px', background: '#7f8c8d', color: '#fff', borderRadius: '50px', textDecoration: 'none', fontWeight: 'bold' }}>
               ← Previous Part
             </Link>
          ) : <div></div>}
          
          {hasNext && (
             <Link href={`/post/${slug}/${partNumber + 1}`} className="nav-btn next-btn" style={{ padding: '10px 20px', background: '#27ae60', color: '#fff', borderRadius: '50px', textDecoration: 'none', fontWeight: 'bold' }}>
               Next Part →
             </Link>
          )}
        </div>
      </article>
    </div>
  );
}
