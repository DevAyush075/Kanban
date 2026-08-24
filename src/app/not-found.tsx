import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
      <h2>404 - Page Not Found</h2>
      <p style={{ margin: '1rem 0' }}>Could not find requested resource</p>
      <Link href="/" style={{ color: '#6366f1' }}>
        Return Home
      </Link>
    </div>
  );
}
