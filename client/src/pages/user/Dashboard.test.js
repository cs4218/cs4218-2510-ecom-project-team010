import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Dashboard from "./Dashboard";

jest.mock("../../context/auth", () => ({
    useAuth: jest.fn(),
}));

jest.mock("../../components/UserMenu", () => () => (
    <div data-testid="mock-user-menu">Mocked UserMenu</div>
));

jest.mock("../../components/Layout", () => ({ children }) => (
    <div data-testid="mock-layout">{children}</div>
));

describe("Dashboard Page", () => {
    beforeEach(() => {
        const mockAuth = [
            {
                user: {
                    name: "John Doe",
                    email: "john@example.com",
                    address: "123 street",
                },
            },
        ];

        const { useAuth } = require("../../context/auth");
        useAuth.mockReturnValue(mockAuth);
    });

    test("renders Dashboard with user details", () => {
        render(
            <MemoryRouter>
                <Dashboard />
            </MemoryRouter>
        );

        expect(screen.getByTestId("mock-layout")).toBeInTheDocument();
        expect(screen.getByTestId("mock-user-menu")).toBeInTheDocument();

        expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
        expect(screen.getByText(/john@example.com/i)).toBeInTheDocument();
        expect(screen.getByText(/123 street/i)).toBeInTheDocument();
    });
});
