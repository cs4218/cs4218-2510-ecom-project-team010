// Note: these test cases are generated with the help of AI

import React from "react";
import { render, screen, waitFor, fireEvent, act } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import axios from "axios";
import CategoryProduct from "./CategoryProduct";

// Mock axios
jest.mock("axios", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

// Mock Layout component
jest.mock("./../components/Layout", () => ({
  __esModule: true,
  default: ({ children }) => (
    <div data-testid="layout">
      {children}
    </div>
  ),
}));

// Mock react-router-dom hooks
const mockNavigate = jest.fn();
const mockUseParams = jest.fn();

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return { 
    ...actual, 
    useNavigate: () => mockNavigate,
    useParams: () => mockUseParams()
  };
});

describe("CategoryProduct Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockReset();
    mockUseParams.mockReturnValue({ slug: "electronics" });
  });

  const renderWithRouter = async (initialEntries = ["/category/electronics"]) => {
    let result;
    await act(async () => {
      result = render(
        <MemoryRouter initialEntries={initialEntries}>
          <Routes>
            <Route path="/category/:slug" element={<CategoryProduct />} />
          </Routes>
        </MemoryRouter>
      );
    });
    return result;
  };

  describe("Component Rendering", () => {
    it("renders Layout component", async () => {
      axios.get.mockResolvedValueOnce({
        data: {
          products: [],
          category: { name: "Electronics" }
        }
      });

      await renderWithRouter();
      
      expect(screen.getByTestId("layout")).toBeInTheDocument();
    });

    it("renders category name and product count when data is loaded", async () => {
      const mockData = {
        products: [
          { _id: "1", name: "Laptop", price: 999, description: "High performance laptop", slug: "laptop" },
          { _id: "2", name: "Phone", price: 599, description: "Smartphone with great camera", slug: "phone" }
        ],
        category: { name: "Electronics" }
      };

      axios.get.mockResolvedValueOnce({ data: mockData });

      await renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText("Category - Electronics")).toBeInTheDocument();
        expect(screen.getByText("2 result found")).toBeInTheDocument();
      });
    });

    it("renders 0 results when no products are found", async () => {
      axios.get.mockResolvedValueOnce({
        data: {
          products: [],
          category: { name: "Electronics" }
        }
      });

      await renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText("0 result found")).toBeInTheDocument();
      });
    });
  });

  describe("API Calls", () => {
    it("calls API with correct endpoint when component mounts", async () => {
      axios.get.mockResolvedValueOnce({
        data: {
          products: [],
          category: { name: "Electronics" }
        }
      });

      await renderWithRouter();

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith("/api/v1/product/product-category/electronics");
      });
    });

    it("sets products and category state when API call succeeds", async () => {
      const mockData = {
        products: [
          { _id: "1", name: "Laptop", price: 999, description: "High performance laptop", slug: "laptop" }
        ],
        category: { name: "Electronics" }
      };

      axios.get.mockResolvedValueOnce({ data: mockData });

      await renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText("Category - Electronics")).toBeInTheDocument();
        expect(screen.getByText("1 result found")).toBeInTheDocument();
        expect(screen.getByText("Laptop")).toBeInTheDocument();
      });
    });

    it("logs error when API call fails", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
      const error = new Error("Network error");
      
      axios.get.mockRejectedValueOnce(error);

      await renderWithRouter();

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(error);
      });

      consoleSpy.mockRestore();
    });
  });

  describe("Product Display", () => {
    const mockProducts = [
      {
        _id: "1",
        name: "Laptop",
        price: 999,
        description: "High performance laptop with great specifications",
        slug: "laptop"
      },
      {
        _id: "2", 
        name: "Smartphone",
        price: 599,
        description: "Latest smartphone with advanced camera features",
        slug: "smartphone"
      }
    ];

    it("renders product cards with correct information", async () => {
      jest.clearAllMocks();
      axios.get.mockResolvedValueOnce({
        data: {
          products: mockProducts,
          category: { name: "Electronics" }
        }
      });

      await renderWithRouter();

      await waitFor(() => {
        // Check product names
        expect(screen.getByText("Laptop")).toBeInTheDocument();
        expect(screen.getByText("Smartphone")).toBeInTheDocument();

        // Check prices are formatted correctly
        expect(screen.getByText("$999.00")).toBeInTheDocument();
        expect(screen.getByText("$599.00")).toBeInTheDocument();

        // Check descriptions are truncated
        expect(screen.getByText(/High performance laptop with great specificat/)).toBeInTheDocument();
        expect(screen.getByText(/Latest smartphone with advanced camera features/)).toBeInTheDocument();
      });
    });

    it("renders product images with correct src and alt attributes", async () => {
      jest.clearAllMocks();
      axios.get.mockResolvedValueOnce({
        data: {
          products: mockProducts,
          category: { name: "Electronics" }
        }
      });

      await renderWithRouter();

      await waitFor(() => {
        const laptopImage = screen.getByAltText("Laptop");
        const phoneImage = screen.getByAltText("Smartphone");

        expect(laptopImage).toHaveAttribute("src", "/api/v1/product/product-photo/1");
        expect(phoneImage).toHaveAttribute("src", "/api/v1/product/product-photo/2");
      });
    });

    it("renders More Details buttons for each product", async () => {
      jest.clearAllMocks();
      axios.get.mockResolvedValueOnce({
        data: {
          products: mockProducts,
          category: { name: "Electronics" }
        }
      });

      await renderWithRouter();

      await waitFor(() => {
        const moreDetailsButtons = screen.getAllByText("More Details");
        expect(moreDetailsButtons).toHaveLength(2);
      });
    });

    it("navigates to product details when More Details button is clicked", async () => {
      jest.clearAllMocks();
      axios.get.mockResolvedValueOnce({
        data: {
          products: mockProducts,
          category: { name: "Electronics" }
        }
      });

      await renderWithRouter();

      await waitFor(() => {
        const moreDetailsButton = screen.getAllByText("More Details")[0];
        fireEvent.click(moreDetailsButton);

        expect(mockNavigate).toHaveBeenCalledWith("/product/laptop");
      });
    });

    it("handles products with long descriptions correctly", async () => {
      const productWithLongDescription = {
        _id: "3",
        name: "Product with very long description",
        price: 100,
        description: "This is a very long description that should be truncated when displayed in the product card to maintain consistent layout",
        slug: "long-description-product"
      };

      jest.clearAllMocks();
      axios.get.mockResolvedValueOnce({
        data: {
          products: [productWithLongDescription],
          category: { name: "Electronics" }
        }
      });

      await renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText(/This is a very long description that should be truncated whe/)).toBeInTheDocument();
      });
    });
  });

  describe("Edge Cases", () => {
    it("handles undefined category gracefully", async () => {
      jest.clearAllMocks();
      axios.get.mockResolvedValueOnce({
        data: {
          products: [],
          category: undefined
        }
      });

      await renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText("Category -")).toBeInTheDocument();
      });
    });

    it("handles undefined products array gracefully", async () => {
      jest.clearAllMocks();
      axios.get.mockResolvedValueOnce({
        data: {
          products: undefined,
          category: { name: "Electronics" }
        }
      });

      await renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText("Category - Electronics")).toBeInTheDocument();
        expect(screen.getByText(/result found/)).toBeInTheDocument();
      });
    });

    it("handles products with missing properties gracefully", async () => {
      const incompleteProduct = {
        _id: "1",
        name: "Incomplete Product",
        price: 0,
        description: "",
        slug: "incomplete"
      };

      jest.clearAllMocks();
      axios.get.mockResolvedValueOnce({
        data: {
          products: [incompleteProduct],
          category: { name: "Electronics" }
        }
      });

      await renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText("Incomplete Product")).toBeInTheDocument();
      });
    });

    it("does not call API when slug is not provided", async () => {
      // Mock useParams to return undefined slug
      mockUseParams.mockReturnValue({ slug: undefined });

      await renderWithRouter();

      expect(axios.get).not.toHaveBeenCalled();
    });
  });

  describe("Price Formatting", () => {
    it("formats prices correctly with different values", async () => {
      const productsWithDifferentPrices = [
        { _id: "1", name: "Cheap Item", price: 9.99, description: "Cheap", slug: "cheap" },
        { _id: "2", name: "Expensive Item", price: 9999.99, description: "Expensive", slug: "expensive" },
        { _id: "3", name: "Free Item", price: 0, description: "Free", slug: "free" }
      ];

      jest.clearAllMocks();
      axios.get.mockResolvedValueOnce({
        data: {
          products: productsWithDifferentPrices,
          category: { name: "Electronics" }
        }
      });

      await renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText("$9.99")).toBeInTheDocument();
        expect(screen.getByText("$9,999.99")).toBeInTheDocument();
        expect(screen.getByText("$0.00")).toBeInTheDocument();
      });
    });
  });
});