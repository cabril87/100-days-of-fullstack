'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect } from 'react';

export default function RedirectPage() {
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    router.replace(`/tasks/${id}`);
  }, [router, id]);

  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
} 