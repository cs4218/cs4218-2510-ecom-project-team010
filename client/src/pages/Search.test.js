import React from "react";
import { render, screen } from "@testing-library/react";
import Search from "../pages/Search";

jest.mock("../components/Layout", () => ({ children }) => (
  <div data-testid="layout">{children}</div>
));

jest.mock("../components/Layout", () => {
  return {
    __esModule: true, 
    default: ({ children }) => <div data-testid="layout">{children}</div>,
  };
});

jest.mock("../context/search", () => ({
  useSearch: jest.fn(),
}));

import { useSearch } from "../context/search";

describe("Given that multiple products are available in the Home Page", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("When search results is empty", () => {
    useSearch.mockReturnValue([{ results: [] }, jest.fn()]);

    render(<Search />);

    expect(screen.getByText("Search Results")).toBeInTheDocument();
    expect(screen.getByText("No Products Found")).toBeInTheDocument();
  });

  test("When a single results is present", () => {
    const mockProduct = [{ _id: "1", name: "Product A", description: "Desc", price: 10 }];
    useSearch.mockReturnValue([{ results: mockProduct }, jest.fn()]);

    render(<Search />);

    expect(screen.getByText("Found 1")).toBeInTheDocument();
    expect(screen.getByText("Product A")).toBeInTheDocument();
    });

  test("When multiple results are present", () => {
    const mockProducts = [
      { _id: "1", name: "Product A", description: "Mock description of product A", price: 10 },
      { _id: "2", name: "Product B", description: "Mock description of product B", price: 20 },
    ];
    useSearch.mockReturnValue([{ results: mockProducts }, jest.fn()]);

    render(<Search />);

    expect(screen.getByText("Found 2")).toBeInTheDocument();
    expect(screen.getByText("Product A")).toBeInTheDocument();
    expect(screen.getByText("Product B")).toBeInTheDocument();
  });
});
