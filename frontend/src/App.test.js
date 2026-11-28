import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import StatusBadge from './components/StatusBadge';
import ProtectedRoute from './components/ProtectedRoute';
import AdminResources from './pages/AdminResources';
import { AuthProvider } from './context/AuthContext';
import axiosInstance, { STORAGE_KEY } from './axiosConfig';

jest.mock('./axiosConfig', () => ({
  __esModule: true,
  STORAGE_KEY: 'kadidjiny_auth_user',
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('T7 · Kadidjiny Library UI States, Role Guard & Form Entry Preservation (LRL-29)', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('StatusBadge pairs visible text labels with status badges across all states', () => {
    const { rerender } = render(<StatusBadge status="Draft" />);
    expect(screen.getByText('Draft')).toBeInTheDocument();

    rerender(<StatusBadge status="Published" />);
    expect(screen.getByText('Published')).toBeInTheDocument();

    rerender(<StatusBadge status="Archived" />);
    expect(screen.getByText('Archived')).toBeInTheDocument();

    rerender(<StatusBadge status="Saved" />);
    expect(screen.getByText('Saved')).toBeInTheDocument();
  });

  test('ProtectedRoute renders 403 Access Denied view when a Student visits an Admin route (T1)', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        id: 'u1',
        name: 'Sam Student',
        email: 'sam@qut.edu.au',
        role: 'student',
        token: 'fake-jwt',
      })
    );

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AuthProvider>
          <ProtectedRoute requireAdmin>
            <div>Secret Admin Panel</div>
          </ProtectedRoute>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByText(/403 · Access Denied/i)).toBeInTheDocument();
    expect(screen.getByText(/Educator permissions required/i)).toBeInTheDocument();
    expect(screen.queryByText('Secret Admin Panel')).not.toBeInTheDocument();
  });

  test('AdminResources preserves valid user entries and identifies invalid field inline on 400 error (T7 Should)', async () => {
    axiosInstance.get.mockResolvedValueOnce({ data: [] });
    axiosInstance.post.mockRejectedValueOnce({
      response: {
        status: 400,
        data: {
          message: 'Please correct the highlighted resource fields.',
          fieldErrors: {
            accessUrl: 'Enter a valid http:// or https:// destination URL.',
          },
        },
      },
    });

    render(
      <MemoryRouter>
        <AdminResources />
      </MemoryRouter>
    );

    await waitFor(() => expect(axiosInstance.get).toHaveBeenCalledWith('/api/resources/manage'));

    const titleInput = screen.getByLabelText(/Resource title/i);
    const providerInput = screen.getByLabelText(/Author or provider/i);
    const descInput = screen.getByLabelText(/Description/i);
    const urlInput = screen.getByLabelText(/Access URL/i);

    fireEvent.change(titleInput, { target: { value: 'Structural steel design' } });
    fireEvent.change(providerInput, { target: { value: 'University engineering collection' } });
    fireEvent.change(descInput, { target: { value: 'AS 4100 member design guide.' } });
    fireEvent.change(urlInput, { target: { value: 'invalid-link' } });

    fireEvent.click(screen.getByRole('button', { name: /^Publish$/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Enter a valid http:\/\/ or https:\/\/ destination URL\./i)
      ).toBeInTheDocument();
    });

    // Valid entries are preserved so staff do not have to re-type the form
    expect(titleInput).toHaveValue('Structural steel design');
    expect(providerInput).toHaveValue('University engineering collection');
    expect(descInput).toHaveValue('AS 4100 member design guide.');
    expect(urlInput).toHaveAttribute('aria-invalid', 'true');
  });
});
