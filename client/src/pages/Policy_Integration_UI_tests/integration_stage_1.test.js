import React from "react";
import { render, screen, waitFor } from "@testing-library/react"; // <-- add waitFor
import Policy from "./../Policy";

// Use real Layout, but stub its heavy children
jest.mock("../../components/Header", () => () => <div data-testid="header" />);
jest.mock("../../components/Footer", () => () => <div data-testid="footer" />);
jest.mock("react-hot-toast", () => ({ Toaster: () => <div data-testid="toaster" /> }));

const getMeta = (name) => document.querySelector(`meta[name="${name}"]`);
describe("Policy (Stage 1): Page with real Layout module but with some stubbed child dependencies", () => {
    it("Page contents(image and text) are rendered.", async () => { 
        // act
        render(<Policy />);

        // assert
        expect(screen.getByRole("img", { name: /contactus/i })).toBeInTheDocument();
        expect(screen.getByText(/We are commited to selling you products of the highest quality for reasonable prices./i)).toBeInTheDocument();
    });

    it("Policy page passes attributes to layout component and sets title via Helmet and uses default meta for the remaining attributes.", async () => { 
        // act
        render(<Policy />);
        
        // assert
        // Wait for Helmet to flush head updates
        await waitFor(() => expect(document.title).toBe("Privacy Policy"));
        // Default meta from Layout.defaultProps 
        await waitFor(() => {
            expect(getMeta("description")?.content).toBe("mern stack project");
            expect(getMeta("keywords")?.content).toBe("mern,react,node,mongodb");
            expect(getMeta("author")?.content).toBe("Techinfoyt");
        });
    });

    it("Policy page contains layout child components(header, footer, toaster).", async () => { 
        // act
        render(<Policy />);
        
        // assert
        expect(screen.getByTestId("header")).toBeInTheDocument();
        expect(screen.getByTestId("footer")).toBeInTheDocument();
        expect(screen.getByTestId("toaster")).toBeInTheDocument();
    });
});