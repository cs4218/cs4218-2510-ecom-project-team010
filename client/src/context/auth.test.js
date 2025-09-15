import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
// Important: Adjust the import path to match your project structure
import { AuthProvider, useAuth } from './auth';

// Mock axios to prevent real network calls and inspect its defaults
jest.mock('axios');

// A test component that consumes the context to display its state
const AuthTestConsumer = () => {
    const [auth, setAuth] = useAuth();

    const handleLogin = () => {
        // Use 'act' to wrap state updates in tests
        act(() => {
            setAuth({
                user: { name: 'Jane Doe', id: 'user-456' },
                token: 'new-test-token-456'
            });
        });
    };

    return (
        <div>
            <div data-testid="user-info">
                {auth.user ? `Logged in as ${auth.user.name}` : 'No User'}
            </div>
            <div data-testid="token-info">
                {auth.token ? `Token: ${auth.token}` : 'No Token'}
            </div>
            <button onClick={handleLogin}>Log In</button>
        </div>
    );
};

describe('AuthProvider and useAuth Hook', () => {

    beforeEach(() => {
        // Clear localStorage and reset axios mock before each test
        localStorage.clear();
        axios.defaults.headers.common['Authorization'] = undefined;
    });

    it('should initialize with a null user and no token', () => {
        render(
            <AuthProvider>
                <AuthTestConsumer />
            </AuthProvider>
        );

        expect(screen.getByTestId('user-info')).toHaveTextContent('No User');
        expect(screen.getByTestId('token-info')).toHaveTextContent('No Token');
    });

    it('should load and set auth state from localStorage on initial render', () => {
        const initialAuthData = {
            user: { name: 'John Doe', id: 'user-123' },
            token: 'test-token-from-storage-123',
        };
        localStorage.setItem('auth', JSON.stringify(initialAuthData));

        render(
            <AuthProvider>
                <AuthTestConsumer />
            </AuthProvider>
        );

        // Check if the state was hydrated from localStorage
        expect(screen.getByTestId('user-info')).toHaveTextContent('Logged in as John Doe');
        expect(screen.getByTestId('token-info')).toHaveTextContent(`Token: ${initialAuthData.token}`);
        
        // Check if the axios default header was set
        expect(axios.defaults.headers.common['Authorization']).toBe(initialAuthData.token);
    });
    
    it('should update the auth state and axios headers when setAuth is called', () => {
        render(
            <AuthProvider>
                <AuthTestConsumer />
            </AuthProvider>
        );

        // Verify initial state
        expect(screen.getByTestId('user-info')).toHaveTextContent('No User');
        // The header is set to the initial token value, which is an empty string.
        expect(axios.defaults.headers.common['Authorization']).toBe("");

        // Simulate a login by clicking the button in the consumer component
        const loginButton = screen.getByRole('button', { name: /log in/i });
        act(() => {
            loginButton.click();
        });

        // Verify that the state has been updated
        expect(screen.getByTestId('user-info')).toHaveTextContent('Logged in as Jane Doe');
        expect(screen.getByTestId('token-info')).toHaveTextContent('Token: new-test-token-456');

        // Verify that the axios header has also been updated
        expect(axios.defaults.headers.common['Authorization']).toBe('new-test-token-456');
    });

    it('should throw an error when useAuth is used outside of an AuthProvider', () => {
        // Suppress console.error for this test to keep the test output clean from React's error logging.
        const originalError = console.error;
        console.error = jest.fn();

        const ComponentWithoutProvider = () => {
            // This will throw a TypeError because useAuth() returns undefined,
            // and we try to destructure it.
            const [auth, setAuth] = useAuth();
            return <div>{auth?.user?.name}</div>;
        };

        // We expect the render function itself to throw the error.
        expect(() => render(<ComponentWithoutProvider />)).toThrow(
            TypeError
        );

        // Restore the original console.error function
        console.error = originalError;
    });
});

