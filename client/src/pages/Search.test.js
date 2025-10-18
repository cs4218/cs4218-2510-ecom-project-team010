// Note: Some of these test cases were generated with the help of AI

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Search from "../pages/Search";
import { useCart } from "../context/cart";
import { useSearch } from "../context/search";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

jest.mock("../components/Layout", () => {
    return {
        __esModule: true,
        default: ({ children }) => <div data-testid="layout">{children}</div>,
    };
});

jest.mock("../context/search", () => ({
    useSearch: jest.fn(),
}));

jest.mock("../context/cart", () => ({
    useCart: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: jest.fn(),
}));

jest.mock("react-hot-toast", () => ({
    success: jest.fn(),
}));

const localStorageMock = (() => {
    let store = {};
    return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => {
        store[key] = value.toString();
        },
        clear: () => {
        store = {};
        },
        removeItem: (key) => {
        delete store[key];
        },
    };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("Given that multiple products are available in the Home Page", () => {
    let mockNavigate;
    let mockSetCart;

    beforeEach(() => {
        mockNavigate = jest.fn();
        mockSetCart = jest.fn();
        useNavigate.mockReturnValue(mockNavigate);
        useCart.mockReturnValue([[], mockSetCart]);
        localStorage.clear();
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("When rendering search results", () => {
        test("When search results is empty", () => {
            useSearch.mockReturnValue([{ results: [] }, jest.fn()]);
            renderWithRouter(<Search />);
            expect(screen.getByText("Search Results")).toBeInTheDocument();
            expect(screen.getByText("No Products Found")).toBeInTheDocument();
        });

        test("When search results is undefined", () => {
            useSearch.mockReturnValue([{}, jest.fn()]);
            renderWithRouter(<Search />);
            expect(screen.getByText("Search Results")).toBeInTheDocument();
            expect(screen.getByText("No Products Found")).toBeInTheDocument();
        });

        test("When a single search result is present", () => {
            const mockProduct = [
                {
                _id: "1",
                name: "Product A",
                description: "Mock description of product A",
                price: 10,
                slug: "product-a",
                },
            ];
            useSearch.mockReturnValue([{ results: mockProduct }, jest.fn()]);
            renderWithRouter(<Search />);
            expect(screen.getByText("Found 1")).toBeInTheDocument();
            expect(screen.getByText("Product A")).toBeInTheDocument();
            expect(screen.getByText("Mock description of product A...")).toBeInTheDocument();
            expect(screen.getByText("$ 10")).toBeInTheDocument();
        });

        test("When multiple search results are present", () => {
            const mockProducts = [
                {
                _id: "1",
                name: "Product A",
                description: "Mock description of product A",
                price: 10,
                slug: "product-a",
                },
                {
                _id: "2",
                name: "Product B",
                description: "Mock description of product B",
                price: 20,
                slug: "product-b",
                },
            ];
            useSearch.mockReturnValue([{ results: mockProducts }, jest.fn()]);
            renderWithRouter(<Search />);
            expect(screen.getByText("Found 2")).toBeInTheDocument();
            expect(screen.getByText("Product A")).toBeInTheDocument();
            expect(screen.getByText("Product B")).toBeInTheDocument();
        });

        test("When product description is longer than 30 characters, it should be truncated", () => {
            const mockProduct = [
                {
                _id: "1",
                name: "Product A",
                description: "This is a very long description that exceeds thirty characters",
                price: 10,
                slug: "product-a",
                },
            ];
            useSearch.mockReturnValue([{ results: mockProduct }, jest.fn()]);
            renderWithRouter(<Search />);
            expect(screen.getByText("This is a very long descriptio...")).toBeInTheDocument();
        });

        test("When product images are rendered with correct src", () => {
            const mockProduct = [
                {
                _id: "123",
                name: "Product A",
                description: "Mock description",
                price: 10,
                slug: "product-a",
                },
            ];
            useSearch.mockReturnValue([{ results: mockProduct }, jest.fn()]);
            renderWithRouter(<Search />);
            const image = screen.getByAltText("Product A");
            expect(image).toHaveAttribute("src", "/api/v1/product/product-photo/123");
        });
    });

    describe("When interacting with product cards", () => {
        test("When 'More Details' button is clicked, navigate to product page", () => {
            const mockProduct = [
                {
                _id: "1",
                name: "Product A",
                description: "Mock description",
                price: 10,
                slug: "product-a",
                },
            ];
            useSearch.mockReturnValue([{ results: mockProduct }, jest.fn()]);
            renderWithRouter(<Search />);

            const moreDetailsButton = screen.getByText("More Details");
            fireEvent.click(moreDetailsButton);

            expect(mockNavigate).toHaveBeenCalledWith("/product/product-a");
        });

        test("When 'ADD TO CART' button is clicked, product is added to cart", () => {
            const mockProduct = [
                {
                _id: "1",
                name: "Product A",
                description: "Mock description",
                price: 10,
                slug: "product-a",
                },
            ];
            useSearch.mockReturnValue([{ results: mockProduct }, jest.fn()]);
            renderWithRouter(<Search />);

            const addToCartButton = screen.getByText("ADD TO CART");
            fireEvent.click(addToCartButton);

            expect(mockSetCart).toHaveBeenCalledWith([mockProduct[0]]);
        });

        test("When product is added to cart, it is saved to localStorage", () => {
            const mockProduct = [
                {
                _id: "1",
                name: "Product A",
                description: "Mock description",
                price: 10,
                slug: "product-a",
                },
            ];
            useSearch.mockReturnValue([{ results: mockProduct }, jest.fn()]);
            renderWithRouter(<Search />);

            const addToCartButton = screen.getByText("ADD TO CART");
            fireEvent.click(addToCartButton);

            const savedCart = JSON.parse(localStorage.getItem("cart"));
            expect(savedCart).toEqual([mockProduct[0]]);
        });

        test("When product is added to cart, success toast is shown", () => {
            const mockProduct = [
                {
                _id: "1",
                name: "Product A",
                description: "Mock description",
                price: 10,
                slug: "product-a",
                },
            ];
            useSearch.mockReturnValue([{ results: mockProduct }, jest.fn()]);
            renderWithRouter(<Search />);

            const addToCartButton = screen.getByText("ADD TO CART");
            fireEvent.click(addToCartButton);

            expect(toast.success).toHaveBeenCalledWith("Item Added to cart");
        });

        test("When adding product to existing cart, new product is appended", () => {
            const existingCartProduct = {
                _id: "0",
                name: "Existing Product",
                description: "Existing description",
                price: 5,
                slug: "existing-product",
            };
            const mockProduct = [
                {
                _id: "1",
                name: "Product A",
                description: "Mock description",
                price: 10,
                slug: "product-a",
                },
            ];

            useCart.mockReturnValue([[existingCartProduct], mockSetCart]);
            useSearch.mockReturnValue([{ results: mockProduct }, jest.fn()]);
            renderWithRouter(<Search />);

            const addToCartButton = screen.getByText("ADD TO CART");
            fireEvent.click(addToCartButton);

            expect(mockSetCart).toHaveBeenCalledWith([existingCartProduct, mockProduct[0]]);
        });

        test("When multiple products exist, each 'More Details' button navigates to correct product", () => {
            const mockProducts = [
                {
                _id: "1",
                name: "Product A",
                description: "Description A",
                price: 10,
                slug: "product-a",
                },
                {
                _id: "2",
                name: "Product B",
                description: "Description B",
                price: 20,
                slug: "product-b",
                },
            ];
            useSearch.mockReturnValue([{ results: mockProducts }, jest.fn()]);
            renderWithRouter(<Search />);

            const moreDetailsButtons = screen.getAllByText("More Details");
            
            fireEvent.click(moreDetailsButtons[0]);
            expect(mockNavigate).toHaveBeenCalledWith("/product/product-a");

            fireEvent.click(moreDetailsButtons[1]);
            expect(mockNavigate).toHaveBeenCalledWith("/product/product-b");
        });

        test("When multiple products exist, each 'ADD TO CART' button adds correct product", () => {
            const mockProducts = [
                {
                _id: "1",
                name: "Product A",
                description: "Description A",
                price: 10,
                slug: "product-a",
                },
                {
                _id: "2",
                name: "Product B",
                description: "Description B",
                price: 20,
                slug: "product-b",
                },
            ];
            useSearch.mockReturnValue([{ results: mockProducts }, jest.fn()]);
            renderWithRouter(<Search />);

            const addToCartButtons = screen.getAllByText("ADD TO CART");
            
            fireEvent.click(addToCartButtons[1]);
            expect(mockSetCart).toHaveBeenCalledWith([mockProducts[1]]);
        });
    });

    describe("When rendering product cards", () => {
        test("Each product card should have correct structure", () => {
            const mockProduct = [
                {
                _id: "1",
                name: "Product A",
                description: "Mock description",
                price: 10,
                slug: "product-a",
                },
            ];
            useSearch.mockReturnValue([{ results: mockProduct }, jest.fn()]);
            renderWithRouter(<Search />);

            expect(screen.getByRole("heading", { name: "Product A" })).toBeInTheDocument();
            expect(screen.getByRole("img", { name: "Product A" })).toBeInTheDocument();
            expect(screen.getByText("More Details")).toBeInTheDocument();
            expect(screen.getByText("ADD TO CART")).toBeInTheDocument();
        });
    });
});