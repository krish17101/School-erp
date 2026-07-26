import type { ReactElement } from 'react';
import { createBrowserRouter, isRouteErrorResponse, useRouteError } from 'react-router-dom';
import { App } from '@/App';

function PlatformStatusPage(): ReactElement {
  return (
    <section className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-6 py-16">
      <div className="space-y-4">
        <p className="text-sm font-medium text-primary">School ERP Platform</p>
        <h1 className="text-3xl font-bold tracking-tight">Application foundation is ready.</h1>
        <p className="max-w-2xl text-muted-foreground">
          The platform infrastructure is initialized. Feature access is introduced through approved
          development phases.
        </p>
      </div>
    </section>
  );
}

function RouteErrorPage(): ReactElement {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? error.status === 404
      ? 'The requested page does not exist.'
      : error.statusText
    : 'An unexpected application error occurred.';

  return (
    <section className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-6 py-16">
      <div className="space-y-3">
        <p className="text-sm font-medium text-destructive">Application error</p>
        <h1 className="text-3xl font-bold tracking-tight">Unable to display this page.</h1>
        <p className="text-muted-foreground">{message}</p>
      </div>
    </section>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        index: true,
        element: <PlatformStatusPage />,
      },
    ],
  },
]);
