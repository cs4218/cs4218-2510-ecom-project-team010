import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";

/**
 * This file will be testing the interaction between the higher level module (AdminDashboard)
 * with the lower level dependency (AdminMenu). 
 * 
 * AdminMenu is the lowest level module in this tree.
 */


// SUTs
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminMenu from "./AdminMenu";

// --- Mock useAuth so AdminDashboard shows admin details ---
jest.mock("../context/auth", () => ({
    useAuth: () => ([
        {
            user: {
                name: "Alice Admin",
                email: "alice@admin.com",
                phone: "98765432",
                role: 1
            },
            token: "dummy"
        },
        jest.fn() // setAuth
    ])
}));

// Mock Layout 
jest.mock("./Layout", () => ({
    __esModule: true,
    default: ({ children, title }) => (
        <div data-testid="layout" data-title={title || ""}>
            {children}
        </div>
    ),
}));

function AdminOrders() {
    return <div aria-label="admin-orders-page">Admin Orders Page</div>;
}

function AppUnderTest({ initialPath = "/dashboard/admin" }) {
    return (
        <MemoryRouter initialEntries={[initialPath]}>
            <Routes>
                <Route path="/dashboard/admin" element={<AdminDashboard />} />
                <Route path="/dashboard/admin/orders" element={<AdminOrders />} />
                <Route path="/_menu" element={<AdminMenu />} />
            </Routes>
        </MemoryRouter>
    );
}

describe("AdminDashboard and AdminMenu integration", () => {
    it("renders AdminMenu inside AdminDashboard and shows admin details from useAuth", async () => {
        render(<AppUnderTest initialPath="/dashboard/admin" />);

        // AdminMenu heading present
        expect(screen.getByText("Admin Panel")).toBeInTheDocument();

        // Admin details fed by useAuth (integration with context)
        expect(screen.getByText(/Admin Name :/i)).toHaveTextContent("Alice Admin");
        expect(screen.getByText(/Admin Email :/i)).toHaveTextContent("alice@admin.com");
        expect(screen.getByText(/Admin Contact :/i)).toHaveTextContent("98765432");

        // Layout is wrapped
        expect(screen.getByTestId("layout")).toBeInTheDocument();
    });

    it("exposes the expected navigation links (URLs) in AdminMenu", async () => {
        render(<AppUnderTest initialPath="/_menu" />);

        const link = (text) => screen.getByRole("link", { name: text });

        expect(link("Create Category")).toHaveAttribute(
            "href",
            "/dashboard/admin/create-category"
        );
        expect(link("Create Product")).toHaveAttribute(
            "href",
            "/dashboard/admin/create-product"
        );
        expect(link("Products")).toHaveAttribute(
            "href",
            "/dashboard/admin/products"
        );
        expect(link("Orders")).toHaveAttribute(
            "href",
            "/dashboard/admin/orders"
        );
        expect(link("Users")).toHaveAttribute(
            "href",
            "/dashboard/admin/users"
        );
    });

    it("navigates to Admin Orders page when 'Orders' is clicked from the dashboard", async () => {
        render(<AppUnderTest initialPath="/dashboard/admin" />);

        // Click the Orders link inside AdminMenu
        await act(async () => {
            userEvent.click(screen.getByRole("link", { name: "Orders" }));
        });
        // We should now be on the Admin Orders page
        expect(screen.getByLabelText("admin-orders-page")).toBeInTheDocument();
    });
});
