import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { act } from "react-dom/test-utils";
import userEvent from "@testing-library/user-event";
import AdminOrders from "./AdminOrders";

// arrange
// mock modules on the same level as AdminMenu
// allows us to focus on the interaction between the 
// products page and read AdminMenu component
import axios from "axios";
jest.mock("axios");
const mockedAxios = axios;

jest.mock("../../components/Layout", () => ({
  __esModule: true,
  default: (props) => <div data-testid="layout">{props.children}</div>,
}));

jest.mock("react-hot-toast", () => ({
  __esModule: true,
  Toaster: () => null,
  success: jest.fn(),
  error: jest.fn(),
}));

jest.mock("../../context/auth", () => ({
  __esModule: true,
  useAuth: () => [{ token: "test-token" }, jest.fn()],
}));

// stubbed as these other pages are on the same level as admin orders page
// ensures that functionality of admin menu component and product page
// can be tested accurately even if other page has issues.
function ProductsPageStub() {
  return <h2 data-testid="products-page">Products Index</h2>;
}
function CreateCategoryStub() {
  return <h2 data-testid="create-category-page">Create Category Index</h2>;
}
function CreateProductStub() {
  return <h2 data-testid="create-product-page">Create Product Index</h2>;
}
function UsersPageStub() {
  return <h2 data-testid="users-page">Users Index</h2>;
}

describe("Integration: AdminOrders ↔ AdminMenu", () => {
  beforeEach(() => {
    jest.spyOn(console, "log").mockImplementation(() => {});
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes("/api/v1/auth/all-orders")) {
        return Promise.resolve({
          data: [
            {
              _id: "o1",
              status: "Not Processed",
              buyer: { name: "Jane" },
              createdAt: new Date().toISOString(),
              payment: { success: true },
              products: [
                { _id: "p1", name: "Sample", description: "A nice thing", price: 12.34 },
              ],
            },
          ],
        });
      }
      return Promise.resolve({ data: {} });
    });
    mockedAxios.put?.mockResolvedValue?.({ data: { ok: true } });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    mockedAxios.get.mockReset();
    mockedAxios.put?.mockReset?.();
  });

it("A functional AdminMenu component renders on AdminOrders page and correctly navigates to Products page when clicking the AdminMenu link", async () => {
    render(
      <MemoryRouter initialEntries={["/dashboard/admin/orders"]}>
        <Routes>
          <Route path="/dashboard/admin/orders" element={<AdminOrders />} />
          <Route path="/dashboard/admin/products" element={<ProductsPageStub />} />
        </Routes>
      </MemoryRouter>
    );

    // ensure the order page loads before testing
    expect(await screen.findByRole("heading", { name: /all orders/i })).toBeInTheDocument();

    // navigate to product page using admin menu
    const productsLink = screen.getByRole("link", { name: /products/i });
    await act(async () => {
    await userEvent.click(productsLink);
  });

    // assert product page is rendered
    expect(await screen.findByTestId("products-page")).toBeInTheDocument();
  });

  it("A functional AdminMenu component renders on AdminOrders page and correctly navigates to create category page when clicking the AdminMenu link", async () => {
  render(
    <MemoryRouter initialEntries={["/dashboard/admin/orders"]}>
      <Routes>
        <Route path="/dashboard/admin/orders" element={<AdminOrders />} />
        <Route path="/dashboard/admin/create-category" element={<CreateCategoryStub />} />
      </Routes>
    </MemoryRouter>
  );

  // wait for AdminOrders to load
  expect(await screen.findByRole("heading", { name: /all orders/i })).toBeInTheDocument();

  // click AdminMenu -> Create Category
  await act(async () => {
    await userEvent.click(screen.getByRole("link", { name: /create category/i }));
  });

  // landed on stub page
  expect(await screen.findByTestId("create-category-page")).toBeInTheDocument();
});

it("A functional AdminMenu component renders on AdminOrders page and correctly navigates to create product page when clicking the AdminMenu link", async () => {
  render(
    <MemoryRouter initialEntries={["/dashboard/admin/orders"]}>
      <Routes>
        <Route path="/dashboard/admin/orders" element={<AdminOrders />} />
        <Route path="/dashboard/admin/create-product" element={<CreateProductStub />} />
      </Routes>
    </MemoryRouter>
  );

  // wait for adminorders page to load
  expect(await screen.findByRole("heading", { name: /all orders/i })).toBeInTheDocument();

  // click AdminMenu -> Create Product
  await act(async () => {
    await userEvent.click(screen.getByRole("link", { name: /create product/i }));
  });

  // landed on stub page
  expect(await screen.findByTestId("create-product-page")).toBeInTheDocument();
});

it("A functional AdminMenu component renders on AdminOrders page and correctly navigates to users page when clicking the AdminMenu link", async () => {
  render(
    <MemoryRouter initialEntries={["/dashboard/admin/orders"]}>
      <Routes>
        <Route path="/dashboard/admin/orders" element={<AdminOrders />} />
        <Route path="/dashboard/admin/users" element={<UsersPageStub />} />
      </Routes>
    </MemoryRouter>
  );

  // wait for adminorders page to load
  expect(await screen.findByRole("heading", { name: /all orders/i })).toBeInTheDocument();

  // click AdminMenu -> Users
  await act(async () => {
    await userEvent.click(screen.getByRole("link", { name: /^users$/i }));
  });

  // landed on stub page 
  expect(await screen.findByTestId("users-page")).toBeInTheDocument();
});

});