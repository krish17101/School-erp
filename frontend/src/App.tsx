import type { ReactElement } from 'react';
import { Outlet } from 'react-router-dom';

export function App(): ReactElement {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Outlet />
    </main>
  );
}
