import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Users from "./Users";


jest.mock("../../components/AdminMenu", () => () => (
    <div data-testid="mock-admin-menu">Mocked AdminMenu</div>
));

jest.mock("../../components/Layout", () => ({ children }) => (
    <div data-testid="mock-layout">{children}</div>
));

describe("Users Page", () => {
    test("renders Users page with admin menu", () => {
        render(
            <MemoryRouter>
                <Users />
            </MemoryRouter>
        );

        expect(screen.getByTestId("mock-layout")).toBeInTheDocument();
        expect(screen.getByTestId("mock-admin-menu")).toBeInTheDocument();

        expect(screen.getByText(/All Users/i)).toBeInTheDocument();
    });
});