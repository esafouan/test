import { getArticles } from '@/lib/data';
import { redirect } from 'next/navigation';

export async function generateStaticParams() {
  const articles = getArticles();
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/post/${slug}/1`);
}
