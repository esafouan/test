import Link from 'next/link';

export default function Header() {
  return (
    <header className="header">
      <div className="container header-content">
        <Link href="/" className="logo">
          trueMoment.
        </Link>
        <nav className="nav-links">
          <Link href="/">Home</Link>
          <Link href="/category/moral-stories">Moral Stories</Link>
          <Link href="/category/tech">Tech</Link>
        </nav>
      </div>
    </header>
  );
}
