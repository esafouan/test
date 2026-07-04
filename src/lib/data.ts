import fs from 'fs';
import path from 'path';

export interface ArticleElement {
  type: 'text' | 'image';
  content?: string;
  src?: string;
}

export interface ArticlePart {
  partNumber: number;
  elements: ArticleElement[];
}

export interface Article {
  slug: string;
  title: string;
  author: string;
  date: string;
  category: string;
  parts: ArticlePart[];
  summary: string;
  image: string | null;
}

export function getArticles(): Article[] {
  const filePath = path.join(process.cwd(), 'src/lib/articles.json');
  try {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('Error reading articles.json:', error);
    return [];
  }
}

export function getArticleBySlug(slug: string): Article | undefined {
  const articles = getArticles();
  return articles.find(article => article.slug === slug);
}

export function getArticlesByCategory(category: string): Article[] {
  const articles = getArticles();
  // We'll normalize categories for comparison by replacing spaces with hyphens and making them lowercase
  return articles.filter(article => {
    if (!article.category) return false;
    return article.category.toLowerCase().replace(/\s+/g, '-') === category.toLowerCase();
  });
}

export function getCategories(): string[] {
  const articles = getArticles();
  const categories = new Set(articles.map(article => article.category).filter(Boolean));
  return Array.from(categories);
}
