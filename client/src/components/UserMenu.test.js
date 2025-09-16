import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import UserMenu from "./UserMenu";

describe("UserMenu Component", () => {
    test("renders the Dashboard heading", () => {
        render(
            <MemoryRouter>
                <UserMenu />
            </MemoryRouter>
        );

        expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    });

    test("renders all navigation links with correct text and paths", () => {
        render(
            <MemoryRouter>
                <UserMenu />
            </MemoryRouter>
        );

        const links = [
            { text: "Profile", path: "/dashboard/user/profile" },
            { text: "Orders", path: "/dashboard/user/orders" },
        ];

        links.forEach(({ text, path }) => {
            const link = screen.getByText(text);
            expect(link).toBeInTheDocument();
            expect(link).toHaveAttribute("href", path);
        });
    });
});
