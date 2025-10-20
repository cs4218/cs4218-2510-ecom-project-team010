import React from "react";
import { render, screen, act } from "@testing-library/react";
import { SearchProvider, useSearch } from "../context/search";
import Search from "../pages/Search";

// mock other deps like layout
jest.mock("../components/Layout", () => {
  return function Layout({ children, title }) {
    return (
      <div data-testid="layout" data-title={title}>
        {children}
      </div>
    );
  };
});

describe("Test integration between Search Context and Search Page", () => {
    describe("SearchContext Provider", () => {

        test("Should allow updating search state", () => {
            let capturedValues;
            const TestComponent = () => {
                capturedValues = useSearch();
                return (
                <button
                    onClick={() =>
                    capturedValues[1]({
                        keyword: "test",
                        results: [{ _id: "1", name: "Product 1" }],
                    })
                    }
                >
                    Update
                </button>
                );
            };

            const { rerender } = render(
                <SearchProvider>
                <TestComponent />
                </SearchProvider>
            );

            act(() => {
                screen.getByText("Update").click();
            });

            rerender(
                <SearchProvider>
                <TestComponent />
                </SearchProvider>
            );

            expect(capturedValues[0].keyword).toBe("test");
            expect(capturedValues[0].results).toHaveLength(1);
        });
    });

    describe("Search Page Integration", () => {
        test("Should display product count when results exist", () => {
            const TestWrapper = () => {
                const [, setSearch] = useSearch();
                React.useEffect(() => {
                setSearch({
                    keyword: "laptop",
                    results: [
                    {
                        _id: "1",
                        name: "Laptop",
                        description: "A great laptop",
                        price: 999,
                    },
                    {
                        _id: "2",
                        name: "Gaming Laptop",
                        description: "A powerful gaming laptop",
                        price: 1499,
                    },
                    ],
                });
                }, [setSearch]);

                return <Search />;
            };

            render(
                <SearchProvider>
                <TestWrapper />
                </SearchProvider>
            );

            expect(screen.getByText("Found 2")).toBeInTheDocument();
        });

        test("Should render product cards with correct data", () => {
            const mockProducts = [
                {
                _id: "1",
                name: "Test Product",
                description: "This is a test product description",
                price: 99.99,
                },
            ];

            const TestWrapper = () => {
                const [, setSearch] = useSearch();
                React.useEffect(() => {
                setSearch({
                    keyword: "test",
                    results: mockProducts,
                });
                }, [setSearch]);

                return <Search />;
            };

            render(
                <SearchProvider>
                <TestWrapper />
                </SearchProvider>
            );

            expect(screen.getByText("Test Product")).toBeInTheDocument();
            expect(screen.getByText("$ 99.99")).toBeInTheDocument();
            expect(screen.getByText("More Details")).toBeInTheDocument();
            expect(screen.getByText("ADD TO CART")).toBeInTheDocument();
        });

        test("Should render multiple product cards", () => {
            const mockProducts = [
                {
                _id: "1",
                name: "Product 1",
                description: "Description 1",
                price: 10,
                },
                {
                _id: "2",
                name: "Product 2",
                description: "Description 2",
                price: 20,
                },
                {
                _id: "3",
                name: "Product 3",
                description: "Description 3",
                price: 30,
                },
            ];

            const TestWrapper = () => {
                const [, setSearch] = useSearch();
                React.useEffect(() => {
                setSearch({ keyword: "product", results: mockProducts });
                }, [setSearch]);

                return <Search />;
            };

            render(
                <SearchProvider>
                <TestWrapper />
                </SearchProvider>
            );

            expect(screen.getByText("Found 3")).toBeInTheDocument();
            expect(screen.getByText("Product 1")).toBeInTheDocument();
            expect(screen.getByText("Product 2")).toBeInTheDocument();
            expect(screen.getByText("Product 3")).toBeInTheDocument();
        });

        test("Should pass correct title to Layout component", () => {
            render(
                <SearchProvider>
                <Search />
                </SearchProvider>
            );

            const layout = screen.getByTestId("layout");
            expect(layout).toHaveAttribute("data-title", "Search results");
        });
    });
});