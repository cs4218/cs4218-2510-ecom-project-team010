import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import PrivateRoute from './Private';
import { useAuth } from '../../context/auth';

jest.mock('axios');
jest.mock('../../context/auth');
jest.mock('../Spinner', () => {
    return function MockSpinner({ path }) {
        return <div data-testid="spinner">Loading... Path: {path}</div>;
    };
});
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    Outlet: () => <div data-testid="outlet">Protected Content</div>
}));

const mockedAxios = axios;
const mockUseAuth = useAuth;

describe('PrivateRoute', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleSpy.mockRestore();
    });

    const renderPrivateRoute = () => {
        return render(
            <MemoryRouter>
                <PrivateRoute />
            </MemoryRouter>
        );
    };

    describe('when user has no token', () => {
        it('should render Spinner when auth token is null', () => {
            mockUseAuth.mockReturnValue([{ token: null }, jest.fn()]);

            renderPrivateRoute();

            expect(screen.getByTestId('spinner')).toBeInTheDocument();
            expect(screen.queryByTestId('outlet')).not.toBeInTheDocument();
            expect(mockedAxios.get).not.toHaveBeenCalled();
        });

        it('should render Spinner when auth token is undefined', () => {
            mockUseAuth.mockReturnValue([{ token: undefined }, jest.fn()]);

            renderPrivateRoute();

            expect(screen.getByTestId('spinner')).toBeInTheDocument();
            expect(screen.queryByTestId('outlet')).not.toBeInTheDocument();
            expect(mockedAxios.get).not.toHaveBeenCalled();
        });

        it('should render Spinner when auth is empty object', () => {
            mockUseAuth.mockReturnValue([{}, jest.fn()]);

            renderPrivateRoute();

            expect(screen.getByTestId('spinner')).toBeInTheDocument();
            expect(screen.queryByTestId('outlet')).not.toBeInTheDocument();
            expect(mockedAxios.get).not.toHaveBeenCalled();
        });
    });

    describe('when user has token', () => {
        it('should render Outlet when authentication is successful', async () => {
            mockUseAuth.mockReturnValue([{ token: 'valid-token' }, jest.fn()]);
            mockedAxios.get.mockResolvedValueOnce({
                data: { ok: true }
            });

            renderPrivateRoute();

            // Initially shows spinner
            expect(screen.getByTestId('spinner')).toBeInTheDocument();
            expect(screen.queryByTestId('outlet')).not.toBeInTheDocument();

            // Wait for API call and state update
            await waitFor(() => {
                expect(screen.getByTestId('outlet')).toBeInTheDocument();
            });

            expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
            expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/auth/user-auth');
            expect(mockedAxios.get).toHaveBeenCalledTimes(1);
        });

        it('should render Spinner when authentication fails', async () => {
            mockUseAuth.mockReturnValue([{ token: 'invalid-token' }, jest.fn()]);
            mockedAxios.get.mockResolvedValueOnce({
                data: { ok: false }
            });

            renderPrivateRoute();

            // Initially shows spinner
            expect(screen.getByTestId('spinner')).toBeInTheDocument();

            // Wait for API call to complete
            await waitFor(() => {
                expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/auth/user-auth');
            });

            // Should still show spinner after failed auth
            expect(screen.getByTestId('spinner')).toBeInTheDocument();
            expect(screen.queryByTestId('outlet')).not.toBeInTheDocument();
        });
    });

    describe('error handling', () => {
        it('should render Spinner when API call fails with error', async () => {
            mockUseAuth.mockReturnValue([{ token: 'valid-token' }, jest.fn()]);
            const error = new Error('Error');
            mockedAxios.get.mockRejectedValueOnce(error);

            renderPrivateRoute();

            // Initially shows spinner
            expect(screen.getByTestId('spinner')).toBeInTheDocument();

            // Wait for API call to fail
            await waitFor(() => {
                expect(mockedAxios.get).toHaveBeenCalled();
            });

            // Should still show spinner after error
            expect(screen.getByTestId('spinner')).toBeInTheDocument();
            expect(screen.queryByTestId('outlet')).not.toBeInTheDocument();
            
            // Verify error was logged
            expect(consoleSpy).toHaveBeenCalledWith(
                'Auth check failed:',
                error
            );
        });
    });
});
