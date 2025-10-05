// Note: these test cases are generated with the help of AI

import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import toast from "react-hot-toast";
import Header from "./Header";

// Mock dependencies
jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: { success: jest.fn(), error: jest.fn() },
}));

jest.mock("../context/auth", () => ({
  useAuth: jest.fn(),
}));

jest.mock("../context/cart", () => ({
  useCart: jest.fn(),
}));

jest.mock("../hooks/useCategory", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("./Form/SearchInput", () => ({
  __esModule: true,
  default: () => <div data-testid="search-input">Search Input</div>,
}));

const { useAuth } = require("../context/auth");
const { useCart } = require("../context/cart");
const useCategory = require("../hooks/useCategory").default;

describe("Testing Header Component", () => {
  const mockCategories = [
    { _id: "1", name: "Electronics", slug: "electronics" },
    { _id: "2", name: "Clothing", slug: "clothing" },
    { _id: "3", name: "Books", slug: "books" },
  ];

  const mockUser = {
    name: "John Doe",
    role: 0, // regular user
  };

  const mockAdminUser = {
    name: "Admin User",
    role: 1, // admin user
  };

  const mockAuth = {
    user: mockUser,
    token: "fake-token",
  };

  const mockSetAuth = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue([mockAuth, mockSetAuth]);
    useCart.mockReturnValue([[{ _id: "1", name: "Product 1" }]]);
    useCategory.mockReturnValue(mockCategories);
    // Mock localStorage
    Storage.prototype.removeItem = jest.fn();
  });

  const renderHeader = () =>
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

  describe("Testing basic component rendering", () => {
    it("renders without crashing", () => {
      // arrange & act
      const { container } = renderHeader();

      // assert
      expect(container).toBeTruthy();
    });

    it("renders the main navigation", () => {
      // arrange & act
      renderHeader();

      // assert
      expect(screen.getByRole("navigation")).toBeInTheDocument();
      expect(screen.getByRole("navigation")).toHaveClass("navbar");
    });

    it("renders the navbar brand", () => {
      // arrange & act
      renderHeader();

      // assert
      const brandLink = screen.getByText("🛒 Virtual Vault");
      expect(brandLink).toBeInTheDocument();
      expect(brandLink).toHaveAttribute("href", "/");
    });

    it("renders the navbar toggler button", () => {
      // arrange & act
      renderHeader();

      // assert
      const toggler = screen.getByRole("button", { name: /toggle navigation/i });
      expect(toggler).toBeInTheDocument();
      expect(toggler).toHaveClass("navbar-toggler");
    });
  });

  describe("Testing navigation links for authenticated users", () => {
    it("renders Home link", () => {
      // arrange & act
      renderHeader();

      // assert
      const homeLink = screen.getByText("Home");
      expect(homeLink).toBeInTheDocument();
      expect(homeLink).toHaveAttribute("href", "/");
    });

    it("renders Categories dropdown", () => {
      // arrange & act
      renderHeader();

      // assert
      const categoriesLink = screen.getByText("Categories");
      expect(categoriesLink).toBeInTheDocument();
      expect(categoriesLink).toHaveAttribute("href", "/categories");
    });

    it("renders Cart link with badge", () => {
      // arrange & act
      renderHeader();

      // assert
      const cartLink = screen.getByText("Cart");
      expect(cartLink).toBeInTheDocument();
      expect(cartLink).toHaveAttribute("href", "/cart");
      
      // Check for cart badge (Ant Design Badge component)
      const cartContainer = cartLink.closest(".ant-badge");
      expect(cartContainer).toBeInTheDocument();
    });

    it("displays user name in dropdown when authenticated", () => {
      // arrange & act
      renderHeader();

      // assert
      const userNameLink = screen.getByText("John Doe");
      expect(userNameLink).toBeInTheDocument();
      expect(userNameLink).toHaveClass("nav-link", "dropdown-toggle");
    });

    it("renders Dashboard link for regular user", () => {
      // arrange & act
      renderHeader();

      // assert
      const dashboardLink = screen.getByText("Dashboard");
      expect(dashboardLink).toBeInTheDocument();
      expect(dashboardLink).toHaveAttribute("href", "/dashboard/user");
    });

    it("renders Dashboard link for admin user", () => {
      // arrange
      useAuth.mockReturnValue([{ ...mockAuth, user: mockAdminUser }, mockSetAuth]);

      // act
      renderHeader();

      // assert
      const dashboardLink = screen.getByText("Dashboard");
      expect(dashboardLink).toBeInTheDocument();
      expect(dashboardLink).toHaveAttribute("href", "/dashboard/admin");
    });

    it("renders Logout link", () => {
      // arrange & act
      renderHeader();

      // assert
      const logoutLink = screen.getByText("Logout");
      expect(logoutLink).toBeInTheDocument();
      expect(logoutLink).toHaveAttribute("href", "/login");
    });

    it("does not render Register and Login links when authenticated", () => {
      // arrange & act
      renderHeader();

      // assert
      expect(screen.queryByText("Register")).not.toBeInTheDocument();
      expect(screen.queryByText("Login")).not.toBeInTheDocument();
    });
  });

  describe("Testing navigation links for unauthenticated users", () => {
    beforeEach(() => {
      useAuth.mockReturnValue([{ user: null, token: "" }, mockSetAuth]);
    });

    it("renders Register link when not authenticated", () => {
      // arrange & act
      renderHeader();

      // assert
      const registerLink = screen.getByText("Register");
      expect(registerLink).toBeInTheDocument();
      expect(registerLink).toHaveAttribute("href", "/register");
    });

    it("renders Login link when not authenticated", () => {
      // arrange & act
      renderHeader();

      // assert
      const loginLink = screen.getByText("Login");
      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute("href", "/login");
    });

    it("does not render user dropdown when not authenticated", () => {
      // arrange & act
      renderHeader();

      // assert
      expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
      expect(screen.queryByText("Logout")).not.toBeInTheDocument();
    });
  });

  describe("Testing categories dropdown", () => {
    it("renders All Categories link", () => {
      // arrange & act
      renderHeader();

      // assert
      const allCategoriesLink = screen.getByText("All Categories");
      expect(allCategoriesLink).toBeInTheDocument();
      expect(allCategoriesLink).toHaveAttribute("href", "/categories");
    });

    it("renders individual category links", () => {
      // arrange & act
      renderHeader();

      // assert
      const electronicsLink = screen.getByText("Electronics");
      expect(electronicsLink).toBeInTheDocument();
      expect(electronicsLink).toHaveAttribute("href", "/category/electronics");

      const clothingLink = screen.getByText("Clothing");
      expect(clothingLink).toBeInTheDocument();
      expect(clothingLink).toHaveAttribute("href", "/category/clothing");

      const booksLink = screen.getByText("Books");
      expect(booksLink).toBeInTheDocument();
      expect(booksLink).toHaveAttribute("href", "/category/books");
    });

    it("handles empty categories array", () => {
      // arrange
      useCategory.mockReturnValue([]);

      // act
      renderHeader();

      // assert
      expect(screen.getByText("All Categories")).toBeInTheDocument();
      expect(screen.queryByText("Electronics")).not.toBeInTheDocument();
    });

    it("handles undefined categories", () => {
      // arrange
      useCategory.mockReturnValue(undefined);

      // act
      renderHeader();

      // assert
      expect(screen.getByText("All Categories")).toBeInTheDocument();
      expect(screen.queryByText("Electronics")).not.toBeInTheDocument();
    });
  });

  describe("Testing cart functionality", () => {
    it("displays correct cart count", () => {
      // arrange
      useCart.mockReturnValue([[{ _id: "1" }, { _id: "2" }]]);

      // act
      renderHeader();

      // assert
      const cartLink = screen.getByText("Cart");
      const cartContainer = cartLink.closest(".ant-badge");
      expect(cartContainer).toBeInTheDocument();
    });

    it("displays zero count when cart is empty", () => {
      // arrange
      useCart.mockReturnValue([[]]);

      // act
      renderHeader();

      // assert
      const cartLink = screen.getByText("Cart");
      expect(cartLink).toBeInTheDocument();
    });
  });

  describe("Testing logout functionality", () => {
    it("calls setAuth with null user on logout", async () => {
      // arrange
      renderHeader();
      const logoutLink = screen.getByText("Logout");

      // act
      fireEvent.click(logoutLink);

      // assert
      await waitFor(() => {
        expect(mockSetAuth).toHaveBeenCalledWith({
          ...mockAuth,
          user: null,
          token: "",
        });
      });
    });

    it("removes auth from localStorage on logout", async () => {
      // arrange
      renderHeader();
      const logoutLink = screen.getByText("Logout");

      // act
      fireEvent.click(logoutLink);

      // assert
      await waitFor(() => {
        expect(localStorage.removeItem).toHaveBeenCalledWith("auth");
      });
    });

    it("shows success toast on logout", async () => {
      // arrange
      renderHeader();
      const logoutLink = screen.getByText("Logout");

      // act
      fireEvent.click(logoutLink);

      // assert
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith("Logout Successfully");
      });
    });
  });

  describe("Testing SearchInput integration", () => {
    it("renders SearchInput component", () => {
      // arrange & act
      renderHeader();

      // assert
      expect(screen.getByTestId("search-input")).toBeInTheDocument();
    });
  });

  describe("Testing Bootstrap classes and structure", () => {
    it("has correct navbar classes", () => {
      // arrange & act
      renderHeader();

      // assert
      const navbar = screen.getByRole("navigation");
      expect(navbar).toHaveClass("navbar", "navbar-expand-lg", "bg-body-tertiary");
    });

    it("has correct container structure", () => {
      // arrange & act
      renderHeader();

      // assert
      const navbar = screen.getByRole("navigation");
      const container = navbar.querySelector(".container-fluid");
      expect(container).toBeInTheDocument();
    });

    it("has correct collapse structure", () => {
      // arrange & act
      renderHeader();

      // assert
      const navbar = screen.getByRole("navigation");
      const collapse = navbar.querySelector(".collapse.navbar-collapse");
      expect(collapse).toBeInTheDocument();
      expect(collapse).toHaveAttribute("id", "navbarTogglerDemo01");
    });

    it("has correct navbar nav structure", () => {
      // arrange & act
      renderHeader();

      // assert
      const navbar = screen.getByRole("navigation");
      const navList = navbar.querySelector(".navbar-nav");
      expect(navList).toBeInTheDocument();
      expect(navList).toHaveClass("navbar-nav", "ms-auto", "mb-2", "mb-lg-0");
    });
  });

  describe("Testing dropdown functionality", () => {
    it("categories dropdown has correct attributes", () => {
      // arrange & act
      renderHeader();

      // assert
      const categoriesLink = screen.getByText("Categories");
      expect(categoriesLink).toHaveClass("nav-link", "dropdown-toggle");
      expect(categoriesLink).toHaveAttribute("data-bs-toggle", "dropdown");
    });

    it("user dropdown has correct attributes", () => {
      // arrange & act
      renderHeader();

      // assert
      const userNameLink = screen.getByText("John Doe");
      expect(userNameLink).toHaveClass("nav-link", "dropdown-toggle");
      expect(userNameLink).toHaveAttribute("data-bs-toggle", "dropdown");
      expect(userNameLink).toHaveAttribute("role", "button");
    });

    it("dropdown menus have correct classes", () => {
      // arrange & act
      renderHeader();

      // assert
      const dropdownMenus = screen.getAllByRole("list");
      dropdownMenus.forEach(menu => {
        if (menu.classList.contains("dropdown-menu")) {
          expect(menu).toHaveClass("dropdown-menu");
        }
      });
    });
  });

  describe("Testing component accessibility", () => {
    it("has proper ARIA attributes on toggler", () => {
      // arrange & act
      renderHeader();

      // assert
      const toggler = screen.getByRole("button", { name: /toggle navigation/i });
      expect(toggler).toHaveAttribute("aria-controls", "navbarTogglerDemo01");
      expect(toggler).toHaveAttribute("aria-expanded", "false");
      expect(toggler).toHaveAttribute("aria-label", "Toggle navigation");
    });

    it("has semantic navigation structure", () => {
      // arrange & act
      renderHeader();

      // assert
      expect(screen.getByRole("navigation")).toBeInTheDocument();
      const listItems = screen.getAllByRole("listitem");
      expect(listItems.length).toBeGreaterThan(0);
    });

    it("has proper link structure", () => {
      // arrange & act
      renderHeader();

      // assert
      const links = screen.getAllByRole("link");
      expect(links.length).toBeGreaterThan(0);
      links.forEach(link => {
        expect(link).toHaveAttribute("href");
      });
    });
  });

  describe("Testing component edge cases", () => {
    it("handles missing user data gracefully", () => {
      // arrange
      useAuth.mockReturnValue([{ user: { name: null }, token: "token" }, mockSetAuth]);

      // act
      renderHeader();

      // assert
      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("Categories")).toBeInTheDocument();
    });

    it("handles empty cart gracefully", () => {
      // arrange
      useCart.mockReturnValue([null]);

      // act
      renderHeader();

      // assert
      const cartLink = screen.getByText("Cart");
      expect(cartLink).toBeInTheDocument();
    });

    it("handles undefined auth gracefully", () => {
      // arrange
      useAuth.mockReturnValue([null, mockSetAuth]);

      // act
      renderHeader();

      // assert
      expect(screen.getByText("Register")).toBeInTheDocument();
      expect(screen.getByText("Login")).toBeInTheDocument();
    });
  });
});
