// Note: these test cases are generated with the help of AI

import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import axios from "axios";
import toast from "react-hot-toast";
import Profile from "./Profile";

// Mock dependencies
jest.mock("axios");
jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: { success: jest.fn(), error: jest.fn() },
}));

jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(),
}));

jest.mock("../../components/UserMenu", () => ({
  __esModule: true,
  default: () => <div data-testid="user-menu">User Menu</div>,
}));

jest.mock("../../components/Layout", () => ({
  __esModule: true,
  default: ({ children, title }) => (
    <div data-testid="layout" data-title={title}>
      {children}
    </div>
  ),
}));

const { useAuth } = require("../../context/auth");

describe("Testing Profile Page", () => {
  const mockUser = {
    name: "John Doe",
    email: "john@example.com",
    phone: "1234567890",
    address: "123 Main St",
  };

  const mockAuth = {
    user: mockUser,
    token: "fake-token",
  };

  const mockSetAuth = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue([mockAuth, mockSetAuth]);
    // Mock localStorage
    Storage.prototype.getItem = jest.fn(() =>
      JSON.stringify(mockAuth)
    );
    Storage.prototype.setItem = jest.fn();
  });

  const renderProfile = () =>
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

  describe("Testing Layout and basic rendering", () => {
    it("renders with correct title prop passed to Layout", () => {
      // arrange & act
      renderProfile();
      const layout = screen.getByTestId("layout");

      // assert
      expect(layout).toHaveAttribute("data-title", "Your Profile");
    });

    it("renders Layout component", () => {
      // arrange & act
      renderProfile();

      // assert
      expect(screen.getByTestId("layout")).toBeInTheDocument();
    });

    it("renders UserMenu component", () => {
      // arrange & act
      renderProfile();

      // assert
      expect(screen.getByTestId("user-menu")).toBeInTheDocument();
    });

    it("renders the form heading", () => {
      // arrange & act
      renderProfile();

      // assert
      expect(screen.getByText("USER PROFILE")).toBeInTheDocument();
      expect(screen.getByText("USER PROFILE").tagName).toBe("H4");
    });
  });

  describe("Testing form inputs rendering", () => {
    it("renders name input field", () => {
      // arrange & act
      renderProfile();

      // assert
      const nameInput = screen.getByPlaceholderText("Enter Your Name");
      expect(nameInput).toBeInTheDocument();
      expect(nameInput).toHaveAttribute("type", "text");
    });

    it("renders email input field", () => {
      // arrange & act
      renderProfile();

      // assert
      const emailInput = screen.getByPlaceholderText("Enter Your Email");
      expect(emailInput).toBeInTheDocument();
      expect(emailInput).toHaveAttribute("type", "email");
    });

    it("renders password input field", () => {
      // arrange & act
      renderProfile();

      // assert
      const passwordInput = screen.getByPlaceholderText("Enter Your Password");
      expect(passwordInput).toBeInTheDocument();
      expect(passwordInput).toHaveAttribute("type", "password");
    });

    it("renders phone input field", () => {
      // arrange & act
      renderProfile();

      // assert
      const phoneInput = screen.getByPlaceholderText("Enter Your Phone");
      expect(phoneInput).toBeInTheDocument();
      expect(phoneInput).toHaveAttribute("type", "text");
    });

    it("renders address input field", () => {
      // arrange & act
      renderProfile();

      // assert
      const addressInput = screen.getByPlaceholderText("Enter Your Address");
      expect(addressInput).toBeInTheDocument();
      expect(addressInput).toHaveAttribute("type", "text");
    });

    it("renders UPDATE button", () => {
      // arrange & act
      renderProfile();

      // assert
      const updateButton = screen.getByRole("button", { name: /update/i });
      expect(updateButton).toBeInTheDocument();
      expect(updateButton).toHaveAttribute("type", "submit");
    });

    it("name input is the first text input in the form", () => {
      // arrange & act
      renderProfile();

      // assert
      const nameInput = screen.getByPlaceholderText("Enter Your Name");
      const allTextInputs = screen.getAllByPlaceholderText(/Enter Your/i);
      expect(allTextInputs[0]).toBe(nameInput);
    });
  });

  describe("Testing form population from user data", () => {
    it("populates name field with user data", () => {
      // arrange & act
      renderProfile();

      // assert
      const nameInput = screen.getByPlaceholderText("Enter Your Name");
      expect(nameInput).toHaveValue("John Doe");
    });

    it("populates email field with user data", () => {
      // arrange & act
      renderProfile();

      // assert
      const emailInput = screen.getByPlaceholderText("Enter Your Email");
      expect(emailInput).toHaveValue("john@example.com");
    });

    it("populates phone field with user data", () => {
      // arrange & act
      renderProfile();

      // assert
      const phoneInput = screen.getByPlaceholderText("Enter Your Phone");
      expect(phoneInput).toHaveValue("1234567890");
    });

    it("populates address field with user data", () => {
      // arrange & act
      renderProfile();

      // assert
      const addressInput = screen.getByPlaceholderText("Enter Your Address");
      expect(addressInput).toHaveValue("123 Main St");
    });

    it("password field remains empty", () => {
      // arrange & act
      renderProfile();

      // assert
      const passwordInput = screen.getByPlaceholderText("Enter Your Password");
      expect(passwordInput).toHaveValue("");
    });

    it("handles missing user data gracefully", () => {
      // arrange
      useAuth.mockReturnValue([{ user: {} }, mockSetAuth]);

      // act
      renderProfile();

      // assert
      const nameInput = screen.getByPlaceholderText("Enter Your Name");
      expect(nameInput).toHaveValue("");
    });
  });

  describe("Testing form input changes", () => {
    it("updates name field on user input", () => {
      // arrange
      renderProfile();
      const nameInput = screen.getByPlaceholderText("Enter Your Name");

      // act
      fireEvent.change(nameInput, { target: { value: "Jane Doe" } });

      // assert
      expect(nameInput).toHaveValue("Jane Doe");
    });

    it("updates password field on user input", () => {
      // arrange
      renderProfile();
      const passwordInput = screen.getByPlaceholderText("Enter Your Password");

      // act
      fireEvent.change(passwordInput, { target: { value: "newpassword123" } });

      // assert
      expect(passwordInput).toHaveValue("newpassword123");
    });

    it("updates phone field on user input", () => {
      // arrange
      renderProfile();
      const phoneInput = screen.getByPlaceholderText("Enter Your Phone");

      // act
      fireEvent.change(phoneInput, { target: { value: "9876543210" } });

      // assert
      expect(phoneInput).toHaveValue("9876543210");
    });

    it("updates address field on user input", () => {
      // arrange
      renderProfile();
      const addressInput = screen.getByPlaceholderText("Enter Your Address");

      // act
      fireEvent.change(addressInput, { target: { value: "456 Oak Ave" } });

      // assert
      expect(addressInput).toHaveValue("456 Oak Ave");
    });

    it("updates email field on user input", () => {
      // arrange
      renderProfile();
      const emailInput = screen.getByPlaceholderText("Enter Your Email");

      // act
      fireEvent.change(emailInput, { target: { value: "newemail@example.com" } });

      // assert
      expect(emailInput).toHaveValue("newemail@example.com");
    });
  });

  describe("Testing successful profile update", () => {
    it("submits form with updated data successfully", async () => {
      // arrange
      const updatedUser = { ...mockUser, name: "Jane Doe" };
      axios.put.mockResolvedValueOnce({ data: { updatedUser } });
      renderProfile();
      const nameInput = screen.getByPlaceholderText("Enter Your Name");
      const submitButton = screen.getByRole("button", { name: /update/i });

      // act
      fireEvent.change(nameInput, { target: { value: "Jane Doe" } });
      fireEvent.click(submitButton);

      // assert
      await waitFor(() => {
        expect(axios.put).toHaveBeenCalledWith("/api/v1/auth/profile", {
          name: "Jane Doe",
          email: "john@example.com",
          password: "",
          phone: "1234567890",
          address: "123 Main St",
        });
      });
    });

    it("updates auth context on successful profile update", async () => {
      // arrange
      const updatedUser = { ...mockUser, name: "Jane Doe" };
      axios.put.mockResolvedValueOnce({ data: { updatedUser } });
      renderProfile();
      const nameInput = screen.getByPlaceholderText("Enter Your Name");
      const submitButton = screen.getByRole("button", { name: /update/i });

      // act
      fireEvent.change(nameInput, { target: { value: "Jane Doe" } });
      fireEvent.click(submitButton);

      // assert
      await waitFor(() => {
        expect(mockSetAuth).toHaveBeenCalledWith({
          ...mockAuth,
          user: updatedUser,
        });
      });
    });

    it("updates localStorage on successful profile update", async () => {
      // arrange
      const updatedUser = { ...mockUser, name: "Jane Doe" };
      axios.put.mockResolvedValueOnce({ data: { updatedUser } });
      renderProfile();
      const nameInput = screen.getByPlaceholderText("Enter Your Name");
      const submitButton = screen.getByRole("button", { name: /update/i });

      // act
      fireEvent.change(nameInput, { target: { value: "Jane Doe" } });
      fireEvent.click(submitButton);

      // assert
      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith(
          "auth",
          JSON.stringify({ ...mockAuth, user: updatedUser })
        );
      });
    });

    it("shows success toast on successful profile update", async () => {
      // arrange
      const updatedUser = { ...mockUser, name: "Jane Doe" };
      axios.put.mockResolvedValueOnce({ data: { updatedUser } });
      renderProfile();
      const nameInput = screen.getByPlaceholderText("Enter Your Name");
      const submitButton = screen.getByRole("button", { name: /update/i });

      // act
      fireEvent.change(nameInput, { target: { value: "Jane Doe" } });
      fireEvent.click(submitButton);

      // assert
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith("Profile Updated Successfully");
      });
    });

    it("submits form with password update", async () => {
      // arrange
      const updatedUser = mockUser;
      axios.put.mockResolvedValueOnce({ data: { updatedUser } });
      renderProfile();
      const passwordInput = screen.getByPlaceholderText("Enter Your Password");
      const submitButton = screen.getByRole("button", { name: /update/i });

      // act
      fireEvent.change(passwordInput, { target: { value: "newpassword123" } });
      fireEvent.click(submitButton);

      // assert
      await waitFor(() => {
        expect(axios.put).toHaveBeenCalledWith("/api/v1/auth/profile", {
          name: "John Doe",
          email: "john@example.com",
          password: "newpassword123",
          phone: "1234567890",
          address: "123 Main St",
        });
      });
    });
  });

  describe("Testing error handling", () => {
    it("shows error toast when API returns error in data", async () => {
      // arrange
      axios.put.mockResolvedValueOnce({ data: { error: "Invalid data" } });
      renderProfile();
      const submitButton = screen.getByRole("button", { name: /update/i });

      // act
      fireEvent.click(submitButton);

      // assert
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Invalid data");
      });
    });

    it("shows error toast when API call fails", async () => {
      // arrange
      axios.put.mockRejectedValueOnce(new Error("Network error"));
      renderProfile();
      const submitButton = screen.getByRole("button", { name: /update/i });

      // act
      fireEvent.click(submitButton);

      // assert
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Something went wrong");
      });
    });

    it("logs error to console when API call fails", async () => {
      // arrange
      const consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
      const error = new Error("Network error");
      axios.put.mockRejectedValueOnce(error);
      renderProfile();
      const submitButton = screen.getByRole("button", { name: /update/i });

      // act
      fireEvent.click(submitButton);

      // assert
      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith(error);
      });
      consoleLogSpy.mockRestore();
    });

    it("does not update auth context on error", async () => {
      // arrange
      axios.put.mockRejectedValueOnce(new Error("Network error"));
      renderProfile();
      const submitButton = screen.getByRole("button", { name: /update/i });
      mockSetAuth.mockClear();

      // act
      fireEvent.click(submitButton);

      // assert
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });
      expect(mockSetAuth).not.toHaveBeenCalled();
    });

    it("does not update localStorage on error", async () => {
      // arrange
      axios.put.mockRejectedValueOnce(new Error("Network error"));
      renderProfile();
      const submitButton = screen.getByRole("button", { name: /update/i });
      Storage.prototype.setItem = jest.fn();

      // act
      fireEvent.click(submitButton);

      // assert
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe("Testing form structure", () => {
    it("renders form with correct structure", () => {
      // arrange & act
      renderProfile();

      // assert
      const form = screen.getByRole("button", { name: /update/i }).closest("form");
      expect(form).toBeInTheDocument();
    });

    it("renders Bootstrap grid layout", () => {
      // arrange & act
      renderProfile();
      const layout = screen.getByTestId("layout");

      // assert
      expect(layout.querySelector(".container-fluid")).toBeInTheDocument();
      expect(layout.querySelector(".row")).toBeInTheDocument();
      expect(layout.querySelector(".col-md-3")).toBeInTheDocument();
      expect(layout.querySelector(".col-md-9")).toBeInTheDocument();
    });

    it("prevents default form submission", async () => {
      // arrange
      axios.put.mockResolvedValueOnce({ data: { updatedUser: mockUser } });
      renderProfile();
      const form = screen.getByRole("button", { name: /update/i }).closest("form");
      const mockPreventDefault = jest.fn();

      // act
      fireEvent.submit(form, { preventDefault: mockPreventDefault });

      // assert
      await waitFor(() => {
        expect(axios.put).toHaveBeenCalled();
      });
    });
  });

  describe("Testing component state management", () => {
    it("maintains separate state for each input field", () => {
      // arrange & act
      renderProfile();
      const nameInput = screen.getByPlaceholderText("Enter Your Name");
      const phoneInput = screen.getByPlaceholderText("Enter Your Phone");

      // act
      fireEvent.change(nameInput, { target: { value: "New Name" } });

      // assert
      expect(nameInput).toHaveValue("New Name");
      expect(phoneInput).toHaveValue("1234567890"); // unchanged
    });

    it("updates only when user data changes", () => {
      // arrange
      const { rerender } = renderProfile();
      const nameInput = screen.getByPlaceholderText("Enter Your Name");
      expect(nameInput).toHaveValue("John Doe");

      // act - update with same data
      useAuth.mockReturnValue([mockAuth, mockSetAuth]);
      rerender(
        <MemoryRouter>
          <Profile />
        </MemoryRouter>
      );

      // assert
      expect(nameInput).toHaveValue("John Doe");
    });
  });
});
