import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";
import { SearchProvider, useSearch } from "../../context/search";
import SearchInput from "../../components/Form/SearchInput";

jest.mock("axios");

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

import { useNavigate } from "react-router-dom";

describe("Test integration between SearchContext and SearchInput", () => {
  let mockNavigate;

  const renderSearchInput = () => {
    return render(
      <BrowserRouter>
        <SearchProvider>
          <SearchInput />
        </SearchProvider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
    mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);
  });

  describe("SearchInput Integration with Context", () => {
    test("Should render search input and button", () => {
      renderSearchInput();

      expect(screen.getByPlaceholderText("Search")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /search/i })
      ).toBeInTheDocument();
    });

    test("Should update context keyword when typing", () => {
      renderSearchInput();

      const input = screen.getByPlaceholderText("Search");
      fireEvent.change(input, { target: { value: "laptop" } });

      expect(input).toHaveValue("laptop");
    });

    test("Should have empty initial value from context", () => {
      renderSearchInput();

      const input = screen.getByPlaceholderText("Search");
      expect(input).toHaveValue("");
    });

    test("Should call API and update context on form submit", async () => {
      const mockData = [
        { _id: "1", name: "Product 1", price: 100 },
        { _id: "2", name: "Product 2", price: 200 },
      ];

      // Fix: Mock axios.get specifically
      axios.get.mockResolvedValueOnce({ data: mockData });

      renderSearchInput();

      const input = screen.getByPlaceholderText("Search");
      const button = screen.getByRole("button", { name: /search/i });

      fireEvent.change(input, { target: { value: "laptop" } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(
          "/api/v1/product/search/laptop"
        );
        expect(mockNavigate).toHaveBeenCalledWith("/search");
      });
    });

    test("Should navigate to /search after successful search", async () => {
      axios.get.mockResolvedValueOnce({ data: [] });

      renderSearchInput();

      const input = screen.getByPlaceholderText("Search");
      const button = screen.getByRole("button", { name: /search/i });

      fireEvent.change(input, { target: { value: "test" } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/search");
      });
    });

    test("Should handle form submission with Enter key", async () => {
      const mockData = [{ _id: "1", name: "Product 1" }];
      // Fix: Mock axios.get specifically
      axios.get.mockResolvedValueOnce({ data: mockData });

      renderSearchInput();

      const input = screen.getByPlaceholderText("Search");
      fireEvent.change(input, { target: { value: "phone" } });
      fireEvent.submit(screen.getByRole("search"));

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(
          "/api/v1/product/search/phone"
        );
        expect(mockNavigate).toHaveBeenCalledWith("/search");
      });
    });
  });

  describe("SearchInput Context State Updates", () => {
    test("Should update results in context after API call", async () => {
      const mockData = [
        { _id: "1", name: "Result 1" },
        { _id: "2", name: "Result 2" },
      ];

      axios.get.mockResolvedValueOnce({ data: mockData });

      let capturedValues;
      const TestWrapper = () => {
        capturedValues = useSearch();
        return <SearchInput />;
      };

      render(
        <BrowserRouter>
          <SearchProvider>
            <TestWrapper />
          </SearchProvider>
        </BrowserRouter>
      );

      const input = screen.getByPlaceholderText("Search");
      const button = screen.getByRole("button", { name: /search/i });

      fireEvent.change(input, { target: { value: "query" } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(capturedValues[0].keyword).toBe("query");
        expect(capturedValues[0].results).toEqual(mockData);
      });
    });

    test("Should maintain keyword in context after navigation", async () => {
      axios.get.mockResolvedValueOnce({ data: [] });

      let capturedValues;
      const TestWrapper = () => {
        capturedValues = useSearch();
        return <SearchInput />;
      };

      render(
        <BrowserRouter>
          <SearchProvider>
            <TestWrapper />
          </SearchProvider>
        </BrowserRouter>
      );

      const input = screen.getByPlaceholderText("Search");
      const button = screen.getByRole("button", { name: /search/i });

      fireEvent.change(input, { target: { value: "persistent" } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(capturedValues[0].keyword).toBe("persistent");
        expect(mockNavigate).toHaveBeenCalledWith("/search");
      });
    });
  });

  describe("Error Handling", () => {
    test("Should log error when API call fails", async () => {
      const mockError = new Error("Network error");
      axios.get.mockRejectedValueOnce(mockError);

      renderSearchInput();

      const input = screen.getByPlaceholderText("Search");
      const button = screen.getByRole("button", { name: /search/i });

      fireEvent.change(input, { target: { value: "test" } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith(mockError);
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });

    test("Should not navigate on API failure", async () => {
      axios.get.mockRejectedValueOnce(new Error("API Error"));

      renderSearchInput();

      const input = screen.getByPlaceholderText("Search");
      const button = screen.getByRole("button", { name: /search/i });

      fireEvent.change(input, { target: { value: "fail" } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });
  });

  describe("Multiple Search Operations", () => {
    test("Should handle multiple consecutive searches", async () => {
      const firstResults = [{ _id: "1", name: "Laptop" }];
      const secondResults = [{ _id: "2", name: "Phone" }];

      axios.get
        .mockResolvedValueOnce({ data: firstResults })
        .mockResolvedValueOnce({ data: secondResults });

      renderSearchInput();

      const input = screen.getByPlaceholderText("Search");
      const button = screen.getByRole("button", { name: /search/i });

      // first search
      fireEvent.change(input, { target: { value: "laptop" } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(
          "/api/v1/product/search/laptop"
        );
      });

      // second search
      fireEvent.change(input, { target: { value: "phone" } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(
          "/api/v1/product/search/phone"
        );
        expect(mockNavigate).toHaveBeenCalledTimes(2);
      });
    });
  });
});