import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminMenu from "./AdminMenu";

describe("AdminMenu Component", () => {
    test("renders the Admin Panel heading", () => {
        render(
            <MemoryRouter>
                <AdminMenu />
            </MemoryRouter>
        );

        expect(screen.getByText(/Admin Panel/i)).toBeInTheDocument();
    });

    test("renders all navigation links with correct text and paths", () => {
        render(
            <MemoryRouter>
                <AdminMenu />
            </MemoryRouter>
        );

        const links = [
            { text: "Create Category", path: "/dashboard/admin/create-category" },
            { text: "Create Product", path: "/dashboard/admin/create-product" },
            { text: "Products", path: "/dashboard/admin/products" },
            { text: "Orders", path: "/dashboard/admin/orders" },
        ];

        links.forEach(({ text, path }) => {
            const link = screen.getByText(text);
            expect(link).toBeInTheDocument();
            expect(link).toHaveAttribute("href", path);
        });
    });
});
