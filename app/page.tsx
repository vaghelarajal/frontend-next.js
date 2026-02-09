'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Always redirect to login page first
    router.push('/login');
  }, [router]);

  return (
    <div className="auth-container">
      <div className="loading-message">Loading...</div>
    </div>
  );
}
