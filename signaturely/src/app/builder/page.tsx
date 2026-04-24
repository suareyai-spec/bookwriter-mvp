'use client';

import { Suspense } from 'react';
import { BuilderContent } from './BuilderContent';

export default function BuilderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">Loading builder...</div>}>
      <BuilderContent />
    </Suspense>
  );
}
