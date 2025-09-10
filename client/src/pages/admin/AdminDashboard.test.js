import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminDashboard from "./AdminDashboard";

jest.mock("../../context/auth", () => ({
    useAuth: jest.fn(),
}));

jest.mock("../../components/AdminMenu", () => () => (
    <div data-testid="admin-menu">Mocked AdminMenu</div>
));

jest.mock("../../components/Layout", () => ({ children }) => (
    <div data-testid="layout">{children}</div>
));

describe("AdminDashboard Page", () => {
    beforeEach(() => {
        const mockAuth = [
            {
                user: {
                    name: "John Doe",
                    email: "john@example.com",
                    phone: "1234567890",
                },
            },
        ];

        const { useAuth } = require("../../context/auth");
        useAuth.mockReturnValue(mockAuth);
    });

    test("renders AdminDashboard with admin details", () => {
        render(
            <MemoryRouter>
                <AdminDashboard />
            </MemoryRouter>
        );

        expect(screen.getByTestId("layout")).toBeInTheDocument();
        expect(screen.getByTestId("admin-menu")).toBeInTheDocument();

        expect(screen.getByText(/Admin Name : John Doe/i)).toBeInTheDocument();
        expect(screen.getByText(/Admin Email : john@example.com/i)).toBeInTheDocument();
        expect(screen.getByText(/Admin Contact : 1234567890/i)).toBeInTheDocument();
    });
});
