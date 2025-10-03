import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import { useAuth } from '../../context/auth';
import Orders from './Orders';

// Mock dependencies
jest.mock('axios');
jest.mock('../../context/auth', () => ({
  useAuth: jest.fn(),
}));
jest.mock('../../components/Layout', () => ({ children }) => <div>{children}</div>);
jest.mock('../../components/UserMenu', () => () => <div>User Menu</div>);
jest.mock('moment', () => () => ({
    fromNow: () => 'a few seconds ago'
}));


describe('Given the Orders page', () => {
  const mockAuth = {
    auth: { token: 'fake-jwt-token' },
    setAuth: jest.fn(),
  };

  const mockOrders = [
    {
      _id: 'order1',
      status: 'Delivered',
      buyer: { name: 'John Doe' },
      createAt: new Date().toISOString(),
      payment: { success: true }, // Covers the 'Success' path
      products: [
        { _id: 'prod1', name: 'Product A', description: 'Description for A', price: 100 },
        { _id: 'prod2', name: 'Product B', description: 'Description for B', price: 200 },
      ],
    },
    {
      _id: 'order2',
      status: 'Cancelled',
      buyer: { name: 'Jane Smith' },
      createAt: new Date().toISOString(),
      payment: { success: false }, // Covers the 'Failed' path
      products: [], // Covers the empty products array path
    },
  ];

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    useAuth.mockReturnValue([mockAuth.auth, mockAuth.setAuth]);
  });

  describe('When an authenticated user has orders', () => {
    it('Then it should fetch and display the list of orders with all data variations', async () => {
      // Given
      axios.get.mockResolvedValue({ data: mockOrders });

      // When
      render(<Orders />);

      // Then
      await waitFor(() => {
        // Check for details from the first order (successful payment, with products)
        expect(screen.getByText('Delivered')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Success')).toBeInTheDocument();
        expect(screen.getByText('Product A')).toBeInTheDocument();
        
        // Check for details from the second order (failed payment, no products)
        expect(screen.getByText('Cancelled')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('Failed')).toBeInTheDocument();
      });

      // Verify axios was called correctly
      expect(axios.get).toHaveBeenCalledWith('/api/v1/auth/orders');
    });
  });

  describe('When an authenticated user has no orders', () => {
    it('Then it should display the title but no order details', async () => {
      // Given
      axios.get.mockResolvedValue({ data: [] });

      // When
      render(<Orders />);

      // Then
      await waitFor(() => {
        expect(screen.getByText('All Orders')).toBeInTheDocument();
      });

      // Ensure no order-specific details are rendered
      expect(screen.queryByText('Status')).not.toBeInTheDocument();
      expect(screen.queryByText('Buyer')).not.toBeInTheDocument();
    });
  });

  describe('When a user is not authenticated', () => {
    it('Then it should not attempt to fetch orders', () => {
      // Given
      useAuth.mockReturnValue([{ token: null }, jest.fn()]);

      // When
      render(<Orders />);

      // Then
      expect(axios.get).not.toHaveBeenCalled();
      expect(screen.getByText('All Orders')).toBeInTheDocument();
      expect(screen.queryByText('Status')).not.toBeInTheDocument();
    });
  });

  describe('When fetching orders results in an error', () => {
    it('Then it should log the error and display no orders', async () => {
        // Given
        const consoleSpy = jest.spyOn(console, 'log');
        axios.get.mockRejectedValue(new Error('Network Error'));

        // When
        render(<Orders />);

        // Then
        await waitFor(() => {
            // The component should gracefully handle the error and not crash
            expect(screen.getByText('All Orders')).toBeInTheDocument();
            expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
        });

        // No orders should be displayed
        expect(screen.queryByText('Status')).not.toBeInTheDocument();
    });
  });
});

