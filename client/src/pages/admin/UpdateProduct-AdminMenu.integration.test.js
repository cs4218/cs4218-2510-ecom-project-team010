import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { act } from "react-dom/test-utils";
import UpdateProduct from "./UpdateProduct";
import axios from "axios";
import toast from "react-hot-toast";

jest.mock("axios");
const mockedAxios = axios;

jest.mock("../../components/Layout", () => ({
  __esModule: true,
  default: (props) => <div data-testid="layout">{props.children}</div>,
}));

jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: { success: jest.fn(), error: jest.fn() },
  Toaster: () => null,
  success: jest.fn(),
  error: jest.fn(),
}));


jest.mock("antd", () => {
    const MockSelect = ({ children, onChange, placeholder, className }) => (
        <select
            data-testid={placeholder && placeholder.includes("category") ? "category-select" : "shipping-select"}
            className={className}
            onChange={(e) => onChange && onChange(e.target.value)}
        >
        <option value="">{placeholder}</option>
            {children}
        </select>
    );

    const MockOption = ({ children, value }) => (
        <option value={value}>{children}</option>
    );

    MockSelect.Option = MockOption;

    return {
        Select: MockSelect,
    };
});

// Stub pages for navigation testing
function CreateCategoryStub() {
  return <h2 data-testid="create-category-page">Create Category Index</h2>;
}
function CreateProductStub() {
  return <h2 data-testid="create-product-page">Create Product Index</h2>;
}
function ProductsPageStub() {
  return <h2 data-testid="products-page">Products Index</h2>;
}
function OrdersPageStub() {
  return <h2 data-testid="orders-page">Orders Index</h2>;
}
function UsersPageStub() {
  return <h2 data-testid="users-page">Users Index</h2>;
}

describe("Test integration between UpdateProduct and AdminMenu", () => {
  const mockCategories = [
    { _id: "cat1", name: "Electronics" },
    { _id: "cat2", name: "Clothing" },
  ];

  const mockProduct = {
    _id: "prod1",
    name: "Test Product",
    description: "Test Description",
    price: 100,
    quantity: 10,
    shipping: "1",
    category: { _id: "cat1", name: "Electronics" },
  };

  beforeEach(() => {
    jest.spyOn(console, "log").mockImplementation(() => {});
    global.URL.createObjectURL = jest.fn(() => "mock-url");
    global.window.confirm = jest.fn(() => true);

    mockedAxios.get.mockImplementation((url) => {
      if (url.includes("/api/v1/product/get-product/")) {
        return Promise.resolve({
          data: { product: mockProduct },
        });
      }
      if (url.includes("/api/v1/category/get-category")) {
        return Promise.resolve({
          data: { success: true, category: mockCategories },
        });
      }
      return Promise.resolve({ data: {} });
    });

    mockedAxios.put.mockResolvedValue({
      data: { success: true },
    });

    mockedAxios.delete.mockResolvedValue({
      data: { success: true },
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    mockedAxios.get.mockReset();
    mockedAxios.put.mockReset();
    mockedAxios.delete.mockReset();
  });

  test("Should render UpdateProduct page with product data loaded", async () => {
    render(
      <MemoryRouter initialEntries={["/dashboard/admin/product/test-slug"]}>
        <Routes>
          <Route
            path="/dashboard/admin/product/:slug"
            element={<UpdateProduct />}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(
      await screen.findByRole("heading", { name: /update product/i })
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Product Name")).toHaveValue(
        "Test Product"
      );
      expect(screen.getByPlaceholderText("Product Description")).toHaveValue(
        "Test Description"
      );
      expect(screen.getByPlaceholderText("Product Price")).toHaveValue(100);
      expect(screen.getByPlaceholderText("Product quantity")).toHaveValue(10);
    });
  });

  test("Should render a functional Admin Menu on UpdateProduct page and correctly navigates to create category page", async () => {
    render(
      <MemoryRouter initialEntries={["/dashboard/admin/product/test-slug"]}>
        <Routes>
          <Route
            path="/dashboard/admin/product/:slug"
            element={<UpdateProduct />}
          />
          <Route
            path="/dashboard/admin/create-category"
            element={<CreateCategoryStub />}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(
      await screen.findByRole("heading", { name: /update product/i })
    ).toBeInTheDocument();

    act(() => {
      fireEvent.click(
        screen.getByRole("link", { name: /create category/i })
      );
    });

    expect(
      await screen.findByTestId("create-category-page")
    ).toBeInTheDocument();
  });

  test("Should render a functional Admin Menu on UpdateProduct page and correctly navigates to create product page", async () => {
    render(
      <MemoryRouter initialEntries={["/dashboard/admin/product/test-slug"]}>
        <Routes>
          <Route
            path="/dashboard/admin/product/:slug"
            element={<UpdateProduct />}
          />
          <Route
            path="/dashboard/admin/create-product"
            element={<CreateProductStub />}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(
      await screen.findByRole("heading", { name: /update product/i })
    ).toBeInTheDocument();

    act(() => {
      fireEvent.click(
        screen.getByRole("link", { name: /create product/i })
      );
    });

    expect(
      await screen.findByTestId("create-product-page")
    ).toBeInTheDocument();
  });

  test("Should render a functional Admin Menu on UpdateProduct page and correctly navigates to products page", async () => {
    render(
      <MemoryRouter initialEntries={["/dashboard/admin/product/test-slug"]}>
        <Routes>
          <Route
            path="/dashboard/admin/product/:slug"
            element={<UpdateProduct />}
          />
          <Route
            path="/dashboard/admin/products"
            element={<ProductsPageStub />}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(
      await screen.findByRole("heading", { name: /update product/i })
    ).toBeInTheDocument();

    act(() => {
      fireEvent.click(screen.getByRole("link", { name: /^products$/i }));
    });

    expect(await screen.findByTestId("products-page")).toBeInTheDocument();
  });

  test("Should render a functional Admin Menu on UpdateProduct page and correctly navigates to orders page", async () => {
    render(
      <MemoryRouter initialEntries={["/dashboard/admin/product/test-slug"]}>
        <Routes>
          <Route
            path="/dashboard/admin/product/:slug"
            element={<UpdateProduct />}
          />
          <Route path="/dashboard/admin/orders" element={<OrdersPageStub />} />
        </Routes>
      </MemoryRouter>
    );

    expect(
      await screen.findByRole("heading", { name: /update product/i })
    ).toBeInTheDocument();

    act(() => {
      fireEvent.click(screen.getByRole("link", { name: /orders/i }));
    });

    expect(await screen.findByTestId("orders-page")).toBeInTheDocument();
  });

  test("Should render a functional Admin Menu on UpdateProduct page and correctly navigates to users page", async () => {
    render(
      <MemoryRouter initialEntries={["/dashboard/admin/product/test-slug"]}>
        <Routes>
          <Route
            path="/dashboard/admin/product/:slug"
            element={<UpdateProduct />}
          />
          <Route path="/dashboard/admin/users" element={<UsersPageStub />} />
        </Routes>
      </MemoryRouter>
    );

    expect(
      await screen.findByRole("heading", { name: /update product/i })
    ).toBeInTheDocument();

    act(() => {
      fireEvent.click(screen.getByRole("link", { name: /^users$/i }));
    });

    expect(await screen.findByTestId("users-page")).toBeInTheDocument();
  });

  test("Should render all AdminMenu links correctly from the UpdateProduct page", async () => {
    render(
      <MemoryRouter initialEntries={["/dashboard/admin/product/test-slug"]}>
        <Routes>
          <Route
            path="/dashboard/admin/product/:slug"
            element={<UpdateProduct />}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(
      await screen.findByRole("heading", { name: /update product/i })
    ).toBeInTheDocument();

    expect(screen.getByText("Admin Panel")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /create category/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /create product/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /^products$/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /orders/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^users$/i })).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: /create category/i })
    ).toHaveAttribute("href", "/dashboard/admin/create-category");
    expect(
      screen.getByRole("link", { name: /create product/i })
    ).toHaveAttribute("href", "/dashboard/admin/create-product");
    expect(screen.getByRole("link", { name: /^products$/i })).toHaveAttribute(
      "href",
      "/dashboard/admin/products"
    );
    expect(screen.getByRole("link", { name: /orders/i })).toHaveAttribute(
      "href",
      "/dashboard/admin/orders"
    );
    expect(screen.getByRole("link", { name: /^users$/i })).toHaveAttribute(
      "href",
      "/dashboard/admin/users"
    );
  });

  test("Should successfully update product and navigate to products page", async () => {
    render(
      <MemoryRouter initialEntries={["/dashboard/admin/product/test-slug"]}>
        <Routes>
          <Route
            path="/dashboard/admin/product/:slug"
            element={<UpdateProduct />}
          />
          <Route
            path="/dashboard/admin/products"
            element={<ProductsPageStub />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Product Name")).toHaveValue(
        "Test Product"
      );
    });

    const nameInput = screen.getByPlaceholderText("Product Name");
    fireEvent.change(nameInput, { target: { value: "Updated Product" } });

    const updateButton = screen.getByRole("button", {
      name: /update product/i,
    });

    act(() => {
      fireEvent.click(updateButton);
    });

    await waitFor(() => {
      expect(mockedAxios.put).toHaveBeenCalledWith(
        "/api/v1/product/update-product/prod1",
        expect.any(FormData)
      );
      expect(toast.success).toHaveBeenCalledWith(
        "Product Updated Successfully"
      );
    });

    expect(await screen.findByTestId("products-page")).toBeInTheDocument();
  });

  test("Should successfully delete product and navigate to products page", async () => {
    render(
      <MemoryRouter initialEntries={["/dashboard/admin/product/test-slug"]}>
        <Routes>
          <Route
            path="/dashboard/admin/product/:slug"
            element={<UpdateProduct />}
          />
          <Route
            path="/dashboard/admin/products"
            element={<ProductsPageStub />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Product Name")).toHaveValue(
        "Test Product"
      );
    });

    const deleteButton = screen.getByRole("button", {
      name: /delete product/i,
    });

    act(() => {
      fireEvent.click(deleteButton);
    });

    await waitFor(() => {
      expect(mockedAxios.delete).toHaveBeenCalledWith(
        "/api/v1/product/delete-product/prod1"
      );
      expect(toast.success).toHaveBeenCalledWith(
        "Product Deleted Successfully"
      );
    });

    expect(await screen.findByTestId("products-page")).toBeInTheDocument();
  });

  test("Should handle update failure with error toast", async () => {
    mockedAxios.put.mockResolvedValueOnce({
      data: { success: false, message: "Update failed" },
    });

    render(
      <MemoryRouter initialEntries={["/dashboard/admin/product/test-slug"]}>
        <Routes>
          <Route
            path="/dashboard/admin/product/:slug"
            element={<UpdateProduct />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Product Name")).toHaveValue(
        "Test Product"
      );
    });

    const updateButton = screen.getByRole("button", {
      name: /update product/i,
    });

    act(() => {
      fireEvent.click(updateButton);
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Update failed");
    });
  });

  test("Should not delete product when user cancels confirmation", async () => {
    global.window.confirm = jest.fn(() => false);

    render(
      <MemoryRouter initialEntries={["/dashboard/admin/product/test-slug"]}>
        <Routes>
          <Route
            path="/dashboard/admin/product/:slug"
            element={<UpdateProduct />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Product Name")).toHaveValue(
        "Test Product"
      );
    });

    const deleteButton = screen.getByRole("button", {
      name: /delete product/i,
    });

    act(() => {
      fireEvent.click(deleteButton);
    });

    expect(mockedAxios.delete).not.toHaveBeenCalled();
  });
});