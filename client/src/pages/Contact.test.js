import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Contact from "./Contact";

jest.mock("./../components/Layout", () => ({ children, title }) => (
    <div data-testid="layout" data-title={title}>
        {children}
    </div>
));

jest.mock("react-icons/bi", () => ({
    BiMailSend: () => <span data-testid="icon-mail" />,
    BiPhoneCall: () => <span data-testid="icon-phone" />,
    BiSupport: () => <span data-testid="icon-support" />,
}));


describe("Contact Page", () => {
    test("renders Layout with correct title", () => {
        render(
            <MemoryRouter>
                <Contact />
            </MemoryRouter>
        );
        const layout = screen.getByTestId("layout");
        expect(layout).toBeInTheDocument();
        expect(layout).toHaveAttribute("data-title", "Contact us");
    });

    test("renders image with correct src and alt", () => {
        render(
            <MemoryRouter>
                <Contact />
            </MemoryRouter>
        );
        const img = screen.getByAltText("contactus");
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute("src", "/images/contactus.jpeg");
        expect(img).toHaveAttribute("alt", "contactus");
    });

    test("renders contact info text", () => {
        render(
            <MemoryRouter>
                <Contact />
            </MemoryRouter>
        );
        expect(
            screen.getByText(/For any query or info about product, feel free to call anytime. We are available 24X7./i)
        ).toBeInTheDocument();
        expect(
            screen.getByText(/www.help@ecommerceapp.com/i)
        ).toBeInTheDocument();
        expect(screen.getByText(/012-3456789/i)).toBeInTheDocument();
        expect(screen.getByText(/1800-0000-0000/i)).toBeInTheDocument();
    });
});
