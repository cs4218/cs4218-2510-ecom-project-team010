import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import HomePage from './HomePage';
import { useCart } from '../context/cart';

// Mock dependencies
jest.mock('axios');
jest.mock('react-hot-toast');
jest.mock('../context/cart');

// Create mock navigate function
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate
}));

// Mock components
jest.mock('../components/Prices', () => ({
    Prices: [
        { _id: '1', name: '$0 to $19', array: [0, 19] },
        { _id: '2', name: '$20 to $39', array: [20, 39] },
        { _id: '3', name: '$40 to $59', array: [40, 59] }
    ]
}));

jest.mock('./../components/Layout', () => {
    return function MockLayout({ title, children }) {
        return (
            <div data-testid="layout">
                <div data-testid="layout-title">{title}</div>
                {children}
            </div>
        );
    };
});

jest.mock('react-icons/ai', () => ({
    AiOutlineReload: () => <span data-testid="reload-icon">Reload</span>
}));

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true
});

// Mock window.location.reload
const mockReload = jest.fn();
Object.defineProperty(window, 'location', {
    value: { reload: mockReload },
    writable: true
});

const mockedAxios = axios;
const mockToast = toast;
const mockUseCart = useCart;

// Mock data
const mockCategories = [
    { _id: 'cat1', name: 'Electronics' },
    { _id: 'cat2', name: 'Clothing' },
    { _id: 'cat3', name: 'Books' }
];

const mockProducts = [
    {
        _id: 'prod1',
        name: 'Laptop',
        slug: 'laptop',
        price: 999.99,
        description: 'High-performance laptop for professionals and gamers alike'
    },
    {
        _id: 'prod2',
        name: 'T-Shirt',
        slug: 't-shirt',
        price: 19.99,
        description: 'Comfortable cotton t-shirt available in multiple colors and sizes'
    }
];

describe('HomePage', () => {
    const mockSetCart = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseCart.mockReturnValue([[], mockSetCart]);

        // Reset localStorage mock
        localStorageMock.setItem.mockClear();
        localStorageMock.getItem.mockClear();

        // Setup default axios responses
        mockedAxios.get.mockImplementation((url) => {
            if (url.includes('/category/get-category')) {
                return Promise.resolve({
                    data: { success: true, category: mockCategories }
                });
            }
            if (url.includes('/product/product-count')) {
                return Promise.resolve({
                    data: { total: 10 }
                });
            }
            if (url.includes('/product/product-list')) {
                return Promise.resolve({
                    data: { products: mockProducts }
                });
            }
            return Promise.reject(new Error('Unknown endpoint'));
        });
    });

    const renderHomePage = () => {
        return render(
            <MemoryRouter>
                <HomePage />
            </MemoryRouter>
        );
    };

    describe('Initial Rendering', () => {
        it('should render layout with correct title', async () => {
            renderHomePage();

            const titleNode = await screen.findByTestId('layout-title');
            expect(titleNode).toHaveTextContent('ALL Products - Best offers');
        });

        it('should render banner image', async () => {
            renderHomePage();

            const bannerImage = await screen.findByAltText('bannerimage');
            expect(bannerImage).toBeInTheDocument();
            expect(bannerImage).toHaveAttribute('src', '/images/Virtual.png');
            expect(bannerImage).toHaveAttribute('width', '100%');
        });

        it('should render filter sections', async () => {
            renderHomePage();

            await waitFor(() => {
                expect(screen.getByText('Filter By Category')).toBeInTheDocument();
                expect(screen.getByText('Filter By Price')).toBeInTheDocument();
                expect(screen.getByText('All Products')).toBeInTheDocument();
            });
        });

        it('should render reset filters button', async () => {
            renderHomePage();

            const resetButton = await screen.findByText('RESET FILTERS');
            expect(resetButton).toBeInTheDocument();
            expect(resetButton).toHaveClass('btn', 'btn-danger');
        });
    });

    describe('API Calls on Mount', () => {
        it('should fetch categories on mount', async () => {
            renderHomePage();

            await waitFor(() => {
                expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/category/get-category');
            });
        });

        it('should fetch total product count on mount', async () => {
            renderHomePage();

            await waitFor(() => {
                expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/product/product-count');
            });
        });

        it('should fetch products when no filters are applied', async () => {
            renderHomePage();

            await waitFor(() => {
                expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/product/product-list/1');
            });
        });
    });

    describe('Categories Display', () => {
        it('should display category checkboxes', async () => {
            renderHomePage();

            await waitFor(() => {
                expect(screen.getByLabelText('Electronics')).toBeInTheDocument();
                expect(screen.getByLabelText('Clothing')).toBeInTheDocument();
                expect(screen.getByLabelText('Books')).toBeInTheDocument();
            });
        });

        it('should handle API error when fetching categories', async () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
            mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

            renderHomePage();

            await waitFor(() => {
                expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
            });

            consoleSpy.mockRestore();
        });
    });

    describe('Price Filters', () => {
        it('should display price filter options', async () => {
            renderHomePage();

            expect(await screen.findByText('$0 to $19')).toBeInTheDocument();
            expect(await screen.findByText('$20 to $39')).toBeInTheDocument();
            expect(await screen.findByText('$40 to $59')).toBeInTheDocument();
        });

        it('should handle price filter selection', async () => {
            mockedAxios.post.mockResolvedValueOnce({
                data: { products: [mockProducts[0]] }
            });

            renderHomePage();

            await waitFor(() => {
                const priceOption = screen.getByText('$0 to $19');
                fireEvent.click(priceOption);
            });

            await waitFor(() => {
                expect(mockedAxios.post).toHaveBeenCalledWith(
                    '/api/v1/product/product-filters',
                    { checked: [], radio: [0, 19] }
                );
            });
        });
    });

    describe('Products Display', () => {
        it('should display products after loading', async () => {
            renderHomePage();

            expect(await screen.findByText('Laptop')).toBeInTheDocument();
            expect(await screen.findByText('T-Shirt')).toBeInTheDocument();
        });

        it('should display product prices in USD format', async () => {
            renderHomePage();

            expect(await screen.findByText('$999.99')).toBeInTheDocument();
            expect(await screen.findByText('$19.99')).toBeInTheDocument();
        });

        it('should display truncated product descriptions', async () => {
            renderHomePage();

            expect(await screen.findByText(/High-performance laptop for professionals and gamers alike/i)).toBeInTheDocument();
            expect(await screen.findByText(/Comfortable cotton t-shirt available in multiple colors and.../i)).toBeInTheDocument();
        });

        it('should display product images', async () => {
            renderHomePage();

            const laptopImage = await screen.findByAltText('Laptop');
            const tshirtImage = await screen.findByAltText('T-Shirt');

            expect(laptopImage).toHaveAttribute('src', '/api/v1/product/product-photo/prod1');
            expect(tshirtImage).toHaveAttribute('src', '/api/v1/product/product-photo/prod2');
        });
    });

    describe('Product Actions', () => {
        it('should navigate to product details on More Details click', async () => {
            renderHomePage();

            await waitFor(() => {
                const detailsButtons = screen.getAllByText('More Details');
                fireEvent.click(detailsButtons[0]);
            });

            expect(mockNavigate).toHaveBeenCalledWith('/product/laptop');
        });

        it('should add product to cart on ADD TO CART click', async () => {
            const mockCart = [];
            mockUseCart.mockReturnValue([mockCart, mockSetCart]);

            renderHomePage();

            await waitFor(() => {
                const addToCartButtons = screen.getAllByText('ADD TO CART');
                fireEvent.click(addToCartButtons[0]);
            });

            expect(mockSetCart).toHaveBeenCalledWith([mockProducts[0]]);
            expect(localStorageMock.setItem).toHaveBeenCalledWith(
                'cart',
                JSON.stringify([mockProducts[0]])
            );
            expect(mockToast.success).toHaveBeenCalledWith('Item Added to cart');
        });

        it('should add multiple products to existing cart', async () => {
            const existingCart = [mockProducts[0]];
            mockUseCart.mockReturnValue([existingCart, mockSetCart]);

            renderHomePage();

            await waitFor(() => {
                const addToCartButtons = screen.getAllByText('ADD TO CART');
                fireEvent.click(addToCartButtons[1]); // Add second product
            });

            expect(mockSetCart).toHaveBeenCalledWith([...existingCart, mockProducts[1]]);
        });
    });

    describe('Category Filtering', () => {
        it('should filter products by category', async () => {
            mockedAxios.post.mockResolvedValueOnce({
                data: { products: [mockProducts[0]] }
            });

            renderHomePage();

            await waitFor(() => {
                const electronicsCheckbox = screen.getByLabelText('Electronics');
                fireEvent.click(electronicsCheckbox);
            });

            await waitFor(() => {
                expect(mockedAxios.post).toHaveBeenCalledWith(
                    '/api/v1/product/product-filters',
                    { checked: ['cat1'], radio: [] }
                );
            });
        });

        it('should uncheck category filter', async () => {
            renderHomePage();

            await waitFor(() => {
                const electronicsCheckbox = screen.getByLabelText('Electronics');

                // Check first
                fireEvent.click(electronicsCheckbox);
                // Then uncheck
                fireEvent.click(electronicsCheckbox);
            });

            // Should call getAllProducts when no filters are active
            await waitFor(() => {
                expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/product/product-list/1');
            });
        });
    });

    describe('Load More Functionality', () => {
        it('should show load more button when products < total', async () => {
            mockedAxios.get.mockImplementation((url) => {
                if (url.includes('/product/product-count')) {
                    return Promise.resolve({ data: { total: 10 } });
                }
                if (url.includes('/product/product-list')) {
                    return Promise.resolve({ data: { products: mockProducts } });
                }
                return Promise.resolve({ data: { success: true, category: mockCategories } });
            });

            renderHomePage();

            await waitFor(() => {
                expect(screen.getByText('Loadmore')).toBeInTheDocument();
                expect(screen.getByTestId('reload-icon')).toBeInTheDocument();
            });
        });

        it('should hide load more button when products >= total', async () => {
            mockedAxios.get.mockImplementation((url) => {
                if (url.includes('/product/product-count')) {
                    return Promise.resolve({ data: { total: 2 } });
                }
                if (url.includes('/product/product-list')) {
                    return Promise.resolve({ data: { products: mockProducts } });
                }
                return Promise.resolve({ data: { success: true, category: mockCategories } });
            });

            renderHomePage();

            await waitFor(() => {
                expect(screen.queryByText('Loadmore')).not.toBeInTheDocument();
            });
        });

        it('should load more products on button click', async () => {
            const additionalProducts = [
                { _id: 'prod3', name: 'Mouse', slug: 'mouse', price: 29.99, description: 'Wireless mouse' }
            ];

            mockedAxios.get
                .mockImplementationOnce(() => Promise.resolve({ data: { success: true, category: mockCategories } }))
                .mockImplementationOnce(() => Promise.resolve({ data: { total: 10 } }))
                .mockImplementationOnce(() => Promise.resolve({ data: { products: mockProducts } }))
                .mockImplementationOnce(() => Promise.resolve({ data: { products: additionalProducts } }));

            renderHomePage();

            await waitFor(() => {
                const loadMoreButton = screen.getByText('Loadmore');
                fireEvent.click(loadMoreButton);
            });

            await waitFor(() => {
                expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/product/product-list/2');
            });
        });

        it('should show loading text when loading more products', async () => {
            renderHomePage();

            await waitFor(() => {
                const loadMoreButton = screen.getByText('Loadmore');
                fireEvent.click(loadMoreButton);

                // Should show loading state briefly
                expect(screen.getByText('Loading ...')).toBeInTheDocument();
            });
        });
    });

    describe('Reset Filters', () => {
        it('should reload page when reset filters is clicked', async () => {
            renderHomePage();

            const resetButton = await screen.findByText('RESET FILTERS');
            fireEvent.click(resetButton);

            expect(mockReload).toHaveBeenCalled();
        });
    });

    describe('Error Handling', () => {
        it('should handle products API error', async () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
            mockedAxios.get.mockImplementation((url) => {
                if (url.includes('/product/product-list')) {
                    return Promise.reject(new Error('Products API error'));
                }
                if (url.includes('/category/get-category')) {
                    return Promise.resolve({ data: { success: true, category: mockCategories } });
                }
                if (url.includes('/product/product-count')) {
                    return Promise.resolve({ data: { total: 10 } });
                }
                return Promise.reject(new Error('Unknown endpoint'));
            });

            renderHomePage();

            await waitFor(() => {
                expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
            });

            consoleSpy.mockRestore();
        });

        it('should handle filter API error', async () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
            mockedAxios.post.mockRejectedValueOnce(new Error('Filter API error'));

            renderHomePage();

            await waitFor(() => {
                const electronicsCheckbox = screen.getByLabelText('Electronics');
                fireEvent.click(electronicsCheckbox);
            });

            await waitFor(() => {
                expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
            });

            consoleSpy.mockRestore();
        });
    });
});