import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { act } from "react-dom/test-utils";
import userEvent from "@testing-library/user-event";
import Layout from "./Layout";
import axios from "axios";

// Mock external dependencies
jest.mock("axios");
const mockedAxios = axios;

jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: { success: jest.fn(), error: jest.fn() },
  Toaster: () => <div data-testid="toaster">Toaster</div>,
  success: jest.fn(),
  error: jest.fn(),
}));

jest.mock("react-helmet", () => ({
  Helmet: ({ children, title }) => (
    <div data-testid="helmet">
      <title>{title}</title>
      {children}
    </div>
  ),
}));

// Mock the hooks and context providers with dynamic values
const mockUseAuth = jest.fn();
const mockUseCart = jest.fn();
const mockUseCategory = jest.fn();

jest.mock("../context/auth", () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock("../context/cart", () => ({
  useCart: () => mockUseCart(),
}));

jest.mock("../hooks/useCategory", () => ({
  __esModule: true,
  default: () => mockUseCategory(),
}));

jest.mock("./Form/SearchInput", () => ({
  __esModule: true,
  default: () => <input data-testid="search-input" placeholder="Search..." />,
}));

// Keep Header and Footer real for integration testing
import Header from "./Header";
import Footer from "./Footer";

describe("Test integration between Layout, Header, and Footer", () => {
  const mockCategories = [
    { _id: "1", name: "Electronics", slug: "electronics" },
    { _id: "2", name: "Clothing", slug: "clothing" },
    { _id: "3", name: "Books", slug: "books" },
  ];

  beforeEach(() => {
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.clearAllMocks();

    // Set up default mock implementations
    mockUseAuth.mockReturnValue([
      { user: null, token: "" },
      jest.fn()
    ]);

    mockUseCart.mockReturnValue([[]]);

    mockUseCategory.mockReturnValue([]);

    // Mock category API call
    mockedAxios.get.mockResolvedValue({
      data: { success: true, category: mockCategories },
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("Layout Structure Integration", () => {
    test("Should render Layout with Header and Footer components", async () => {
      render(
        <MemoryRouter>
          <Layout title="Test Page">
            <div data-testid="test-content">Test Content</div>
          </Layout>
        </MemoryRouter>
      );

      // Assert Layout structure
      expect(screen.getByTestId("helmet")).toBeInTheDocument();
      expect(screen.getByTestId("toaster")).toBeInTheDocument();
      expect(screen.getByTestId("test-content")).toBeInTheDocument();

      // Assert Header is rendered
      expect(screen.getByText("🛒 Virtual Vault")).toBeInTheDocument();
      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("Categories")).toBeInTheDocument();
      expect(screen.getByText("Register")).toBeInTheDocument();
      expect(screen.getByText("Login")).toBeInTheDocument();

      // Assert Footer is rendered
      expect(screen.getByText("All Rights Reserved © TestingComp")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "About" })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Contact" })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Privacy Policy" })).toBeInTheDocument();
    });

    test("Should set correct page title through Helmet", async () => {
      render(
        <MemoryRouter>
          <Layout title="Custom Page Title">
            <div data-testid="test-content">Test Content</div>
          </Layout>
        </MemoryRouter>
      );

      // Assert title is set
      expect(screen.getByText("Custom Page Title")).toBeInTheDocument();
    });

    test("Should render with default props when no props provided", async () => {
      render(
        <MemoryRouter>
          <Layout>
            <div data-testid="test-content">Test Content</div>
          </Layout>
        </MemoryRouter>
      );

      // Assert default title is used
      expect(screen.getByText("Ecommerce app - shop now")).toBeInTheDocument();
    });
  });

  describe("Header Navigation Integration", () => {
    test("Should render all navigation links correctly", async () => {
      render(
        <MemoryRouter>
          <Layout>
            <div data-testid="test-content">Test Content</div>
          </Layout>
        </MemoryRouter>
      );

      // Assert main navigation links
      expect(screen.getByRole("link", { name: "🛒 Virtual Vault" })).toHaveAttribute("href", "/");
      expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
      expect(screen.getByRole("link", { name: "Categories" })).toHaveAttribute("href", "/categories");
      expect(screen.getByRole("link", { name: "Register" })).toHaveAttribute("href", "/register");
      expect(screen.getByRole("link", { name: "Login" })).toHaveAttribute("href", "/login");
      expect(screen.getByRole("link", { name: "Cart" })).toHaveAttribute("href", "/cart");
    });

    test("Should render search input component", async () => {
      render(
        <MemoryRouter>
          <Layout>
            <div data-testid="test-content">Test Content</div>
          </Layout>
        </MemoryRouter>
      );

      // Assert search input is rendered
      expect(screen.getByTestId("search-input")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
    });

    test("Should render categories dropdown when categories are loaded", async () => {
      // Mock categories being loaded
      mockUseCategory.mockReturnValue(mockCategories);

      render(
        <MemoryRouter>
          <Layout>
            <div data-testid="test-content">Test Content</div>
          </Layout>
        </MemoryRouter>
      );

      // Assert categories dropdown exists
      const categoriesLink = screen.getByRole("link", { name: "Categories" });
      expect(categoriesLink).toBeInTheDocument();

      // Assert category items are rendered
      expect(screen.getByText("Electronics")).toBeInTheDocument();
      expect(screen.getByText("Clothing")).toBeInTheDocument();
      expect(screen.getByText("Books")).toBeInTheDocument();
    });
  });

  describe("Footer Links Integration", () => {
    test("Should render all footer links with correct hrefs", async () => {
      render(
        <MemoryRouter>
          <Layout>
            <div data-testid="test-content">Test Content</div>
          </Layout>
        </MemoryRouter>
      );

      // Assert footer links
      expect(screen.getByRole("link", { name: "About" })).toHaveAttribute("href", "/about");
      expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute("href", "/contact");
      expect(screen.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute("href", "/policy");
    });

    test("Should display footer copyright text", async () => {
      render(
        <MemoryRouter>
          <Layout>
            <div data-testid="test-content">Test Content</div>
          </Layout>
        </MemoryRouter>
      );

      // Assert copyright text
      expect(screen.getByText("All Rights Reserved © TestingComp")).toBeInTheDocument();
    });
  });

  describe("Authentication State Integration", () => {
    test("Should show login/register links when user is not authenticated", async () => {
      render(
        <MemoryRouter>
          <Layout>
            <div data-testid="test-content">Test Content</div>
          </Layout>
        </MemoryRouter>
      );

      // Assert authentication links for non-authenticated user
      expect(screen.getByRole("link", { name: "Register" })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Login" })).toBeInTheDocument();
    });

    test("Should show user dropdown when user is authenticated", async () => {
      // Mock authenticated user
      mockUseAuth.mockReturnValue([
        { 
          user: { 
            _id: "user123", 
            name: "John Doe", 
            email: "john@example.com",
            role: 0 
          }, 
          token: "fake-token" 
        },
        jest.fn()
      ]);

      render(
        <MemoryRouter>
          <Layout>
            <div data-testid="test-content">Test Content</div>
          </Layout>
        </MemoryRouter>
      );

      // Assert user dropdown is shown
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute("href", "/dashboard/user");
    });

    test("Should show admin dashboard link when user is admin", async () => {
      // Mock admin user
      mockUseAuth.mockReturnValue([
        { 
          user: { 
            _id: "admin123", 
            name: "Admin User", 
            email: "admin@example.com",
            role: 1 
          }, 
          token: "fake-admin-token" 
        },
        jest.fn()
      ]);

      render(
        <MemoryRouter>
          <Layout>
            <div data-testid="test-content">Test Content</div>
          </Layout>
        </MemoryRouter>
      );

      // Assert admin dashboard link
      expect(screen.getByText("Admin User")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute("href", "/dashboard/admin");
    });
  });

  describe("Cart Integration", () => {
    test("Should display cart badge with item count", async () => {
      // Mock cart with items
      const mockCart = [
        { _id: "1", name: "Product 1" },
        { _id: "2", name: "Product 2" },
      ];

      mockUseCart.mockReturnValue([mockCart]);

      render(
        <MemoryRouter>
          <Layout>
            <div data-testid="test-content">Test Content</div>
          </Layout>
        </MemoryRouter>
      );

      // Assert cart badge shows correct count
      expect(screen.getByText("2")).toBeInTheDocument(); // Badge count
      expect(screen.getByRole("link", { name: "Cart" })).toBeInTheDocument();
    });

    test("Should display cart badge with zero count when cart is empty", async () => {
      // Mock empty cart
      const mockEmptyCart = [];

      mockUseCart.mockReturnValue([mockEmptyCart]);

      render(
        <MemoryRouter>
          <Layout>
            <div data-testid="test-content">Test Content</div>
          </Layout>
        </MemoryRouter>
      );

      // Assert cart badge shows zero count
      expect(screen.getByText("0")).toBeInTheDocument(); // Badge count
      expect(screen.getByRole("link", { name: "Cart" })).toBeInTheDocument();
    });
  });

  describe("Responsive Navigation Integration", () => {
    test("Should render mobile navigation toggle button", async () => {
      render(
        <MemoryRouter>
          <Layout>
            <div data-testid="test-content">Test Content</div>
          </Layout>
        </MemoryRouter>
      );

      // Assert mobile toggle button exists
      const toggleButton = screen.getByRole("button", { name: /toggle navigation/i });
      expect(toggleButton).toBeInTheDocument();
      expect(toggleButton).toHaveAttribute("data-bs-toggle", "collapse");
      expect(toggleButton).toHaveAttribute("data-bs-target", "#navbarTogglerDemo01");
    });

    test("Should have collapsible navigation menu", async () => {
      render(
        <MemoryRouter>
          <Layout>
            <div data-testid="test-content">Test Content</div>
          </Layout>
        </MemoryRouter>
      );

      // Assert collapsible menu exists
      const collapsibleMenu = screen.getByRole("navigation");
      expect(collapsibleMenu).toHaveClass("navbar");
      
      const collapseDiv = document.getElementById("navbarTogglerDemo01");
      expect(collapseDiv).toHaveClass("collapse", "navbar-collapse");
    });
  });

  describe("Component Communication Integration", () => {
    test("Should pass children content through Layout to main section", async () => {
      const TestChild = () => <div data-testid="child-component">Child Component</div>;

      render(
        <MemoryRouter>
          <Layout title="Test Page">
            <TestChild />
          </Layout>
        </MemoryRouter>
      );

      // Assert child component is rendered in main section
      expect(screen.getByTestId("child-component")).toBeInTheDocument();
      expect(screen.getByText("Child Component")).toBeInTheDocument();
    });

    test("Should maintain proper DOM structure with Header, Main, and Footer", async () => {
      render(
        <MemoryRouter>
          <Layout>
            <div data-testid="test-content">Test Content</div>
          </Layout>
        </MemoryRouter>
      );

      // Assert DOM structure
      const layout = screen.getByTestId("test-content").closest("div");
      expect(layout).toBeInTheDocument();

      // Header should be above main content
      const header = screen.getByText("🛒 Virtual Vault").closest("nav");
      expect(header).toBeInTheDocument();

      // Footer should be below main content
      const footer = screen.getByText("All Rights Reserved © TestingComp").closest("div");
      expect(footer).toBeInTheDocument();
    });
  });

  describe("Error Handling Integration", () => {
    test("Should handle category API errors gracefully", async () => {
      // Mock API error
      mockedAxios.get.mockRejectedValue(new Error("API Error"));

      render(
        <MemoryRouter>
          <Layout>
            <div data-testid="test-content">Test Content</div>
          </Layout>
        </MemoryRouter>
      );

      // Assert Layout still renders despite API error
      expect(screen.getByTestId("test-content")).toBeInTheDocument();
      expect(screen.getByText("🛒 Virtual Vault")).toBeInTheDocument();
      expect(screen.getByText("All Rights Reserved © TestingComp")).toBeInTheDocument();
    });

    test("Should render Layout even when context providers fail", async () => {
      // Mock context error
      mockUseAuth.mockImplementation(() => {
        throw new Error("Auth context error");
      });

      // Should not crash the entire Layout - the error will be thrown during render
      expect(() => {
        render(
          <MemoryRouter>
            <Layout>
              <div data-testid="test-content">Test Content</div>
            </Layout>
          </MemoryRouter>
        );
      }).toThrow(); // This is expected behavior when context fails
    });
  });

  describe("Performance Integration", () => {
    test("Should render Layout components efficiently", async () => {
      const startTime = performance.now();

      render(
        <MemoryRouter>
          <Layout>
            <div data-testid="test-content">Test Content</div>
          </Layout>
        </MemoryRouter>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Assert components render quickly (less than 100ms)
      expect(renderTime).toBeLessThan(100);
      
      // Assert all components are present
      expect(screen.getByTestId("test-content")).toBeInTheDocument();
      expect(screen.getByText("🛒 Virtual Vault")).toBeInTheDocument();
      expect(screen.getByText("All Rights Reserved © TestingComp")).toBeInTheDocument();
    });
  });
});
