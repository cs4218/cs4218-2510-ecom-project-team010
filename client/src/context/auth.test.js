import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import { AuthProvider, useAuth } from './auth';

// Mock axios to prevent real network calls
jest.mock('axios');

// Test component to consume and display auth context
const AuthTestConsumer = () => {
    const [auth, setAuth] = useAuth();
    return (
        <div>
            <div data-testid="user-info">{auth?.user ? `User: ${auth.user.name}` : 'No User'}</div>
            <div data-testid="token-info">{auth?.token ? `Token: ${auth.token}` : 'No Token'}</div>
            <button onClick={() => setAuth({ user: { name: 'Jane Doe' }, token: 'new-token' })}>
                Login
            </button>
        </div>
    );
};

describe('Given the AuthProvider', () => {
    beforeEach(() => {
        // Clear mocks and localStorage before each test
        localStorage.clear();
        axios.defaults.headers.common['Authorization'] = undefined;
    });

    describe('When it is rendered without initial data', () => {
        it('Then it should initialize with a null user and no token', () => {
            // When
            render(
                <AuthProvider>
                    <AuthTestConsumer />
                </AuthProvider>
            );

            // Then
            expect(screen.getByTestId('user-info')).toHaveTextContent('No User');
            expect(screen.getByTestId('token-info')).toHaveTextContent('No Token');
            expect(axios.defaults.headers.common['Authorization']).toBe('');
        });
    });

    describe('When localStorage contains auth data', () => {
        it('Then it should load the state from localStorage on initial render', () => {
            // Given
            const initialAuth = { user: { name: 'John Doe' }, token: 'stored-token' };
            localStorage.setItem('auth', JSON.stringify(initialAuth));

            // When
            render(
                <AuthProvider>
                    <AuthTestConsumer />
                </AuthProvider>
            );

            // Then
            expect(screen.getByTestId('user-info')).toHaveTextContent('User: John Doe');
            expect(screen.getByTestId('token-info')).toHaveTextContent('Token: stored-token');
            expect(axios.defaults.headers.common['Authorization']).toBe('stored-token');
        });
    });

    describe('When the setAuth function is called', () => {
        it('Then it should update the auth state, localStorage, and axios headers', () => {
            // Given
            render(
                <AuthProvider>
                    <AuthTestConsumer />
                </AuthProvider>
            );
            const loginButton = screen.getByRole('button', { name: /login/i });

            // When
            act(() => {
                loginButton.click();
            });

            // Then
            expect(screen.getByTestId('user-info')).toHaveTextContent('User: Jane Doe');
            expect(screen.getByTestId('token-info')).toHaveTextContent('Token: new-token');
            expect(axios.defaults.headers.common['Authorization']).toBe('new-token');
            expect(localStorage.getItem('auth')).toBe(JSON.stringify({ user: { name: 'Jane Doe' }, token: 'new-token' }));
        });
    });

    describe('When useAuth is called outside of an AuthProvider', () => {
        it('Then it should throw an error', () => {
            // Given
            // Suppress console.error for this test to avoid polluting the output
            const originalError = console.error;
            console.error = jest.fn();

            // When & Then
            expect(() => render(<AuthTestConsumer />)).toThrow(
                "undefined is not iterable (cannot read property Symbol(Symbol.iterator))"
            );

            // Restore console.error
            console.error = originalError;
        });
    });
});

