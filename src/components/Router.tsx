import { useState, useEffect } from 'react';

type Route = '/' | '/categories' | '/places' | '/api-keys' | '/settings';

interface RouterProps {
  children: (currentPath: Route, navigate: (path: Route) => void) => React.ReactNode;
}

export function Router({ children }: RouterProps) {
  const [currentPath, setCurrentPath] = useState<Route>(() => {
    const path = window.location.pathname as Route;
    return ['/', '/categories', '/places', '/api-keys', '/settings'].includes(path) ? path : '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname as Route;
      if (['/', '/categories', '/places', '/api-keys', '/settings'].includes(path)) {
        setCurrentPath(path);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: Route) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  return <>{children(currentPath, navigate)}</>;
}
