import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Policy from "../Policy";
import { AuthProvider } from "../../context/auth";
import { CartProvider } from "../../context/cart";
import { SearchProvider } from "../../context/search";   


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

test("Policy renders contents image and text (no mocks)", () => {
  render(
    <AppShell>
      <Policy />
    </AppShell>
  );

  const img = screen.getByAltText(/contactus/i);
  expect(img).toBeInTheDocument();
  expect(img).toHaveAttribute("src", "/images/contactus.jpeg");
  expect(
    screen.getByText(/highest quality for reasonable prices/i)
  ).toBeInTheDocument();
});
