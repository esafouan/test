import { getArticles } from '@/lib/data';
import PostCard from '@/components/PostCard';
import Pagination from '@/components/Pagination';

export default async function Home({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const params = await searchParams;
  const page = parseInt(params.page || '1', 10);
  const articlesPerPage = 9;
  
  const allArticles = getArticles();
  const totalPages = Math.ceil(allArticles.length / articlesPerPage);
  
  const startIndex = (page - 1) * articlesPerPage;
  const endIndex = startIndex + articlesPerPage;
  const articles = allArticles.slice(startIndex, endIndex);

  return (
    <div className="container">
      <div className="posts-grid">
        {articles.map((article) => (
          <PostCard key={article.slug} article={article} />
        ))}
      </div>
      
      <Pagination 
        currentPage={page} 
        totalPages={totalPages} 
        basePath="/" 
      />
    </div>
  );
}
