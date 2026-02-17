'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { removeToken } from '@/lib/auth';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  function handleLogout() {
    removeToken();
    router.push('/login');
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link href="/products" className="navbar-brand">
          MyStore
        </Link>
        
        <div className="navbar-links">
          <Link 
            href="/products" 
            className={pathname === '/products' ? 'nav-link active' : 'nav-link'}
          >
            Products
          </Link>
          <Link 
            href="/profile" 
            className={pathname === '/profile' ? 'nav-link active' : 'nav-link'}
          >
            <span className="profile-icon">👤</span>
            Profile
          </Link>
          <button onClick={handleLogout} className="logout-link">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
