import React from "react";
import { render, screen } from "@testing-library/react";
import Categories from "./Categories";
import { BrowserRouter } from "react-router-dom";
import useCategory from "../hooks/useCategory";

jest.mock("../hooks/useCategory", () => ({
  __esModule: true,
  default: jest.fn(), 
}));

jest.mock("../components/Layout", () => {
  return function MockLayout({ children, title }) {
    return (
      <div data-testid="layout" title={title}>
        {children}
      </div>
    );
  };
});

const renderWithRouter = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

describe("Given some categories", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("When categories are fetched from useCategory", () => {
        const fakeCategories = [
            { _id: "1", name: "Electronics", slug: "electronics" },
            { _id: "2", name: "Books", slug: "books" },
        ];
        useCategory.mockReturnValue(fakeCategories);

        renderWithRouter(<Categories />);

        expect(screen.getByText("Electronics")).toBeInTheDocument();
        expect(screen.getByText("Books")).toBeInTheDocument();
        
        const electronicsLink = screen.getByRole("link", { name: "Electronics" });
        const booksLink = screen.getByRole("link", { name: "Books" });
        
        expect(electronicsLink).toHaveAttribute("href", "/category/electronics");
        expect(booksLink).toHaveAttribute("href", "/category/books");
        expect(electronicsLink).toHaveClass("btn", "btn-primary");
        expect(booksLink).toHaveClass("btn", "btn-primary");
    });

    test("When no categories are fetched from useCategory", () => {
        useCategory.mockReturnValue([]);

        renderWithRouter(<Categories />);

        expect(screen.queryByRole("link")).not.toBeInTheDocument();
        expect(screen.getByTestId("layout")).toBeInTheDocument();
    });
});