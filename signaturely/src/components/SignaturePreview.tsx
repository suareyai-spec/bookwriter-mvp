'use client';

import { SignatureData } from '@/lib/types';
import { generateSignatureHtml } from '@/lib/generateSignatureHtml';
import { useMemo } from 'react';

export function SignaturePreview({ data, showBranding = true }: { data: SignatureData; showBranding?: boolean }) {
  const html = useMemo(() => generateSignatureHtml(data, showBranding), [data, showBranding]);
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
