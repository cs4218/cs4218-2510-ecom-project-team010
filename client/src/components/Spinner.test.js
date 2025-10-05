// Note: these test cases are generated with the help of AI

import React from "react";
import { render, screen, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import Spinner from "./Spinner";

// Mock react-router-dom
const mockNavigate = jest.fn();
const mockLocation = {
  pathname: "/current-page",
};

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation,
}));

describe("Testing Spinner Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const renderSpinner = (props = {}) =>
    render(
      <MemoryRouter>
        <Spinner {...props} />
      </MemoryRouter>
    );

  describe("Testing basic component rendering", () => {
    it("renders without crashing", () => {
      // arrange & act
      const { container } = renderSpinner();

      // assert
      expect(container).toBeTruthy();
    });

    it("renders spinner container", () => {
      // arrange & act
      renderSpinner();

      // assert
      const spinnerContainer = screen.getByRole("status");
      expect(spinnerContainer).toBeInTheDocument();
      expect(spinnerContainer).toHaveClass("spinner-border");
    });

    it("renders redirecting message", () => {
      // arrange & act
      renderSpinner();

      // assert
      const message = screen.getByText(/redirecting to you in \d+ second/);
      expect(message).toBeInTheDocument();
      expect(message).toHaveClass("text-center");
    });

    it("renders loading text", () => {
      // arrange & act
      renderSpinner();

      // assert
      const loadingText = screen.getByText("Loading...");
      expect(loadingText).toBeInTheDocument();
      expect(loadingText).toHaveClass("visually-hidden");
    });

    it("has correct container structure", () => {
      // arrange & act
      renderSpinner();

      // assert
      const container = screen.getByText(/redirecting to you in \d+ second/).parentElement;
      expect(container).toHaveClass("d-flex", "flex-column", "justify-content-center", "align-items-center");
    });
  });

  describe("Testing countdown functionality", () => {
    it("starts with count of 3", () => {
      // arrange & act
      renderSpinner();

      // assert
      expect(screen.getByText(/redirecting to you in 3 second/)).toBeInTheDocument();
    });

    it("decrements count after 1 second", () => {
      // arrange
      renderSpinner();

      // act
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // assert
      expect(screen.getByText(/redirecting to you in 2 second/)).toBeInTheDocument();
    });

    it("decrements count after 2 seconds", () => {
      // arrange
      renderSpinner();

      // act
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      // assert
      expect(screen.getByText(/redirecting to you in 1 second/)).toBeInTheDocument();
    });

    it("reaches count of 0 after 3 seconds", () => {
      // arrange
      renderSpinner();

      // act
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      // assert
      expect(screen.getByText(/redirecting to you in 0 second/)).toBeInTheDocument();
    });

    it("continues counting beyond 0", () => {
      // arrange
      renderSpinner();

      // act
      act(() => {
        jest.advanceTimersByTime(4000);
      });

      // assert
      expect(screen.getByText(/redirecting to you in -1 second/)).toBeInTheDocument();
    });
  });

  describe("Testing navigation functionality", () => {
    it("calls navigate with default path when count reaches 0", () => {
      // arrange
      renderSpinner();

      // act
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      // assert
      expect(mockNavigate).toHaveBeenCalledWith("/login", {
        state: "/current-page",
      });
    });

    it("calls navigate with custom path when count reaches 0", () => {
      // arrange
      renderSpinner({ path: "dashboard" });

      // act
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      // assert
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard", {
        state: "/current-page",
      });
    });

    it("passes current location pathname in state", () => {
      // arrange
      renderSpinner();

      // act
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      // assert
      expect(mockNavigate).toHaveBeenCalledWith("/login", {
        state: "/current-page",
      });
    });

    it("does not navigate before count reaches 0", () => {
      // arrange
      renderSpinner();

      // act
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      // assert
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe("Testing custom path prop", () => {
    it("uses default path when no path prop provided", () => {
      // arrange & act
      renderSpinner();

      // assert
      expect(screen.getByText(/redirecting to you in 3 second/)).toBeInTheDocument();
    });

    it("accepts custom path prop", () => {
      // arrange & act
      renderSpinner({ path: "home" });

      // assert
      expect(screen.getByText(/redirecting to you in 3 second/)).toBeInTheDocument();
    });

    it("navigates to custom path", () => {
      // arrange
      renderSpinner({ path: "custom" });

      // act
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      // assert
      expect(mockNavigate).toHaveBeenCalledWith("/custom", {
        state: "/current-page",
      });
    });

    it("handles empty string path", () => {
      // arrange
      renderSpinner({ path: "" });

      // act
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      // assert
      expect(mockNavigate).toHaveBeenCalledWith("/", {
        state: "/current-page",
      });
    });

    it("handles undefined path", () => {
      // arrange
      renderSpinner({ path: undefined });

      // act
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      // assert
      expect(mockNavigate).toHaveBeenCalledWith("/login", {
        state: "/current-page",
      });
    });
  });

  describe("Testing component styling", () => {
    it("applies correct Bootstrap classes to container", () => {
      // arrange & act
      renderSpinner();

      // assert
      const container = screen.getByText(/redirecting to you in \d+ second/).parentElement;
      expect(container).toHaveClass("d-flex", "flex-column", "justify-content-center", "align-items-center");
    });

    it("applies inline height style", () => {
      // arrange & act
      renderSpinner();

      // assert
      const container = screen.getByText(/redirecting to you in \d+ second/).parentElement;
      expect(container).toHaveStyle({ height: "100vh" });
    });

    it("applies spinner-border class to spinner", () => {
      // arrange & act
      renderSpinner();

      // assert
      const spinner = screen.getByRole("status");
      expect(spinner).toHaveClass("spinner-border");
    });

    it("applies visually-hidden class to loading text", () => {
      // arrange & act
      renderSpinner();

      // assert
      const loadingText = screen.getByText("Loading...");
      expect(loadingText).toHaveClass("visually-hidden");
    });

    it("has correct CSS class in message", () => {
      // arrange & act
      renderSpinner();

      // assert
      const message = screen.getByText(/redirecting to you in \d+ second/);
      expect(message).toHaveClass("text-center");
    });
  });

  describe("Testing timer cleanup", () => {
    it("cleans up interval on unmount", () => {
      // arrange
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
      const { unmount } = renderSpinner();

      // act
      unmount();

      // assert
      expect(clearIntervalSpy).toHaveBeenCalled();
      clearIntervalSpy.mockRestore();
    });

    it("does not call navigate after unmount", () => {
      // arrange
      const { unmount } = renderSpinner();

      // act
      unmount();
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      // assert
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe("Testing accessibility", () => {
    it("has proper ARIA role for spinner", () => {
      // arrange & act
      renderSpinner();

      // assert
      const spinner = screen.getByRole("status");
      expect(spinner).toBeInTheDocument();
    });

    it("has accessible loading text", () => {
      // arrange & act
      renderSpinner();

      // assert
      const loadingText = screen.getByText("Loading...");
      expect(loadingText).toHaveClass("visually-hidden");
      expect(loadingText).toBeInTheDocument();
    });

    it("provides clear user feedback", () => {
      // arrange & act
      renderSpinner();

      // assert
      const message = screen.getByText(/redirecting to you in \d+ second/);
      expect(message).toBeInTheDocument();
    });
  });

  describe("Testing edge cases", () => {
    it("handles rapid timer advances", () => {
      // arrange
      renderSpinner();

      // act
      act(() => {
        jest.advanceTimersByTime(10000);
      });

      // assert
      expect(screen.getByText(/redirecting to you in -7 second/)).toBeInTheDocument();
    });

    it("handles multiple re-renders", () => {
      // arrange
      const { rerender } = renderSpinner();

      // act
      rerender(
        <MemoryRouter>
          <Spinner path="test" />
        </MemoryRouter>
      );

      // assert
      expect(screen.getByText(/redirecting to you in 3 second/)).toBeInTheDocument();
    });

    it("maintains count state across re-renders", () => {
      // arrange
      const { rerender } = renderSpinner();
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // act
      rerender(
        <MemoryRouter>
          <Spinner />
        </MemoryRouter>
      );

      // assert
      expect(screen.getByText(/redirecting to you in 2 second/)).toBeInTheDocument();
    });
  });

  describe("Testing component integration", () => {
    it("integrates with react-router-dom correctly", () => {
      // arrange & act
      renderSpinner();

      // assert
      expect(mockLocation.pathname).toBe("/current-page");
    });

    it("uses navigate hook correctly", () => {
      // arrange & act
      renderSpinner();

      // act
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      // assert
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it("uses location hook correctly", () => {
      // arrange & act
      renderSpinner();

      // act
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      // assert
      expect(mockNavigate).toHaveBeenCalledWith("/login", {
        state: "/current-page",
      });
    });
  });

  describe("Testing performance", () => {
    it("renders efficiently", () => {
      // arrange & act
      const startTime = performance.now();
      renderSpinner();
      const endTime = performance.now();

      // assert
      expect(screen.getByRole("status")).toBeInTheDocument();
      expect(endTime - startTime).toBeLessThan(100);
    });

    it("handles timer efficiently", () => {
      // arrange
      renderSpinner();

      // act
      const startTime = performance.now();
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      const endTime = performance.now();

      // assert
      expect(screen.getByText(/redirecting to you in 2 second/)).toBeInTheDocument();
      expect(endTime - startTime).toBeLessThan(2000);
    });
  });

  describe("Testing component behavior", () => {
    it("shows correct initial state", () => {
      // arrange & act
      renderSpinner();

      // assert
      expect(screen.getByText(/redirecting to you in 3 second/)).toBeInTheDocument();
      expect(screen.getByRole("status")).toBeInTheDocument();
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    it("updates countdown message correctly", () => {
      // arrange
      renderSpinner();

      // act & assert
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(screen.getByText(/redirecting to you in 2 second/)).toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(screen.getByText(/redirecting to you in 1 second/)).toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(screen.getByText(/redirecting to you in 0 second/)).toBeInTheDocument();
    });

    it("maintains consistent UI structure", () => {
      // arrange
      const { rerender } = renderSpinner();

      // act
      rerender(
        <MemoryRouter>
          <Spinner path="different" />
        </MemoryRouter>
      );

      // assert
      expect(screen.getByRole("status")).toBeInTheDocument();
      expect(screen.getByText(/redirecting to you in \d+ second/)).toBeInTheDocument();
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });
  });
});
