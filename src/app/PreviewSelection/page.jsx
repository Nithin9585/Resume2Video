import React, { Suspense } from 'react';
import Loading from '../Loading';
import PreviewSelectionClient from './components/PreviewSelectionClient';
export default function PreviewSelectionPage() {
  return (
    <Suspense fallback={<Loading />}>
      <PreviewSelectionClient />
    </Suspense>
  );
}
