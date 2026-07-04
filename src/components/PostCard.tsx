import Link from 'next/link';
import Image from 'next/image';
import { Article } from '@/lib/data';

interface PostCardProps {
  article: Article;
}

export default function PostCard({ article }: PostCardProps) {
  return (
    <div className="post-card">
      <Link href={`/post/${article.slug}`}>
        {article.image ? (
          <div className="post-thumbnail-wrap">
            <Image 
              src={article.image} 
              alt={article.title} 
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="post-thumbnail" 
            />
          </div>
        ) : (
          <div className="post-thumbnail-wrap" style={{ background: '#eee' }}></div>
        )}
      </Link>
      
      <div className="post-content">
        {article.category && (
          <Link href={`/category/${article.category.toLowerCase().replace(/\s+/g, '-')}`} className="post-category">
            {article.category}
          </Link>
        )}
        
        <Link href={`/post/${article.slug}`}>
          <h2 className="post-title">{article.title}</h2>
        </Link>
        
        <div className="post-meta">
          <span className="entry-author">By {article.author}</span>
          <span className="sep">&bull;</span>
          <span className="entry-date">{article.date}</span>
        </div>
        
        <div className="post-summary">
          <p>{article.summary}</p>
        </div>
      </div>
    </div>
  );
}
