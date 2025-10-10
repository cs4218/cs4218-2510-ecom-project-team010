// place holder test case need to update to real test code

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import Products from "../Products";

jest.mock("../../../components/Header", () => () => <div data-testid="header" />);
jest.mock("../../../components/Footer", () => () => <div data-testid="footer" />);
jest.mock("react-hot-toast", () => ({ Toaster: () => <div data-testid="toaster" /> }));

jest.mock("axios", () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));

const fakeProducts = [
  { _id: "p1", name: "Phone", description: "A nice phone", slug: "phone" },
  { _id: "p2", name: "Book", description: "A good read", slug: "book" },
];

beforeEach(() => {
  axios.get.mockResolvedValue({ data: { products: fakeProducts } });
});
afterEach(() => jest.clearAllMocks());

test("renders child layout components (header/footer/toaster stubbed) successfully", async () => {
  // act
  render(
    <MemoryRouter>
      <Products />
    </MemoryRouter>
  );
  await waitFor(() => expect(axios.get).toHaveBeenCalled());

  // assert
  expect(screen.getByTestId("header")).toBeInTheDocument();
  expect(screen.getByTestId("footer")).toBeInTheDocument();
  expect(screen.getByTestId("toaster")).toBeInTheDocument();
});

test("renders real AdminMenu component successfully", async () => {
  // act
  render(
    <MemoryRouter>
      <Products />
    </MemoryRouter>
  );

  // assert
  expect(await screen.findByText(/admin panel/i)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /create category/i })).toHaveAttribute(
    "href",
    "/dashboard/admin/create-category"
  );
  expect(screen.getByRole("link", { name: /create product/i })).toHaveAttribute(
    "href",
    "/dashboard/admin/create-product"
  );
});

test("renders both product cards with correct links, images, titles, and descriptions", async () => {
  // act
  render(
    <MemoryRouter>
      <Products />
    </MemoryRouter>
  );

  // assert
  // card 1
  const phoneLink = await screen.findByRole("link", { name: /phone/i });
  expect(phoneLink).toHaveAttribute("href", "/dashboard/admin/product/phone");
  const phoneImg = screen.getByRole("img", { name: /phone/i });
  expect(phoneImg).toHaveAttribute("src", "/api/v1/product/product-photo/p1");
  expect(screen.getByRole("heading", { name: /phone/i, level: 5 })).toBeInTheDocument();
  expect(screen.getByText(/a nice phone/i)).toBeInTheDocument();

  // card 2
  const bookLink = screen.getByRole("link", { name: /book/i });
  expect(bookLink).toHaveAttribute("href", "/dashboard/admin/product/book");
  const bookImg = screen.getByRole("img", { name: /book/i });
  expect(bookImg).toHaveAttribute("src", "/api/v1/product/product-photo/p2");
  expect(screen.getByRole("heading", { name: /book/i, level: 5 })).toBeInTheDocument();
  expect(screen.getByText(/a good read/i)).toBeInTheDocument();
});
