import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Policy from "./Policy";
import { AuthProvider } from "../context/auth";
import { CartProvider } from "../context/cart";
import { SearchProvider } from "../context/search";   


function AppShell({ children }) {
  return (
    <MemoryRouter>
      <AuthProvider>
        <CartProvider>
          <SearchProvider>
              {children}
          </SearchProvider>
        </CartProvider>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe("Testing rendering of policy page components.", () => {
    it("Policy passes page contents(text and image) to layout component successfully and renders them on page.", async () => {
        render(
            <AppShell>
            <Policy />
            </AppShell>
        );
        
        // image rendered 
        const img = screen.getByAltText(/contactus/i);
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute("src", "/images/contactus.jpeg");

        // text rendered
        expect(
            screen.getByText(/highest quality for reasonable prices/i)
        ).toBeInTheDocument();
     });

})


