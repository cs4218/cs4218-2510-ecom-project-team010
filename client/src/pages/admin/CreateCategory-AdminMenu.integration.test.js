import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { act } from "react-dom/test-utils";
import userEvent from "@testing-library/user-event";
import CreateCategory from "./CreateCategory";
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

jest.mock("../../components/Form/CategoryForm", () => ({
    __esModule: true,
    default: ({ handleSubmit, value, setValue,
    }) => (
        <form onSubmit={handleSubmit}>
        <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter category name"
            aria-label="category-input"
        />
        <button type="submit">Submit</button>
        </form>
    ),
}));

// Stub pages for navigation testing as these pages 
function ProductsPageStub() {
  return <h2 data-testid="products-page">Products Index</h2>;
}
function CreateProductStub() {
  return <h2 data-testid="create-product-page">Create Product Index</h2>;
}
function OrdersPageStub() {
  return <h2 data-testid="orders-page">Orders Index</h2>;
}
function UsersPageStub() {
  return <h2 data-testid="users-page">Users Index</h2>;
}

describe("Test integration between CreateCategory and AdminMenu", () => {
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
        mockedAxios.post.mockReset();
        mockedAxios.put.mockReset();
        mockedAxios.delete.mockReset();
    });

    test("Should render a functional Admin Menu on CreateCategory page and correctly navigates to products page when clicking the AdminMenu link", async () => {
        render(
            <MemoryRouter initialEntries={["/dashboard/admin/create-category"]}>
                <Routes>
                <Route
                    path="/dashboard/admin/create-category"
                    element={<CreateCategory />}
                />
                <Route
                    path="/dashboard/admin/products"
                    element={<ProductsPageStub />}
                />
                </Routes>
            </MemoryRouter>
        );

        // wait for CreateCategory page to load
        expect(await screen.findByRole("heading", { name: /manage category/i })).toBeInTheDocument();

        // navigate AdminMenu -> Products
        const productsLink = screen.getByRole("link", { name: /^products$/i });
        await act(async () => {
            userEvent.click(productsLink);
        });

        // asssert that we go to the stub page
        expect(await screen.findByTestId("products-page")).toBeInTheDocument();
    });

    test("Should render a functional Admin Menu on CreateCategory page and correctly navigates to orders page when clicking the AdminMenu link", async () => {
        render(
            <MemoryRouter initialEntries={["/dashboard/admin/create-category"]}>
                <Routes>
                <Route
                    path="/dashboard/admin/create-category"
                    element={<CreateCategory />}
                />
                <Route
                    path="/dashboard/admin/create-product"
                    element={<CreateProductStub />}
                />
                </Routes>
            </MemoryRouter>
        );

        // wait for CreateCategory page to load
        expect(await screen.findByRole("heading", { name: /manage category/i })).toBeInTheDocument();

        // navigate AdminMenu -> Create Product
        await act(async () => {
            userEvent.click(
                screen.getByRole("link", { name: /create product/i })
            );
        });

        // asssert that we go to the stub page 
        expect(await screen.findByTestId("create-product-page")).toBeInTheDocument();
    });

    test("Should render a functional Admin Menu on CreateCategory page and correctly navigates to orders page when clicking the AdminMenu link", async () => {
        render(
        <MemoryRouter initialEntries={["/dashboard/admin/create-category"]}>
            <Routes>
            <Route
                path="/dashboard/admin/create-category"
                element={<CreateCategory />}
            />
            <Route path="/dashboard/admin/orders" element={<OrdersPageStub />} />
            </Routes>
        </MemoryRouter>
        );

        // wait for CreateCategory page to load
        expect(await screen.findByRole("heading", { name: /manage category/i })).toBeInTheDocument();

        // navigate AdminMenu -> Orders
        await act(async () => {
        await userEvent.click(screen.getByRole("link", { name: /orders/i }));
        });

        // asssert that we go to the stub page 
        expect(await screen.findByTestId("orders-page")).toBeInTheDocument();
    });

    test("Should render a functional Admin Menu on CreateCategory page and correctly navigates to users page when clicking the AdminMenu link", async () => {
        render(
            <MemoryRouter initialEntries={["/dashboard/admin/create-category"]}>
                <Routes>
                    <Route
                        path="/dashboard/admin/create-category"
                        element={<CreateCategory />}
                    />
                    <Route path="/dashboard/admin/users" element={<UsersPageStub />} />
                </Routes>
            </MemoryRouter>
        );

        // wait for CreateCategory page to load
        expect(await screen.findByRole("heading", { name: /manage category/i })).toBeInTheDocument();

        // navigate AdminMenu -> Users
        await act(async () => {
            userEvent.click(screen.getByRole("link", { name: /^users$/i }));
        });

        // asssert that we go to the stub page 
        expect(await screen.findByTestId("users-page")).toBeInTheDocument();
    });

    test("Should render all AdminMenu links correctly from the CreateCategory page", async () => {
        // render create category page 
        render(
            <MemoryRouter initialEntries={["/dashboard/admin/create-category"]}>
                <Routes>
                    <Route
                        path="/dashboard/admin/create-category"
                        element={<CreateCategory />}
                    />
                </Routes>
            </MemoryRouter>
        );

        // wait for page to load
        expect(await screen.findByRole("heading", { name: /manage category/i })).toBeInTheDocument();

        // assert that all menu links are present and have the correct href attributes
        expect(screen.getByText("Admin Panel")).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /create category/i })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /create product/i })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /^products$/i })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /orders/i })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /^users$/i })).toBeInTheDocument();

        // assert that all links have correct href attributes
        expect(screen.getByRole("link", { name: /create category/i })).toHaveAttribute("href", "/dashboard/admin/create-category");
        expect(screen.getByRole("link", { name: /create product/i })).toHaveAttribute("href", "/dashboard/admin/create-product");
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
});