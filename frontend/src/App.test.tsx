import { render, screen } from '@testing-library/react';
import { RouterProvider } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { router } from '@/routes/router';

describe('application shell', () => {
  it('renders the initialized platform status', async () => {
    render(<RouterProvider router={router} />);

    expect(await screen.findByRole('heading', { name: 'Application foundation is ready.' })).toBeInTheDocument();
  });
});
