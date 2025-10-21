import React from "react";
import { render, screen, act } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { SearchProvider, useSearch } from "../context/search";
import Search from "../pages/Search";

jest.mock("../components/Layout", () => {
  return function Layout({ children, title }) {
    return (
      <div data-testid="layout" data-title={title}>
        {children}
      </div>
    );
  };
});

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

jest.mock("../context/cart", () => ({
  useCart: jest.fn(),
}));

jest.mock("react-hot-toast", () => ({
  success: jest.fn(),
}));

import { useNavigate } from "react-router-dom";
import { useCart } from "../context/cart";

describe("Test integration between Search Context and Search Page", () => {
  let mockNavigate;
  let mockSetCart;

  beforeEach(() => {
    jest.clearAllMocks();
    // Create fresh mocks for each test
    mockNavigate = jest.fn();
    mockSetCart = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);
    useCart.mockReturnValue([[], mockSetCart]);
  });

  const renderWithRouter = (component) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  describe("SearchContext Provider", () => {
    test("Should provide initial empty search state", () => {
      let capturedValues;
      const TestComponent = () => {
        capturedValues = useSearch();
        return <div>Test</div>;
      };

      renderWithRouter(
        <SearchProvider>
          <TestComponent />
        </SearchProvider>
      );

      expect(capturedValues[0].keyword).toBe("");
      expect(capturedValues[0].results).toEqual([]);
    });

    test("Should allow updating search state", () => {
      let capturedValues;
      const TestComponent = () => {
        capturedValues = useSearch();
        return (
          <button
            onClick={() =>
              capturedValues[1]({
                keyword: "test",
                results: [{ _id: "1", name: "Product 1" }],
              })
            }
          >
            Update
          </button>
        );
      };

      const { rerender } = renderWithRouter(
        <SearchProvider>
          <TestComponent />
        </SearchProvider>
      );

      act(() => {
        screen.getByText("Update").click();
      });

      rerender(
        <BrowserRouter>
          <SearchProvider>
            <TestComponent />
          </SearchProvider>
        </BrowserRouter>
      );

      expect(capturedValues[0].keyword).toBe("test");
      expect(capturedValues[0].results).toHaveLength(1);
    });
  });

  describe("Search Page Integration", () => {
    test("Should display 'No Products Found' when results are empty", () => {
      renderWithRouter(
        <SearchProvider>
          <Search />
        </SearchProvider>
      );

      expect(screen.getByText("Search Results")).toBeInTheDocument();
      expect(screen.getByText("No Products Found")).toBeInTheDocument();
    });

    test("Should display product count when results exist", () => {
      const TestWrapper = () => {
        const [, setSearch] = useSearch();
        React.useEffect(() => {
          setSearch({
            keyword: "laptop",
            results: [
              {
                _id: "1",
                name: "Laptop",
                description: "A great laptop",
                price: 999,
                slug: "laptop",
              },
              {
                _id: "2",
                name: "Gaming Laptop",
                description: "A powerful gaming laptop",
                price: 1499,
                slug: "gaming-laptop",
              },
            ],
          });
        }, [setSearch]);

        return <Search />;
      };

      renderWithRouter(
        <SearchProvider>
          <TestWrapper />
        </SearchProvider>
      );

      expect(screen.getByText("Found 2")).toBeInTheDocument();
    });

    test("Should render product cards with correct data", () => {
      const mockProducts = [
        {
          _id: "1",
          name: "Test Product",
          description: "This is a test product description",
          price: 99.99,
          slug: "test-product",
        },
      ];

      const TestWrapper = () => {
        const [, setSearch] = useSearch();
        React.useEffect(() => {
          setSearch({
            keyword: "test",
            results: mockProducts,
          });
        }, [setSearch]);

        return <Search />;
      };

      renderWithRouter(
        <SearchProvider>
          <TestWrapper />
        </SearchProvider>
      );

      expect(screen.getByText("Test Product")).toBeInTheDocument();
      expect(screen.getByText("$ 99.99")).toBeInTheDocument();
      expect(screen.getByText("More Details")).toBeInTheDocument();
      expect(screen.getByText("ADD TO CART")).toBeInTheDocument();
    });

    test("Should render multiple product cards", () => {
      const mockProducts = [
        {
          _id: "1",
          name: "Product 1",
          description: "Description 1",
          price: 10,
          slug: "product-1",
        },
        {
          _id: "2",
          name: "Product 2",
          description: "Description 2",
          price: 20,
          slug: "product-2",
        },
        {
          _id: "3",
          name: "Product 3",
          description: "Description 3",
          price: 30,
          slug: "product-3",
        },
      ];

      const TestWrapper = () => {
        const [, setSearch] = useSearch();
        React.useEffect(() => {
          setSearch({ keyword: "product", results: mockProducts });
        }, [setSearch]);

        return <Search />;
      };

      renderWithRouter(
        <SearchProvider>
          <TestWrapper />
        </SearchProvider>
      );

      expect(screen.getByText("Found 3")).toBeInTheDocument();
      expect(screen.getByText("Product 1")).toBeInTheDocument();
      expect(screen.getByText("Product 2")).toBeInTheDocument();
      expect(screen.getByText("Product 3")).toBeInTheDocument();
    });

    test("Should pass correct title to Layout component", () => {
      renderWithRouter(
        <SearchProvider>
          <Search />
        </SearchProvider>
      );

      const layout = screen.getByTestId("layout");
      expect(layout).toHaveAttribute("data-title", "Search results");
    });

    test("Should navigate when 'More Details' button is clicked", () => {
      const mockProducts = [
        {
          _id: "1",
          name: "Test Product",
          description: "Test description",
          price: 50,
          slug: "test-product",
        },
      ];

      const TestWrapper = () => {
        const [, setSearch] = useSearch();
        React.useEffect(() => {
          setSearch({ keyword: "test", results: mockProducts });
        }, [setSearch]);

        return <Search />;
      };

      renderWithRouter(
        <SearchProvider>
          <TestWrapper />
        </SearchProvider>
      );

      const moreDetailsButton = screen.getByText("More Details");
      act(() => {
        moreDetailsButton.click();
      });

      expect(mockNavigate).toHaveBeenCalledWith("/product/test-product");
    });

    test("Should add product to cart when 'ADD TO CART' is clicked", () => {
      const mockProducts = [
        {
          _id: "1",
          name: "Test Product",
          description: "Test description",
          price: 50,
          slug: "test-product",
        },
      ];

      const TestWrapper = () => {
        const [, setSearch] = useSearch();
        React.useEffect(() => {
          setSearch({ keyword: "test", results: mockProducts });
        }, [setSearch]);

        return <Search />;
      };

      renderWithRouter(
        <SearchProvider>
          <TestWrapper />
        </SearchProvider>
      );

      const addToCartButton = screen.getByText("ADD TO CART");
      act(() => {
        addToCartButton.click();
      });

      expect(mockSetCart).toHaveBeenCalledWith([mockProducts[0]]);
    });
  });
});