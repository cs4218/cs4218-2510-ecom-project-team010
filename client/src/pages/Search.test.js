import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Search from "../pages/Search";
import { useCart } from "../context/cart";
import { useSearch } from "../context/search";

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

const renderWithRouter = (component) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("Given that multiple products are available in the Home Page", () => {
    beforeEach(() => {
        useCart.mockReturnValue([[], jest.fn()]);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("When search results is empty", () => {
        useSearch.mockReturnValue([{ results: [] }, jest.fn()]);
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
});