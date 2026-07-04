import Link from 'next/link';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string; // e.g. '/', '/category/moral-stories'
}

export default function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      {currentPage > 1 ? (
        <Link href={`${basePath}?page=${currentPage - 1}`} className="page-link">
          ← Previous
        </Link>
      ) : (
        <span className="page-link disabled">← Previous</span>
      )}
      
      <span className="page-info">
        Page {currentPage} of {totalPages}
      </span>

      {currentPage < totalPages ? (
        <Link href={`${basePath}?page=${currentPage + 1}`} className="page-link">
          Next →
        </Link>
      ) : (
        <span className="page-link disabled">Next →</span>
      )}
    </div>
  );
}
