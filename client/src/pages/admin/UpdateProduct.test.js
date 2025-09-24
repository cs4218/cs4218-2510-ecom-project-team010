import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import UpdateProduct from './UpdateProduct';

// Note: Some of these test cases are generated with the help of AI

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

const renderWithRouter = (ui) => {
    act(() => {
        render(<BrowserRouter>{ui}</BrowserRouter>);
    });
};

describe('When updating products', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        
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

        toast.success = jest.fn();
        toast.error = jest.fn();
        
        global.confirm = jest.fn().mockReturnValue(true);    
        global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('When the user navigates to the product form page', async () => {
        renderWithRouter(<UpdateProduct />);
        
        await waitFor(() => {
            expect(screen.getByTestId('layout')).toHaveAttribute(
                'title',
                'Dashboard - Create Product'
            );
        });
        expect(screen.getByTestId('admin-menu')).toBeInTheDocument();
        expect(screen.getByText('Update Product')).toBeInTheDocument();
    });

    test('When the user start the product form page', async () => {
        renderWithRouter(<UpdateProduct />);

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

    describe('Data Fetching', () => {
        test('When fetching product data on mount', async () => {
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

        test('When encountering error while fetching product data', async () => {
            axios.get.mockRejectedValueOnce(new Error('Network error'));
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

            renderWithRouter(<UpdateProduct />);

            await waitFor(() => {
                expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
            });

            consoleSpy.mockRestore();
        });

        test('When handling the error during fetching categories', async () => {
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

    describe('Given that user has a new product update', () => {
        test('When the user enters input to the form fields', async () => {
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

        test('When the user uploads a file', async () => {
            renderWithRouter(<UpdateProduct />);
            
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

    describe('Given that a user triggered a product update', () => {
        test('When product is updated successfully', async () => {
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

        test('When product update is unsuccessful', async () => {
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

        test('When encountering network error during product update', async () => {
            // Arrange
            axios.put.mockRejectedValueOnce(new Error('Network error'));
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

            renderWithRouter(<UpdateProduct />);

            await waitFor(() => {
                expect(screen.getByText('UPDATE PRODUCT')).toBeInTheDocument();
            });
            
            // Act
            const updateButton = screen.getByText('UPDATE PRODUCT');
            fireEvent.click(updateButton);

            // Assert
            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('Something went wrong in updating the product');
            });

            consoleSpy.mockRestore();
        });
    });

    describe('Given that a user triggered a product deletion', () => {
        test('When the product is deleted successfully', async () => {
            // Arrange
            global.confirm = jest.fn().mockReturnValue(true);
            axios.delete.mockResolvedValueOnce({
                data: { success: true },
            });

            renderWithRouter(<UpdateProduct />);

            await waitFor(() => {
                expect(screen.getByDisplayValue('Test Product')).toBeInTheDocument();
            });

            // Act
            const deleteButton = screen.getByText('DELETE PRODUCT');
            fireEvent.click(deleteButton);

            // Assert
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

        test('When the product deletion is cancelled', async () => {
            // Arrange
            global.confirm = jest.fn().mockReturnValue(false);

            renderWithRouter(<UpdateProduct />);

            await waitFor(() => {
                expect(screen.getByText('DELETE PRODUCT')).toBeInTheDocument();
            });

            // Act
            const deleteButton = screen.getByText('DELETE PRODUCT');
            fireEvent.click(deleteButton);

            // Assert
            expect(global.confirm).toHaveBeenCalledWith(
                'Are you sure you want to delete this product?'
            );
            expect(axios.delete).not.toHaveBeenCalled();
        });

        test('When an error is encountered during deletion', async () => {
            // Arrange
            global.confirm = jest.fn().mockReturnValue(true);
            axios.delete.mockRejectedValueOnce(new Error('Delete error'));
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

            renderWithRouter(<UpdateProduct />);

            await waitFor(() => {
                expect(screen.getByText('DELETE PRODUCT')).toBeInTheDocument();
            });

            // Act
            const deleteButton = screen.getByText('DELETE PRODUCT');
            fireEvent.click(deleteButton);

            // Assert
            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith(
                    'Something went wrong when deleting product'
                );
            });

            consoleSpy.mockRestore();
        });
    });

    describe('When uploading a product image', () => {
        test('When no new photo is selected', async () => {
            renderWithRouter(<UpdateProduct />);

            await waitFor(() => {
                const img = screen.getByAltText('product_photo');
                expect(img).toHaveAttribute('src', '/api/v1/product/product-photo/prod1');
            });
        });

        test('When new photo is selected', async () => {
            // Arrange
            renderWithRouter(<UpdateProduct />);

            await waitFor(() => {
                expect(screen.getByText('Upload Photo')).toBeInTheDocument();
            });

            const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
            const fileInput = screen.getByText('Upload Photo').parentElement.querySelector('input[type="file"]');
            
            // Act
            fireEvent.change(fileInput, { target: { files: [file] } });

            // Assert
            await waitFor(() => {
                const img = screen.getByAltText('product_photo');
                expect(img).toHaveAttribute('src', 'blob:mock-url');
            });
        });
    });
});