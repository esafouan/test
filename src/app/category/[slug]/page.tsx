import { getArticlesByCategory, getCategories } from '@/lib/data';
import PostCard from '@/components/PostCard';
import Pagination from '@/components/Pagination';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  const categories = getCategories();
  return categories.map((cat) => ({
    slug: cat.toLowerCase().replace(/\s+/g, '-'),
  }));
}

export default async function CategoryPage({ params, searchParams }: { params: Promise<{ slug: string }>, searchParams: Promise<{ page?: string }> }) {
  const { slug } = await params;
  const sParams = await searchParams;
  
  const allArticles = getArticlesByCategory(slug);

  if (!allArticles || allArticles.length === 0) {
    notFound();
  }

  const categoryName = allArticles[0].category;
  const page = parseInt(sParams.page || '1', 10);
  const articlesPerPage = 9;
  const totalPages = Math.ceil(allArticles.length / articlesPerPage);
  
  const startIndex = (page - 1) * articlesPerPage;
  const endIndex = startIndex + articlesPerPage;
  const articles = allArticles.slice(startIndex, endIndex);

  return (
    <div className="container">
      <h1 className="category-page-title">
        {categoryName}
      </h1>
      <div className="posts-grid">
        {articles.map((article) => (
          <PostCard key={article.slug} article={article} />
        ))}
      </div>
      
      <Pagination 
        currentPage={page} 
        totalPages={totalPages} 
        basePath={`/category/${slug}`} 
      />
    </div>
  );
}
