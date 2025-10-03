// Note: these test cases are genereated with the help of AI

import React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import axios from "axios";
import toast from "react-hot-toast";
import Products from "./Products";


jest.mock("axios");
jest.mock("react-hot-toast");
jest.mock("../../components/AdminMenu", () => ({
  __esModule: true,
  default: () => <div data-testid="admin-menu" />,
}));
jest.mock("../../components/Layout", () => ({
  __esModule: true,
  default: ({ children }) => <div data-testid="layout">{children}</div>,
}));

// Renders specified component at the correct route for testing
const renderOnRoute = (ui, route = "/dashboard/admin/products") =>
  render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/dashboard/admin/products" element={ui} />
      </Routes>
    </MemoryRouter>
  );


describe("Testing products page.", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches and renders multiple product cards.', async () => {
  // Arrange
  axios.get.mockResolvedValueOnce({
    data: {
      products: [
        { _id: 'p1', name: 'Book',   description: 'Good read',   slug: 'book' },
        { _id: 'p2', name: 'Shoes', description: 'Comfy shoes', slug: 'shoes' },
      ],
    },
  });

  // Act
  renderOnRoute(<Products />);
  await waitFor(() =>
    expect(axios.get).toHaveBeenCalledWith('/api/v1/product/get-product')
  );
  const bookHeading = await screen.findByRole('heading', { name: 'Book', level: 5 });
  const bookCard = bookHeading.closest('.card');
  const shoesHeading = await screen.findByRole('heading', { name: 'Shoes', level: 5 });
  const shoesCard = shoesHeading.closest('.card');

  // Assert -> check that the all the correct items are displayed
  // Card 1 (Book)
  expect(bookCard).toBeInTheDocument();
  expect(within(bookCard).getByText('Good read')).toBeInTheDocument();
  expect(bookHeading.closest('a')).toHaveAttribute('href', '/dashboard/admin/product/book');
  expect(within(bookCard).getByRole('img', { name: 'Book' }))
    .toHaveAttribute('src', '/api/v1/product/product-photo/p1');

  // Card 2 (Shoes)
  expect(shoesCard).toBeInTheDocument();
  expect(within(shoesCard).getByText('Comfy shoes')).toBeInTheDocument();
  expect(shoesHeading.closest('a')).toHaveAttribute('href', '/dashboard/admin/product/shoes');
  expect(within(shoesCard).getByRole('img', { name: 'Shoes' }))
    .toHaveAttribute('src', '/api/v1/product/product-photo/p2');
});


  it("shows an error toast when the fetch fails.", async () => {
    // arrange
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    axios.get.mockRejectedValueOnce(new Error("Network down"));

    // act
    renderOnRoute(<Products />);
    await waitFor(() => expect(axios.get).toHaveBeenCalled());

    // assert
    expect(toast.error).toHaveBeenCalledWith("Something Went Wrong");
    logSpy.mockRestore();
  });

  it("renders no cards when API returns an empty list", async () => {
    // arrange
    axios.get.mockResolvedValueOnce({ data: { products: [] } });

    //act
    renderOnRoute(<Products />);
    await waitFor(() => expect(axios.get).toHaveBeenCalled());

    // assert
    expect(screen.queryByRole("heading", { level: 5 })).not.toBeInTheDocument();
  });
});