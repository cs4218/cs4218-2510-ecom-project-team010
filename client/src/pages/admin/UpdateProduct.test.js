import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import UpdateProduct from './UpdateProduct';

// Mock dependencies
jest.mock('axios');
jest.mock('react-hot-toast');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ slug: 'test-product' }),
}));

jest.mock('./../../components/Layout', () => ({ children, title }) => (
  <div data-testid="layout" title={title}>
    {children}
  </div>
));

jest.mock('./../../components/AdminMenu', () => () => (
  <div data-testid="admin-menu">Admin Menu</div>
));

// Mock data
const mockCategories = [
  { _id: 'cat1', name: 'Electronics' },
  { _id: 'cat2', name: 'Clothing' },
];

const mockProduct = {
  _id: 'prod1',
  name: 'Test Product',
  description: 'Test Description',
  price: 100,
  quantity: 10,
  shipping: '1',
  category: { _id: 'cat1', name: 'Electronics' },
};

const renderWithRouter = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

describe('UpdateProduct Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default axios mock responses
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/v1/product/get-product/')) {
        return Promise.resolve({ data: { product: mockProduct } });
      }
      if (url.includes('/api/v1/category/get-category')) {
        return Promise.resolve({
          data: { success: true, category: mockCategories },
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    // Mock toast methods
    toast.success = jest.fn();
    toast.error = jest.fn();
    
    // Mock window.confirm
    global.confirm = jest.fn().mockReturnValue(true);
    
    // Mock URL.createObjectURL
    global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders the component with correct title and layout', async () => {
      renderWithRouter(<UpdateProduct />);
      
      expect(screen.getByTestId('layout')).toHaveAttribute(
        'title',
        'Dashboard - Create Product'
      );
      expect(screen.getByTestId('admin-menu')).toBeInTheDocument();
      expect(screen.getByText('Update Product')).toBeInTheDocument();
    });

    it('renders all form fields', async () => {
      renderWithRouter(<UpdateProduct />);

      // Wait for data to load first
      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Product')).toBeInTheDocument();
      });

      expect(screen.getByDisplayValue('Test Product')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
      expect(screen.getByDisplayValue('100')).toBeInTheDocument();
      expect(screen.getByDisplayValue('10')).toBeInTheDocument();
      expect(screen.getByText('Upload Photo')).toBeInTheDocument();
      expect(screen.getByText('UPDATE PRODUCT')).toBeInTheDocument();
      expect(screen.getByText('DELETE PRODUCT')).toBeInTheDocument();
    });
  });

  describe('Data Fetching', () => {
    it('fetches and populates product data on mount', async () => {
      renderWithRouter(<UpdateProduct />);

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(
          '/api/v1/product/get-product/test-product'
        );
        expect(axios.get).toHaveBeenCalledWith(
          '/api/v1/category/get-category'
        );
      });

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Product')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
        expect(screen.getByDisplayValue('100')).toBeInTheDocument();
        expect(screen.getByDisplayValue('10')).toBeInTheDocument();
      });
    });

    it('handles error when fetching product data', async () => {
      axios.get.mockRejectedValueOnce(new Error('Network error'));
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      renderWithRouter(<UpdateProduct />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
      });

      consoleSpy.mockRestore();
    });

    it('handles error when fetching categories', async () => {
      axios.get.mockImplementation((url) => {
        if (url.includes('/api/v1/product/get-product/')) {
          return Promise.resolve({ data: { product: mockProduct } });
        }
        if (url.includes('/api/v1/category/get-category')) {
          return Promise.reject(new Error('Category fetch error'));
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      renderWithRouter(<UpdateProduct />);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Something went wrong in getting category'
        );
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Form Interactions', () => {
    it('updates form fields when user types', async () => {
      renderWithRouter(<UpdateProduct />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Product')).toBeInTheDocument();
      });

      const nameInput = screen.getByDisplayValue('Test Product');
      fireEvent.change(nameInput, { target: { value: 'Updated Product' } });
      expect(nameInput).toHaveValue('Updated Product');

      const priceInput = screen.getByDisplayValue('100');
      fireEvent.change(priceInput, { target: { value: '150' } });
      expect(priceInput).toHaveValue(150);
    });

    it('handles file upload', async () => {
      renderWithRouter(<UpdateProduct />);
      
      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText('Upload Photo')).toBeInTheDocument();
      });
      
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const fileInput = screen.getByText('Upload Photo').parentElement.querySelector('input[type="file"]');
      
      fireEvent.change(fileInput, { target: { files: [file] } });
      
      await waitFor(() => {
        expect(screen.getByText('test.jpg')).toBeInTheDocument();
      });
    });
  });

  describe('Product Update', () => {
    it('successfully updates product', async () => {
  axios.put.mockResolvedValueOnce({
    data: { success: true },
  });

  renderWithRouter(<UpdateProduct />);

  await waitFor(() => {
    expect(screen.getByDisplayValue('Test Product')).toBeInTheDocument();
  });

  const updateButton = screen.getByText('UPDATE PRODUCT');
  fireEvent.click(updateButton);

  await waitFor(() => {
    expect(axios.put).toHaveBeenCalledWith(
      '/api/v1/product/update-product/prod1',
      expect.any(FormData)
    );
    expect(toast.success).toHaveBeenCalledWith(
      'Product Updated Successfully'
    );
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard/admin/products');
  });
});

    it('handles update failure', async () => {
      axios.put.mockResolvedValueOnce({
        data: { success: false, message: 'Update failed' },
      });

      renderWithRouter(<UpdateProduct />);

      await waitFor(() => {
        expect(screen.getByText('UPDATE PRODUCT')).toBeInTheDocument();
      });

      const updateButton = screen.getByText('UPDATE PRODUCT');
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Update failed');
      });
    });

    it('handles update error', async () => {
      axios.put.mockRejectedValueOnce(new Error('Network error'));
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      renderWithRouter(<UpdateProduct />);

      await waitFor(() => {
        expect(screen.getByText('UPDATE PRODUCT')).toBeInTheDocument();
      });

      const updateButton = screen.getByText('UPDATE PRODUCT');
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('something went wrong');
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Product Deletion', () => {
    it('successfully deletes product with confirmation', async () => {
      global.confirm = jest.fn().mockReturnValue(true);
      axios.delete.mockResolvedValueOnce({
        data: { success: true },
      });

      renderWithRouter(<UpdateProduct />);

      // Wait for product data to load first (ensuring id is set)
      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Product')).toBeInTheDocument();
      });

      const deleteButton = screen.getByText('DELETE PRODUCT');
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(global.confirm).toHaveBeenCalledWith(
          'Are you sure you want to delete this product?'
        );
        expect(axios.delete).toHaveBeenCalledWith(
          '/api/v1/product/delete-product/prod1'
        );
        expect(toast.success).toHaveBeenCalledWith(
          'Product Deleted Successfully'
        );
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard/admin/products');
      });
    });

    it('cancels deletion when user clicks cancel', async () => {
      global.confirm = jest.fn().mockReturnValue(false);

      renderWithRouter(<UpdateProduct />);

      await waitFor(() => {
        expect(screen.getByText('DELETE PRODUCT')).toBeInTheDocument();
      });

      const deleteButton = screen.getByText('DELETE PRODUCT');
      fireEvent.click(deleteButton);

      expect(global.confirm).toHaveBeenCalledWith(
        'Are you sure you want to delete this product?'
      );
      expect(axios.delete).not.toHaveBeenCalled();
    });

    it('handles deletion error', async () => {
      global.confirm = jest.fn().mockReturnValue(true);
      axios.delete.mockRejectedValueOnce(new Error('Delete error'));
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      renderWithRouter(<UpdateProduct />);

      await waitFor(() => {
        expect(screen.getByText('DELETE PRODUCT')).toBeInTheDocument();
      });

      const deleteButton = screen.getByText('DELETE PRODUCT');
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Something went wrong when deleting product'
        );
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Image Display', () => {
    it('shows existing product image when no new photo is selected', async () => {
      renderWithRouter(<UpdateProduct />);

      await waitFor(() => {
        const img = screen.getByAltText('product_photo');
        expect(img).toHaveAttribute('src', '/api/v1/product/product-photo/prod1');
      });
    });

    it('shows preview of new photo when selected', async () => {
      renderWithRouter(<UpdateProduct />);

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText('Upload Photo')).toBeInTheDocument();
      });

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const fileInput = screen.getByText('Upload Photo').parentElement.querySelector('input[type="file"]');
      
      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        const img = screen.getByAltText('product_photo');
        expect(img).toHaveAttribute('src', 'blob:mock-url');
      });
    });
  });
});