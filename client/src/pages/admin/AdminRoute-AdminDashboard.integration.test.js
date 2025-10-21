import React from "react";
import axios from "axios";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";

import AdminRoute from "../../components/Routes/AdminRoute"; // real
import AdminDashboard from "./AdminDashboard"; // real
import { AuthProviderTest } from "../../context/auth";

/**
 * This file will be testing the interaction between the higher level module (AdminRoute)
 * with the lower level dependency (AdminDashboard).
 * 
 * This is using the top down approach, so all lower level dependencies (for example,
 * AdminMenu), will be mocked.  
 */

jest.mock("axios");

jest.mock("../../components/Layout", () => {
    const React = require("react");
    return {
        __esModule: true,
        default: ({ children }) =>
            React.createElement("div", { "data-testid": "layout" }, children),
    };
});

jest.mock("../../components/Spinner", () => {
    const React = require("react");
    return {
        __esModule: true,
        default: () =>
            React.createElement("div", { "data-testid": "spinner" }, "Loading..."),
    };
});

// Stub AdminMenu 
jest.mock("../../components/AdminMenu", () => {
    const React = require("react");
    return {
        __esModule: true,
        default: () =>
            React.createElement("nav", { "data-testid": "admin-menu-stub" }, "AdminMenu"),
    };
});

jest.mock("../../context/auth", () => {
    const React = require("react");
    const Ctx = React.createContext();
    const useAuth = () => React.useContext(Ctx);
    const AuthProviderTest = ({ value, children }) =>
        React.createElement(Ctx.Provider, { value }, children);
    return { useAuth, AuthProviderTest };
});

const renderWithRouterAndAuth = ({
    initialPath = "/dashboard/admin",
    authValue = [{ token: "t", user: { name: "Admin A", email: "a@a.com", phone: "123" } }, jest.fn()],
}) => {
    return render(
        <AuthProviderTest value={authValue}>
            <MemoryRouter initialEntries={[initialPath]}>
                <Routes>
                    {/* Match the app shape: AdminRoute wraps /dashboard/admin */}
                    <Route path="/dashboard" element={<AdminRoute />}>
                        <Route path="admin" element={<AdminDashboard />} />
                    </Route>
                </Routes>
            </MemoryRouter>
        </AuthProviderTest>
    );
};

// ---------------- Tests ----------------
describe("AdminRoute and AdminDashboard integration", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("shows Spinner while waiting for /admin-auth", async () => {
        // never resolve -> stays loading
        axios.get.mockImplementationOnce(() => new Promise(() => { }));

        renderWithRouterAndAuth({
            authValue: [{ token: "fake-token", user: { name: "Admin", email: "x", phone: "y" } }, jest.fn()],
        });

        expect(screen.getByTestId("spinner")).toBeInTheDocument();
    });

    it("renders AdminDashboard when /admin-auth returns ok: true", async () => {
        axios.get.mockResolvedValueOnce({ data: { ok: true } });

        renderWithRouterAndAuth({
            authValue: [{ token: "fake-token", user: { name: "Admin Joe", email: "admin@ex.com", phone: "999" } }, jest.fn()],
        });

        // spinner first
        expect(screen.getByTestId("spinner")).toBeInTheDocument();

        // then dashboard should appear with Admin details from useAuth()
        await waitFor(() => {
            expect(screen.getByText(/Admin Joe/i)).toBeInTheDocument();
            expect(screen.getByText(/admin@ex\.com/i)).toBeInTheDocument();
            expect(screen.getByText(/999/i)).toBeInTheDocument();
        });

        // AdminMenu is stubbed, but should still render
        expect(screen.getByTestId("admin-menu-stub")).toBeInTheDocument();
    });

    it("keeps Spinner (no dashboard) when /admin-auth returns ok: false", async () => {
        axios.get.mockResolvedValueOnce({ data: { ok: false } });

        renderWithRouterAndAuth({
            authValue: [{ token: "fake-token", user: { name: "Admin", email: "x", phone: "y" } }, jest.fn()],
        });

        await waitFor(() => {
            expect(screen.getByTestId("spinner")).toBeInTheDocument();
        });

        // Dashboard should not be visible
        expect(screen.queryByText(/Admin Name/i)).not.toBeInTheDocument();
    });

    it("does not call /admin-auth when there is no token (unauthenticated)", async () => {
        renderWithRouterAndAuth({
            authValue: [{ token: null, user: null }, jest.fn()],
        });

        expect(axios.get).not.toHaveBeenCalled();
        expect(screen.getByTestId("spinner")).toBeInTheDocument();
    });
});
