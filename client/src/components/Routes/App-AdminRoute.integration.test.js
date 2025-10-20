import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import App from "../../App";
import { AuthProviderTest } from "../../context/auth";

/**
 * This file will be testing the interaction between the higher level module (App)
 * with the lower level dependency (AdminRoute).
 * 
 * This is using the top down approach, so all lower level dependencies (for example,
 * AdminDashboard), will be mocked.  
 */

// Mock Spinner (avoid async DOM updates from animation)
jest.mock("../../components/Spinner", () => {
    const React = require("react");
    return {
        __esModule: true,
        default: () => React.createElement("div", { "data-testid": "spinner" }, "Loading..."),
    };
});

// Mock context (simulate auth provider)
jest.mock("../../context/auth", () => {
    const React = require("react");
    const AuthCtx = React.createContext();
    const useAuth = () => React.useContext(AuthCtx);

    // Helper provider to inject auth values in each test
    const AuthProviderTest = ({ value, children }) => (
        <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
    );

    return { useAuth, AuthProviderTest };
});

// Mock the downstream component (AdminDashboard)
jest.mock("../../pages/admin/AdminDashboard", () => {
    const React = require("react");
    return {
        __esModule: true,
        default: () => React.createElement("div", { "data-testid": "admin-dashboard" }, "Admin Dashboard"),
    }
});

jest.mock("../../pages/admin/CreateCategory", () => () => <div />);
jest.mock("../../pages/admin/CreateProduct", () => () => <div />);
jest.mock("../../pages/admin/Products", () => () => <div />);
jest.mock("../../pages/admin/Users", () => () => <div />);
jest.mock("../../pages/admin/AdminOrders", () => () => <div />);

jest.mock("axios");

const renderWithAuthAndPath = ({ initialPath, authValue }) => {
    return render(
        <AuthProviderTest value={authValue}>
            <MemoryRouter initialEntries={[initialPath]}>
                <App />
            </MemoryRouter>
        </AuthProviderTest>
    );
};

describe("App and AdminRoute integration", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders Spinner while waiting for admin-auth response", async () => {
        axios.get.mockResolvedValueOnce(new Promise(() => { })); // never resolves

        renderWithAuthAndPath({
            initialPath: "/dashboard/admin",
            authValue: [{ token: "fake-token", user: { role: 1 } }, jest.fn()],
        });

        expect(screen.getByTestId("spinner")).toBeInTheDocument();
    });

    it("renders AdminDashboard when /api/v1/auth/admin-auth returns ok: true", async () => {
        axios.get.mockResolvedValueOnce({ data: { ok: true } });

        renderWithAuthAndPath({
            initialPath: "/dashboard/admin",
            authValue: [{ token: "fake-token", user: { role: 1 } }, jest.fn()],
        });

        // Spinner appears first
        expect(screen.getByTestId("spinner")).toBeInTheDocument();

        // Wait for dashboard to render after successful auth
        await waitFor(() => {
            expect(screen.getByTestId("admin-dashboard")).toBeInTheDocument();
        });
    });

    it("renders Spinner when /api/v1/auth/admin-auth returns ok: false", async () => {
        axios.get.mockResolvedValueOnce({ data: { ok: false } });

        renderWithAuthAndPath({
            initialPath: "/dashboard/admin",
            authValue: [{ token: "fake-token", user: { role: 1 } }, jest.fn()],
        });

        // Wait for state update
        await waitFor(() => {
            expect(screen.getByTestId("spinner")).toBeInTheDocument();
        });

        expect(screen.queryByTestId("admin-dashboard")).not.toBeInTheDocument();
    });

    it("does not call admin-auth when no token (unauthenticated user)", async () => {
        renderWithAuthAndPath({
            initialPath: "/dashboard/admin",
            authValue: [{ token: null, user: null }, jest.fn()],
        });

        expect(axios.get).not.toHaveBeenCalled();
        expect(screen.getByTestId("spinner")).toBeInTheDocument();
    });
});
