import React from "react";
import { render, screen, within } from "@testing-library/react";
import axios from "axios";
import Products from "../../admin/Products";
jest.mock("../../../components/AdminMenu", () => () => <nav data-testid="admin-menu" />);
jest.mock("./../../../components/Layout", () => ({
  __esModule: true,
  default: ({ children }) => <div data-testid="layout">{children}</div>,
}));
jest.mock("axios", () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    Link: ({ to, children, ...props }) => <a href={to} {...props}>{children}</a>,
  };
});
jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const fakeProducts = [
  {
    _id: "p1",
    name: "Phone",
    description: "A nice phone",
    slug: "phone",
  },
  {
    _id: "p2",
    name: "Book",
    description: "A good read",
    slug: "book",
  },
];

beforeEach(() => {
  axios.get.mockResolvedValue({
    data: { products: fakeProducts },
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

test("Passes heading to layout component successfully and renders heading", async () => {
  render(<Products />);

  // Heading
  expect(await screen.findByRole("heading", { name: /all products list/i })).toBeInTheDocument();
});

test("Passes cards to layout component successfully and renders product cards (with stubbed Layout/AdminMenu)", async () => {
    // act
    render(<Products />);
    const links = await screen.findAllByRole("link");

    // assert
    // 2 cards rendered 
    expect(links).toHaveLength(2);

    // card 1
    const firstLink = links[0];
    expect(firstLink).toHaveAttribute("href", "/dashboard/admin/product/phone");
    const card = within(firstLink).getByRole("img", { name: /phone/i }).closest(".card");
    expect(card).toBeInTheDocument();
    const img = within(firstLink).getByRole("img", { name: /phone/i });
    expect(img).toHaveAttribute("src", "/api/v1/product/product-photo/p1");
    expect(within(firstLink).getByRole("heading", { name: /phone/i, level: 5 })).toBeInTheDocument();
    expect(within(firstLink).getByText(/a nice phone/i)).toBeInTheDocument();

    // card 2
    const secondLink = links[1];
    expect(secondLink).toHaveAttribute("href", "/dashboard/admin/product/book");
    const secondImg = within(secondLink).getByRole("img", { name: /book/i });
    expect(secondImg).toHaveAttribute("src", "/api/v1/product/product-photo/p2");
    expect(
        within(secondLink).getByRole("heading", { name: /book/i, level: 5 })
    ).toBeInTheDocument();
    expect(within(secondLink).getByText(/a good read/i)).toBeInTheDocument();
});
