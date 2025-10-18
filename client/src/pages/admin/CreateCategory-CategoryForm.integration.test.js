import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { act } from "react-dom/test-utils";
import userEvent from "@testing-library/user-event";
import CreateCategory from "./CreateCategory";
import axios from "axios";
import toast from "react-hot-toast";

jest.mock("axios");
const mockedAxios = axios;

jest.mock("../../components/Layout", () => ({
    __esModule: true,
    default: (props) => <div data-testid="layout">{props.children}</div>,
}));


jest.mock("./../../components/AdminMenu", () => ({
    __esModule: true,
    default: () => (
        <div data-testid="admin-menu">
        <h4>Admin Panel</h4>
        <a href="/dashboard/admin/create-category">Create Category</a>
        <a href="/dashboard/admin/products">Products</a>
        </div>
    ),
}));

jest.mock("react-hot-toast", () => ({
    __esModule: true,
    default: { success: jest.fn(), error: jest.fn() },
    Toaster: () => null,
    success: jest.fn(),
    error: jest.fn(),
}));


describe("Test integration between CreateCategory and CategoryForm", () => {
    const mockCategories = [
        { _id: "1", name: "Electronics" },
        { _id: "2", name: "Clothing" },
    ];

    beforeEach(() => {
        jest.spyOn(console, "log").mockImplementation(() => {});
        jest.clearAllMocks();

        mockedAxios.get.mockResolvedValue({
            data: { success: true, category: mockCategories },
        });
        mockedAxios.post.mockResolvedValue({
            data: { success: true },
        });
        mockedAxios.put.mockResolvedValue({
            data: { success: true },
        });
        mockedAxios.delete.mockResolvedValue({
            data: { success: true },
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe("CategoryForm Integration for Create Operation", () => {
        test("CategoryForm correctly captures user input and triggers CreateCategory's handleSubmit", async () => {
            render(
                <MemoryRouter>
                <CreateCategory />
                </MemoryRouter>
            );

            await waitFor(() => { expect(screen.getByText("Electronics")).toBeInTheDocument(); });

            const createInput = screen.getByPlaceholderText("Enter new category");
            expect(createInput).toHaveValue("");

            await act(async () => {
                userEvent.type(createInput, "Books");
            });

            // assert that CategoryForm has updated the parent state to contain Books
            expect(createInput).toHaveValue("Books");

            // sumbit via CategoryForm's form
            const submitButton = screen.getAllByRole("button", { name: /submit/i })[0];
            await act(async () => {
                userEvent.click(submitButton);
            });

            // assert that create category have been called with the correct request 
            await waitFor(() => {
                expect(mockedAxios.post).toHaveBeenCalledWith(
                    "/api/v1/category/create-category",
                    { name: "Books" }
                );
            });

            // assert toast notification
            expect(toast.success).toHaveBeenCalledWith("Books is created");

            // assert data refresh was triggered
            expect(mockedAxios.get).toHaveBeenCalledTimes(2);
        });

        test("CategoryForm allows empty submission and CreateCategory handles it appropriately", async () => {
            render(
                <MemoryRouter>
                <CreateCategory />
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("Electronics")).toBeInTheDocument();
            });

            // submit empty form
            const submitButton = screen.getAllByRole("button", { name: /submit/i })[0];
            await act(async () => {
                userEvent.click(submitButton);
            });

            // verify API was called with empty name
            await waitFor(() => {
                expect(mockedAxios.post).toHaveBeenCalledWith(
                    "/api/v1/category/create-category",
                    { name: "" }
                );
            });
        });

        test("CategoryForm handles API error during create and CreateCategory shows error toast", async () => {
            mockedAxios.post.mockRejectedValueOnce(new Error("Network error"));

            render(
                <MemoryRouter>
                    <CreateCategory />
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("Electronics")).toBeInTheDocument();
            });

            const createInput = screen.getByPlaceholderText("Enter new category");
            await act(async () => {
                userEvent.type(createInput, "Books");
            });

            const submitButton = screen.getAllByRole("button", { name: /submit/i })[0];
            await act(async () => {
                userEvent.click(submitButton);
            });

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith("Something went wrong in the input form");
            });
        });

        test("CategoryForm handles server side validation error from CreateCategory by showing error toast", async () => {
            mockedAxios.post.mockResolvedValueOnce({
                data: { success: false, message: "Category already exists" },
            });

            render(
                <MemoryRouter>
                <CreateCategory />
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("Electronics")).toBeInTheDocument();
            });

            const createInput = screen.getByPlaceholderText("Enter new category");
            await act(async () => {
                userEvent.type(createInput, "Electronics");
            });

            const submitButton = screen.getAllByRole("button", { name: /submit/i })[0];
            await act(async () => {
                userEvent.click(submitButton);
            });

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith("Category already exists");
            });
        });
    });

    describe("CategoryForm Integration for Update Operation", () => {
        test("CategoryForm in Modal correctly updates category on submit", async () => {
            render(
                <MemoryRouter>
                <CreateCategory />
                </MemoryRouter>
            );

            // verify initial load 
            await waitFor(() => {
                expect(screen.getByText("Electronics")).toBeInTheDocument();
            });
            const editButtons = screen.getAllByRole("button", { name: /edit/i });
            await act(async () => {
                userEvent.click(editButtons[0]);
            });

            const modalInputs = screen.getAllByPlaceholderText("Enter new category");
            const updateInput = modalInputs[1];
            expect(updateInput).toHaveValue("Electronics");

            await act(async () => {
                userEvent.clear(updateInput);
                userEvent.type(updateInput, "Electronics Updated");
            });

            expect(updateInput).toHaveValue("Electronics Updated");

            // submit the category form
            const submitButtons = screen.getAllByRole("button", { name: /submit/i });
            const modalSubmit = submitButtons[1];
            await act(async () => {
                userEvent.click(modalSubmit);
            });

            await waitFor(() => {
                expect(mockedAxios.put).toHaveBeenCalledWith(
                    "/api/v1/category/update-category/1",
                    { name: "Electronics Updated" }
                );
            });

            expect(toast.success).toHaveBeenCalledWith("Electronics Updated is updated");
        });
    });
});