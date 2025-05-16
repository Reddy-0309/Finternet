import React, { lazy, Suspense } from 'react';

// Loading component to show while lazy-loaded components are loading
const LoadingFallback = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 dark:border-primary-400"></div>
  </div>
);

/**
 * Creates a lazy-loaded component with a loading fallback
 * @param {Function} importFunc - Dynamic import function
 * @returns {React.LazyExoticComponent} - Lazy-loaded component wrapped in Suspense
 */
export const lazyLoad = (importFunc) => {
  const LazyComponent = lazy(importFunc);
  
  return (props) => (
    <Suspense fallback={<LoadingFallback />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

/**
 * Creates a lazy-loaded component with a custom loading fallback
 * @param {Function} importFunc - Dynamic import function
 * @param {React.ReactNode} fallback - Custom fallback component
 * @returns {React.LazyExoticComponent} - Lazy-loaded component wrapped in Suspense
 */
export const lazyLoadWithCustomFallback = (importFunc, fallback) => {
  const LazyComponent = lazy(importFunc);
  
  return (props) => (
    <Suspense fallback={fallback || <LoadingFallback />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};
