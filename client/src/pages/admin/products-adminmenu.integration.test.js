import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { act } from "react-dom/test-utils";
import userEvent from "@testing-library/user-event";
import Products from "./Products";

// arrange
// mock modules on the same level as AdminMenu.
// allows us to focus on the interaction between the 
// products page and the AdminMenu component
import axios from "axios";
jest.mock("axios");
const mockedAxios = axios;

jest.mock("../../components/Layout", () => ({
  __esModule: true,
  default: ({ children }) => <div data-testid="layout">{children}</div>,
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

// stubbed as these other pages are on the same level as products page
// ensures that functionality of admin menu component and product page
// can be tested accurately even if other page has issues.
function OrdersPageStub() {
  return <h2 data-testid="orders-page">Orders Index</h2>;
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

describe("Integration: Products page and AdminMenu", () => {
  beforeEach(() => {
    jest.spyOn(console, "log").mockImplementation(() => {});

    mockedAxios.get.mockImplementation((url) => {
      if (url.includes("/api/v1/product/get-product")) {
        return Promise.resolve({
          data: {
            success: true,
            products: [
              {
                _id: "p1",
                name: "Apple Watch",
                slug: "apple-watch",
                description: "A nice watch",
                price: 299,
              },
              {
                _id: "p2",
                name: "Pixel",
                slug: "pixel",
                description: "A neat phone",
                price: 699,
              },
            ],
          },
        });
      }
      return Promise.resolve({ data: {} });
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    mockedAxios.get.mockReset();
  });

  it("renders real AdminMenu inside Products and navigates to Orders via its link on the menu.", async () => {
    render(
      <MemoryRouter initialEntries={["/dashboard/admin/products"]}>
        <Routes>
          <Route path="/dashboard/admin/products" element={<Products />} />
          <Route path="/dashboard/admin/orders" element={<OrdersPageStub />} />
        </Routes>
      </MemoryRouter>
    );

    // Products page loads and shows heading
    expect(
      await screen.findByRole("heading", { name: /all products list/i })
    ).toBeInTheDocument();

    // Assert real AdminMenu content is present 
    expect(screen.getByRole("heading", { name: /admin panel/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /create category/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /create product/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^products$/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^orders$/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^users$/i })).toBeInTheDocument();

    // assert admin menu is functional and navigates to orders page
    const ordersLink = screen.getByRole("link", { name: /^orders$/i });
    await act(async () => {
      await userEvent.click(ordersLink);
    });

    // landed on stubbed page
    expect(await screen.findByTestId("orders-page")).toBeInTheDocument();
  });

  it("renders real AdminMenu inside Products and navigates to create category page via its link on the menu.", async () => {
    render(
        <MemoryRouter initialEntries={["/dashboard/admin/products"]}>
        <Routes>
            <Route path="/dashboard/admin/products" element={<Products />} />
            <Route path="/dashboard/admin/create-category" element={<CreateCategoryStub />} />
        </Routes>
        </MemoryRouter>
    );

    // wait for Products page to load
    expect(await screen.findByRole("heading", { name: /all products list/i })).toBeInTheDocument();

    // click "Create Category"
    await act(async () => {
        await userEvent.click(screen.getByRole("link", { name: /create category/i }));
    });

    // landed on stub page
    expect(await screen.findByTestId("create-category-page")).toBeInTheDocument();
});

it("renders real AdminMenu inside Products and navigates to create product page via its link on the menu.", async () => {
    render(
        <MemoryRouter initialEntries={["/dashboard/admin/products"]}>
        <Routes>
            <Route path="/dashboard/admin/products" element={<Products />} />
            <Route path="/dashboard/admin/create-product" element={<CreateProductStub />} />
        </Routes>
        </MemoryRouter>
    );

    // wait for product page to load 
    expect(await screen.findByRole("heading", { name: /all products list/i })).toBeInTheDocument();

    // click "Create Product"
    await act(async () => {
        await userEvent.click(screen.getByRole("link", { name: /create product/i }));
    });

    // landed on stub page
    expect(await screen.findByTestId("create-product-page")).toBeInTheDocument();
});

it("renders real AdminMenu inside Products and stays in products page via its link on the menu.", async () => {
    render(
        <MemoryRouter initialEntries={["/dashboard/admin/products"]}>
        <Routes>
            <Route path="/dashboard/admin/products" element={<Products />} />
        </Routes>
        </MemoryRouter>
    );

    // initial products page
    const heading = await screen.findByRole("heading", { name: /all products list/i });
    expect(heading).toBeInTheDocument();

    // click "Products" link (should remain on same page)
    await act(async () => {
        await userEvent.click(screen.getByRole("link", { name: /^products$/i }));
    });

    // still on products page (heading still present)
    expect(await screen.findByRole("heading", { name: /all products list/i })).toBeInTheDocument();
});

it("renders real AdminMenu inside Products and navigates to user page via its link on the menu.", async () => {
  render(
    <MemoryRouter initialEntries={["/dashboard/admin/products"]}>
      <Routes>
        <Route path="/dashboard/admin/products" element={<Products />} />
        <Route path="/dashboard/admin/users" element={<UsersPageStub />} />
      </Routes>
    </MemoryRouter>
  );

  // initial products page
  expect(await screen.findByRole("heading", { name: /all products list/i })).toBeInTheDocument();

  // click "Users" link
  await act(async () => {
    await userEvent.click(screen.getByRole("link", { name: /^users$/i }));
  });

  // landed on stub page
  expect(await screen.findByTestId("users-page")).toBeInTheDocument();
});
});