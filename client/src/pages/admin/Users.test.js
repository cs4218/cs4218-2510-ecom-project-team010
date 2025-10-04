import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Users from './Users';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// Mock dependencies
jest.mock('axios');
jest.mock('react-hot-toast');
jest.mock('../../components/Layout', () => ({
    __esModule: true,
    default: ({ children, title }) => (
        <div data-testid="layout" data-title={title}>
            {children}
        </div>
    ),
}));
jest.mock('../../components/AdminMenu', () => ({
    __esModule: true,
    default: () => <div data-testid="admin-menu">Admin Menu</div>,
}));

const mockedAxios = axios;

describe('Users Component', () => {
    const mockUsers = [
        {
            _id: 'user1',
            name: 'John Doe',
            email: 'john@example.com',
            phone: '1234567890',
            address: '123 Main St',
            role: 0,
            createdAt: '2024-01-15T10:30:00.000Z'
        },
        {
            _id: 'user2',
            name: 'Jane Smith',
            email: 'jane@example.com',
            phone: '0987654321',
            address: '456 Oak Ave',
            role: 0,
            createdAt: '2024-01-10T08:20:00.000Z'
        },
        {
            _id: 'user3',
            name: 'Bob Johnson',
            email: 'bob@example.com',
            phone: '5555555555',
            address: '789 Chicago Road',
            role: 1, 
            createdAt: '2024-01-20T14:45:00.000Z'
        }
    ];

    let consoleSpy;

    beforeEach(() => {
        jest.clearAllMocks();
        consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        consoleSpy.mockRestore();
    });

    const renderUsers = () => {
        return render(
            <BrowserRouter>
                <Users />
            </BrowserRouter>
        );
    };

    describe('Component Rendering', () => {
        it('should render Users component with layout and title', async () => {
            mockedAxios.get.mockResolvedValueOnce({
                data: { success: true, users: mockUsers }
            });

            renderUsers();

            const layout = screen.getByTestId('layout');
            expect(layout).toBeInTheDocument();
            expect(layout).toHaveAttribute('data-title', 'Dashboard - All Users');
        });

        it('should render AdminMenu component', async () => {
            mockedAxios.get.mockResolvedValueOnce({
                data: { success: true, users: mockUsers }
            });

            renderUsers();

            expect(screen.getByTestId('admin-menu')).toBeInTheDocument();
        });

        it('should render page heading', async () => {
            mockedAxios.get.mockResolvedValueOnce({
                data: { success: true, users: mockUsers }
            });

            renderUsers();

            expect(screen.getByText('All Users')).toBeInTheDocument();
        });
    });

    describe('Loading State', () => {
        it('should show loading spinner initially', () => {
            mockedAxios.get.mockImplementation(() => new Promise(() => { })); // Never resolves

            renderUsers();

            expect(screen.getByRole('status')).toBeInTheDocument();
            expect(screen.getByText('Loading...')).toBeInTheDocument();
        });

        it('should hide loading spinner after data is fetched', async () => {
            mockedAxios.get.mockResolvedValueOnce({
                data: { success: true, users: mockUsers }
            });

            renderUsers();

            expect(screen.getByRole('status')).toBeInTheDocument();

            await waitFor(() => {
                expect(screen.queryByRole('status')).not.toBeInTheDocument();
            });
        });

        it('should hide loading spinner after error', async () => {
            mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));

            renderUsers();

            expect(screen.getByRole('status')).toBeInTheDocument();

            await waitFor(() => {
                expect(screen.queryByRole('status')).not.toBeInTheDocument();
            });
        });
    });

    describe('Data Fetching', () => {
        it('should fetch users on component mount', async () => {
            mockedAxios.get.mockResolvedValueOnce({
                data: { success: true, users: mockUsers }
            });

            renderUsers();

            await waitFor(() => {
                expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/auth/all-users');
                expect(mockedAxios.get).toHaveBeenCalledTimes(1);
            });
        });

        it('should display users in table after successful fetch', async () => {
            mockedAxios.get.mockResolvedValueOnce({
                data: { success: true, users: mockUsers }
            });

            renderUsers();

            await waitFor(() => {
                expect(screen.getByText('John Doe')).toBeInTheDocument();
                expect(screen.getByText('john@example.com')).toBeInTheDocument();
                expect(screen.getByText('Jane Smith')).toBeInTheDocument();
                expect(screen.getByText('jane@example.com')).toBeInTheDocument();
            });
        });

        it('should display user phone numbers', async () => {
            mockedAxios.get.mockResolvedValueOnce({
                data: { success: true, users: mockUsers }
            });

            renderUsers();

            await waitFor(() => {
                expect(screen.getByText('1234567890')).toBeInTheDocument();
                expect(screen.getByText('0987654321')).toBeInTheDocument();
            });
        });

        it('should display user addresses', async () => {
            mockedAxios.get.mockResolvedValueOnce({
                data: { success: true, users: mockUsers }
            });

            renderUsers();

            await waitFor(() => {
                expect(screen.getByText('123 Main St')).toBeInTheDocument();
                expect(screen.getByText('456 Oak Ave')).toBeInTheDocument();
                expect(screen.getByText('789 Chicago Road')).toBeInTheDocument();
            });
        });
    });

    describe('User Roles Display', () => {
        it('should display Admin badge for admin role (string)', async () => {
            mockedAxios.get.mockResolvedValueOnce({
                data: { success: true, users: mockUsers }
            });

            renderUsers();

            await waitFor(() => {
                const adminBadges = screen.getAllByText('Admin');
                expect(adminBadges.length).toBeGreaterThan(0);
            });
        });

        it('should display Admin badge for role 1', async () => {
            mockedAxios.get.mockResolvedValueOnce({
                data: { success: true, users: mockUsers }
            });

            renderUsers();

            await waitFor(() => {
                const adminBadges = screen.getAllByText('Admin');
                expect(adminBadges.length).toBe(1); 
            });
        });

        it('should display User badge for user role', async () => {
            mockedAxios.get.mockResolvedValueOnce({
                data: { success: true, users: mockUsers }
            });

            renderUsers();

            await waitFor(() => {
                const userBadges = screen.getAllByText('User');
                expect(userBadges.length).toBe(2); 
            });
        });

        it('should apply correct CSS class to admin badges', async () => {
            mockedAxios.get.mockResolvedValueOnce({
                data: { success: true, users: mockUsers }
            });

            renderUsers();

            await waitFor(() => {
                const adminBadges = screen.getAllByText('Admin');
                adminBadges.forEach(badge => {
                    expect(badge).toHaveClass('badge', 'bg-success');
                });
            });
        });

        it('should apply correct CSS class to user badges', async () => {
            mockedAxios.get.mockResolvedValueOnce({
                data: { success: true, users: mockUsers }
            });

            renderUsers();

            await waitFor(() => {
                const userBadge = screen.getAllByText('User');
                userBadge.forEach(badge => {
                    expect(badge).toHaveClass('badge', 'bg-primary');
                });
            });
        });
    });

    describe('Date Formatting', () => {
        it('should display formatted creation dates', async () => {
            mockedAxios.get.mockResolvedValueOnce({
                data: { success: true, users: mockUsers }
            });

            renderUsers();

            await waitFor(() => {
                // Dates will be formatted based on locale
                const dateElements = screen.getAllByText(/\d{1,2}\/\d{1,2}\/\d{4}/);
                expect(dateElements.length).toBeGreaterThan(0);
            });
        });
    });

    describe('Empty State', () => {
        it('should display "No users found" message when users array is empty', async () => {
            mockedAxios.get.mockResolvedValueOnce({
                data: { success: true, users: [] }
            });

            renderUsers();

            await waitFor(() => {
                expect(screen.getByText('No users found')).toBeInTheDocument();
            });
        });

        it('should not display table rows when no users', async () => {
            mockedAxios.get.mockResolvedValueOnce({
                data: { success: true, users: [] }
            });

            renderUsers();

            await waitFor(() => {
                const tableRows = screen.queryAllByRole('row');
                // Only header row + empty state row
                expect(tableRows.length).toBe(2);
            });
        });
    });

    describe('Error Handling', () => {
        it('should handle API error and show toast', async () => {
            const error = new Error('Network Error');
            mockedAxios.get.mockRejectedValueOnce(error);

            renderUsers();

            await waitFor(() => {
                expect(consoleSpy).toHaveBeenCalledWith(error);
                expect(toast.error).toHaveBeenCalledWith(
                    'Something went wrong in getting users'
                );
            });
        });

        it('should display empty state after error', async () => {
            mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));

            renderUsers();

            await waitFor(() => {
                expect(screen.getByText('No users found')).toBeInTheDocument();
            });
        });

        it('should handle 500 error', async () => {
            const error = {
                response: {
                    status: 500,
                    data: { message: 'Internal Server Error' }
                }
            };
            mockedAxios.get.mockRejectedValueOnce(error);

            renderUsers();

            await waitFor(() => {
                expect(consoleSpy).toHaveBeenCalled();
                expect(toast.error).toHaveBeenCalled();
            });
        });

        it('should handle 401 unauthorized error', async () => {
            const error = {
                response: {
                    status: 401,
                    data: { message: 'Unauthorized' }
                }
            };
            mockedAxios.get.mockRejectedValueOnce(error);

            renderUsers();

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith(
                    'Something went wrong in getting users'
                );
            });
        });

        it('should handle timeout error', async () => {
            const timeoutError = new Error('timeout of 5000ms exceeded');
            timeoutError.code = 'ECONNABORTED';
            mockedAxios.get.mockRejectedValueOnce(timeoutError);

            renderUsers();

            await waitFor(() => {
                expect(consoleSpy).toHaveBeenCalledWith(timeoutError);
                expect(toast.error).toHaveBeenCalled();
            });
        });
    });

    describe('Table Structure', () => {
        it('should render table headers correctly', async () => {
            mockedAxios.get.mockResolvedValueOnce({
                data: { success: true, users: mockUsers }
            });

            renderUsers();

            await waitFor(() => {
                expect(screen.getByText('#')).toBeInTheDocument();
                expect(screen.getByText('Name')).toBeInTheDocument();
                expect(screen.getByText('Email')).toBeInTheDocument();
                expect(screen.getByText('Phone')).toBeInTheDocument();
                expect(screen.getByText('Address')).toBeInTheDocument();
                expect(screen.getByText('Role')).toBeInTheDocument();
                expect(screen.getByText('Created At')).toBeInTheDocument();
            });
        });

        it('should display correct serial numbers', async () => {
            mockedAxios.get.mockResolvedValueOnce({
                data: { success: true, users: mockUsers }
            });

            renderUsers();

            await waitFor(() => {
                const cells = screen.getAllByRole('cell');
                const serialNumbers = cells.filter(cell =>
                    ['1', '2', '3'].includes(cell.textContent)
                );
                expect(serialNumbers.length).toBeGreaterThanOrEqual(3);
            });
        });

        it('should render responsive table', async () => {
            mockedAxios.get.mockResolvedValueOnce({
                data: { success: true, users: mockUsers }
            });

            const { container } = renderUsers();

            await waitFor(() => {
                const tableResponsive = container.querySelector('.table-responsive');
                expect(tableResponsive).toBeInTheDocument();
            });
        });

        it('should apply Bootstrap table classes', async () => {
            mockedAxios.get.mockResolvedValueOnce({
                data: { success: true, users: mockUsers }
            });

            const { container } = renderUsers();

            await waitFor(() => {
                const table = container.querySelector('table');
                expect(table).toHaveClass('table', 'table-striped', 'table-bordered');
            });
        });
    });

    describe('Edge Cases', () => {
        it('should handle null users data', async () => {
            mockedAxios.get.mockResolvedValueOnce({
                data: { success: true, users: null }
            });

            renderUsers();

            await waitFor(() => {
                expect(screen.getByText('No users found')).toBeInTheDocument();
            });
        });

        it('should handle undefined users data', async () => {
            mockedAxios.get.mockResolvedValueOnce({
                data: { success: true }
            });

            renderUsers();

            await waitFor(() => {
                expect(screen.getByText('No users found')).toBeInTheDocument();
            });
        });

        it('should handle success: false response', async () => {
            mockedAxios.get.mockResolvedValueOnce({
                data: { success: false, users: [] }
            });

            renderUsers();

            await waitFor(() => {
                expect(screen.getByText('No users found')).toBeInTheDocument();
            });
        });

        it('should handle malformed API response', async () => {
            mockedAxios.get.mockResolvedValueOnce({
                data: {}
            });

            renderUsers();

            await waitFor(() => {
                expect(screen.getByText('No users found')).toBeInTheDocument();
            });
        });

        it('should handle user with missing fields', async () => {
            const incompleteUser = {
                _id: 'user4',
                name: 'Incomplete User',
                email: 'incomplete@example.com'
                // Missing phone, address, role, createdAt
            };

            mockedAxios.get.mockResolvedValueOnce({
                data: { success: true, users: [incompleteUser] }
            });

            renderUsers();

            await waitFor(() => {
                expect(screen.getByText('Incomplete User')).toBeInTheDocument();
                expect(screen.getByText('incomplete@example.com')).toBeInTheDocument();
            });
        });

        it('should handle very long user names', async () => {
            const longNameUser = {
                ...mockUsers[0],
                name: 'Very Long Name That Might Overflow The Table Cell Width'
            };

            mockedAxios.get.mockResolvedValueOnce({
                data: { success: true, users: [longNameUser] }
            });

            renderUsers();

            await waitFor(() => {
                expect(screen.getByText(longNameUser.name)).toBeInTheDocument();
            });
        });

        it('should handle special characters in user data', async () => {
            const specialCharUser = {
                ...mockUsers[0],
                name: "O'Brien & Sons <script>",
                email: 'special+chars@example.com'
            };

            mockedAxios.get.mockResolvedValueOnce({
                data: { success: true, users: [specialCharUser] }
            });

            renderUsers();

            await waitFor(() => {
                expect(screen.getByText("O'Brien & Sons <script>")).toBeInTheDocument();
            });
        });
    });

    describe('Component Lifecycle', () => {
        it('should only fetch users once on mount', async () => {
            mockedAxios.get.mockResolvedValue({
                data: { success: true, users: mockUsers }
            });

            const { rerender } = renderUsers();

            await waitFor(() => {
                expect(mockedAxios.get).toHaveBeenCalledTimes(1);
            });

            // Rerender component
            rerender(
                <BrowserRouter>
                    <Users />
                </BrowserRouter>
            );

            // Should still be called only once
            expect(mockedAxios.get).toHaveBeenCalledTimes(1);
        });

        it('should not update state after unmount', async () => {
            let resolveRequest;
            const requestPromise = new Promise((resolve) => {
                resolveRequest = resolve;
            });

            mockedAxios.get.mockReturnValue(requestPromise);

            const { unmount } = renderUsers();

            unmount();

            // Resolve after unmount
            resolveRequest({ data: { success: true, users: mockUsers } });

            await new Promise(resolve => setTimeout(resolve, 100));

            // No errors should be thrown
            expect(consoleSpy).not.toHaveBeenCalled();
        });
    });
});