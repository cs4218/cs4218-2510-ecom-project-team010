import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { act } from "react-dom/test-utils";
import userEvent from "@testing-library/user-event";
import CreateProduct from "./CreateProduct";
import axios from "axios";

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

// Stub pages for navigation testing
function CreateCategoryStub() {
  return <h2 data-testid="create-category-page">Create Category Index</h2>;
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

describe("Test integration between CreateProduct and AdminMenu", () => {
  const mockCategories = [
    { _id: "1", name: "Electronics" },
    { _id: "2", name: "Clothing" },
  ];

  beforeEach(() => {
    jest.spyOn(console, "log").mockImplementation(() => {});
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes("/api/v1/category/get-category")) {
        return Promise.resolve({
          data: { success: true, category: mockCategories },
        });
      }
      return Promise.resolve({ data: {} });
    });
    mockedAxios.post.mockResolvedValue({
      data: { success: true },
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    mockedAxios.get.mockReset();
    mockedAxios.post.mockReset();
  });

  test("Should render a functional Admin Menu on CreateProduct page and correctly navigates to create category page when clicking the AdminMenu link", async () => {
    render(
      <MemoryRouter initialEntries={["/dashboard/admin/create-product"]}>
        <Routes>
          <Route
            path="/dashboard/admin/create-product"
            element={<CreateProduct />}
          />
          <Route
            path="/dashboard/admin/create-category"
            element={<CreateCategoryStub />}
          />
        </Routes>
      </MemoryRouter>
    );

    // wait for CreateProduct page to load
    expect(
      await screen.findByRole("heading", { name: /create product/i })
    ).toBeInTheDocument();

    // navigate AdminMenu -> Create Category
    const createCategoryLink = screen.getByRole("link", {
      name: /create category/i,
    });
    await act(async () => {
      userEvent.click(createCategoryLink);
    });

    // assert that we go to the stub page
    expect(
      await screen.findByTestId("create-category-page")
    ).toBeInTheDocument();
  });

  test("Should render a functional Admin Menu on CreateProduct page and correctly navigates to products page when clicking the AdminMenu link", async () => {
    render(
      <MemoryRouter initialEntries={["/dashboard/admin/create-product"]}>
        <Routes>
          <Route
            path="/dashboard/admin/create-product"
            element={<CreateProduct />}
          />
          <Route
            path="/dashboard/admin/products"
            element={<ProductsPageStub />}
          />
        </Routes>
      </MemoryRouter>
    );

    // wait for CreateProduct page to load
    expect(
      await screen.findByRole("heading", { name: /create product/i })
    ).toBeInTheDocument();

    // navigate AdminMenu -> Products
    await act(async () => {
      userEvent.click(
        screen.getByRole("link", { name: /^products$/i })
      );
    });

    // assert that we go to the stub page
    expect(await screen.findByTestId("products-page")).toBeInTheDocument();
  });

  test("Should render a functional Admin Menu on CreateProduct page and correctly navigates to orders page when clicking the AdminMenu link", async () => {
    render(
      <MemoryRouter initialEntries={["/dashboard/admin/create-product"]}>
        <Routes>
          <Route
            path="/dashboard/admin/create-product"
            element={<CreateProduct />}
          />
          <Route
            path="/dashboard/admin/orders"
            element={<OrdersPageStub />}
          />
        </Routes>
      </MemoryRouter>
    );

    // wait for CreateProduct page to load
    expect(
      await screen.findByRole("heading", { name: /create product/i })
    ).toBeInTheDocument();

    // navigate AdminMenu -> Orders
    await act(async () => {
      await userEvent.click(screen.getByRole("link", { name: /orders/i }));
    });

    // assert that we go to the stub page
    expect(await screen.findByTestId("orders-page")).toBeInTheDocument();
  });

  test("Should render a functional Admin Menu on CreateProduct page and correctly navigates to users page when clicking the AdminMenu link", async () => {
    render(
      <MemoryRouter initialEntries={["/dashboard/admin/create-product"]}>
        <Routes>
          <Route
            path="/dashboard/admin/create-product"
            element={<CreateProduct />}
          />
          <Route
            path="/dashboard/admin/users"
            element={<UsersPageStub />}
          />
        </Routes>
      </MemoryRouter>
    );

    // wait for CreateProduct page to load
    expect(
      await screen.findByRole("heading", { name: /create product/i })
    ).toBeInTheDocument();

    // navigate AdminMenu -> Users
    await act(async () => {
      userEvent.click(screen.getByRole("link", { name: /^users$/i }));
    });

    // assert that we go to the stub page
    expect(await screen.findByTestId("users-page")).toBeInTheDocument();
  });

  test("Should render all AdminMenu links correctly from the CreateProduct page", async () => {
    // render create product page
    render(
      <MemoryRouter initialEntries={["/dashboard/admin/create-product"]}>
        <Routes>
          <Route
            path="/dashboard/admin/create-product"
            element={<CreateProduct />}
          />
        </Routes>
      </MemoryRouter>
    );

    // wait for page to load
    expect(
      await screen.findByRole("heading", { name: /create product/i })
    ).toBeInTheDocument();

    // assert that all menu links are present and have the correct href attributes
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

    // assert that all links have correct href attributes
    expect(
      screen.getByRole("link", { name: /create category/i })
    ).toHaveAttribute("href", "/dashboard/admin/create-category");
    expect(
      screen.getByRole("link", { name: /create product/i })
    ).toHaveAttribute("href", "/dashboard/admin/create-product");
    expect(
      screen.getByRole("link", { name: /^products$/i })
    ).toHaveAttribute("href", "/dashboard/admin/products");
    expect(screen.getByRole("link", { name: /orders/i })).toHaveAttribute(
      "href",
      "/dashboard/admin/orders"
    );
    expect(screen.getByRole("link", { name: /^users$/i })).toHaveAttribute(
      "href",
      "/dashboard/admin/users"
    );
  });
});