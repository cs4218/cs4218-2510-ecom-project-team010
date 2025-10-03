import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CreateCategory from "./CreateCategory";
import axios from "axios";
import toast from "react-hot-toast";

// Note: Some of these test cases are generated with the help of AI

jest.mock("axios");
jest.mock("react-hot-toast");

jest.mock("./../../components/Layout", () => {
    return function Layout({ children, title }) {
        return (
        <div data-testid="layout" title={title}>
            {children}
        </div>
        );
    };
});

jest.mock("./../../components/AdminMenu", () => {
    return function AdminMenu() {
        return <div data-testid="admin-menu">Admin Menu</div>;
    };
});

jest.mock("../../components/Form/CategoryForm", () => {
    return function CategoryForm({ handleSubmit, value, setValue }) {
        return (
            <form onSubmit={handleSubmit} data-testid="category-form">
                <input
                    type="text"
                    placeholder="Enter new category"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    data-testid="category-input"
                />
                <button type="submit">Submit</button>
            </form>
        );
    };
});

jest.mock("antd", () => ({
    Modal: ({ children, open, onCancel }) => {
        return open ? (
        <div data-testid="modal">
            <button onClick={onCancel} data-testid="modal-close">
                Close
            </button>
            {children}
        </div>
        ) : null;
    },
}));

describe("Given some existing categories", () => {
    const categoriesMock = [
        { _id: "1", name: "Category 1" },
        { _id: "2", name: "Category 2" },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        // Default mock for initial category fetch
        axios.get.mockResolvedValue({
            data: { success: true, category: categoriesMock }
        });
    });

    test("When navigating to the create category page", async () => {
        render(<CreateCategory />);

        expect(screen.getByTestId("category-input")).toBeInTheDocument();
        expect(screen.getByText(/manage category/i)).toBeInTheDocument();
        expect(screen.getByText(/name/i)).toBeInTheDocument();
        expect(screen.getByText(/actions/i)).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText("Category 1")).toBeInTheDocument();
            expect(screen.getByText("Category 2")).toBeInTheDocument();
        });
    });

    test("When the user submits a new category", async () => {
        axios.post.mockResolvedValue({ data: { success: true } });

        render(<CreateCategory />);

        await waitFor(() => screen.getByText("Category 1"));

        const input = screen.getByTestId("category-input");
        const button = screen.getByRole("button", { name: /submit/i });

        fireEvent.change(input, { target: { value: "New Cat" } });
        fireEvent.click(button);

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith("/api/v1/category/create-category", { 
                name: "New Cat" 
            });
            expect(toast.success).toHaveBeenCalledWith("New Cat is created");
        });

        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledTimes(2);
        });
    });

    test("When the user clicks on the delete button", async () => {
        axios.delete.mockResolvedValue({ data: { success: true } });

        render(<CreateCategory />);

        await waitFor(() => screen.getByText("Category 1"));

        const deleteButtons = screen.getAllByText(/delete/i);

        fireEvent.click(deleteButtons[0]);

        await waitFor(() => {
            expect(axios.delete).toHaveBeenCalledWith("/api/v1/category/delete-category/1");
            expect(toast.success).toHaveBeenCalledWith("Category is deleted");
        });

        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledTimes(2); 
        });
    });

    test("When the user edits and submit a new category", async () => {
        axios.put.mockResolvedValue({ data: { success: true } });

        render(<CreateCategory />);

        await waitFor(() => screen.getByText("Category 1"));

        const editButtons = screen.getAllByText(/edit/i);
        fireEvent.click(editButtons[0]);

        await waitFor(() => screen.getByTestId("modal"));

        const modalInputs = screen.getAllByTestId("category-input");
        const modalInput = modalInputs[1];
        const modalButtons = screen.getAllByRole("button", { name: /submit/i });
        const modalButton = modalButtons[1];

        fireEvent.change(modalInput, { target: { value: "Updated Cat" } });
        fireEvent.click(modalButton);

        await waitFor(() => {
            expect(axios.put).toHaveBeenCalledWith("/api/v1/category/update-category/1", { 
                name: "Updated Cat" 
            });
            expect(toast.success).toHaveBeenCalledWith("Updated Cat is updated");
        });

        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledTimes(2);
        });
    });

    test("When the user inserts an empty input submission", async () => {
        axios.post.mockResolvedValue({ 
            data: { success: false, message: "Invalid input" } 
        });

        render(<CreateCategory />);

        await waitFor(() => screen.getByTestId("category-input"));

        const input = screen.getByTestId("category-input");
        const button = screen.getByRole("button", { name: /submit/i });

        fireEvent.change(input, { target: { value: "" } });
        fireEvent.click(button);

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith("/api/v1/category/create-category", { 
                name: "" 
            });
            expect(toast.error).toHaveBeenCalledWith("Invalid input");
        });
    });
});

describe("Given API error scenarios", () => {
    const categoriesMock = [
        { _id: "1", name: "Category 1" },
        { _id: "2", name: "Category 2" },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        axios.get.mockResolvedValue({
            data: { success: true, category: categoriesMock }
        });
    });

    test("When category creation API fails with network error", async () => {
        axios.post.mockRejectedValue(new Error("Network Error"));
        jest.spyOn(console, "log").mockImplementation(() => {}); // suppress logs

        render(<CreateCategory />);

        await waitFor(() => screen.getByText("Category 1"));

        const input = screen.getByTestId("category-input");
        const button = screen.getByRole("button", { name: /submit/i });

        fireEvent.change(input, { target: { value: "Failed Cat" } });
        fireEvent.click(button);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Something went wrong in the input form");
        });
    });

    test("When category update API fails with network error", async () => {
        axios.put.mockRejectedValue(new Error("Network Error"));
        jest.spyOn(console, "log").mockImplementation(() => {}); // suppress logs

        render(<CreateCategory />);

        await waitFor(() => screen.getByText("Category 1"));

        const editButtons = screen.getAllByText(/edit/i);
        fireEvent.click(editButtons[0]);

        await waitFor(() => screen.getByTestId("modal"));

        const modalInputs = screen.getAllByTestId("category-input");
        const modalInput = modalInputs[1];
        const modalButtons = screen.getAllByRole("button", { name: /submit/i });
        const modalButton = modalButtons[1];

        fireEvent.change(modalInput, { target: { value: "Failed Update" } });
        fireEvent.click(modalButton);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Something went wrong when updating category");
        });
    });

    test("When category deletion API fails with network error", async () => {
        axios.delete.mockRejectedValue(new Error("Network Error"));

        render(<CreateCategory />);

        await waitFor(() => screen.getByText("Category 1"));

        const deleteButtons = screen.getAllByText(/delete/i);
        fireEvent.click(deleteButtons[0]);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Something went wrong when deleting category");
        });
    });

    test("When initial category fetch fails", async () => {
        axios.get.mockRejectedValue(new Error("Network Error"));

        render(<CreateCategory />);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Something went wrong when fetching category");
        });
    });

    test("When update API returns failure response", async () => {
        axios.put.mockResolvedValue({ 
            data: { success: false, message: "Update failed" } 
        });

        render(<CreateCategory />);

        await waitFor(() => screen.getByText("Category 1"));

        const editButtons = screen.getAllByText(/edit/i);
        fireEvent.click(editButtons[0]);

        await waitFor(() => screen.getByTestId("modal"));

        const modalInputs = screen.getAllByTestId("category-input");
        const modalInput = modalInputs[1];
        const modalButtons = screen.getAllByRole("button", { name: /submit/i });
        const modalButton = modalButtons[1];

        fireEvent.change(modalInput, { target: { value: "Failed Update" } });
        fireEvent.click(modalButton);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Update failed");
        });
    });

    test("When delete API returns failure response", async () => {
        axios.delete.mockResolvedValue({ 
            data: { success: false, message: "Delete failed" } 
        });

        render(<CreateCategory />);

        await waitFor(() => screen.getByText("Category 1"));

        const deleteButtons = screen.getAllByText(/delete/i);
        fireEvent.click(deleteButtons[0]);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Delete failed");
        });
    });
});

describe("Given modal interactions", () => {
    const categoriesMock = [
        { _id: "1", name: "Category 1" },
        { _id: "2", name: "Category 2" },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        axios.get.mockResolvedValue({
            data: { success: true, category: categoriesMock }
        });
    });

    test("When the user opens and closes the edit modal", async () => {
        render(<CreateCategory />);

        await waitFor(() => screen.getByText("Category 1"));

        expect(screen.queryByTestId("modal")).not.toBeInTheDocument();

        const editButtons = screen.getAllByText(/edit/i);
        fireEvent.click(editButtons[0]);

        await waitFor(() => screen.getByTestId("modal"));

        const modalInputs = screen.getAllByTestId("category-input");
        const modalInput = modalInputs[1];
        expect(modalInput).toHaveValue("Category 1");

        const closeButton = screen.getByTestId("modal-close");
        fireEvent.click(closeButton);

        await waitFor(() => {
            expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
        });
    });

    test("When the user edits different categories", async () => {
        render(<CreateCategory />);

        await waitFor(() => screen.getByText("Category 2"));

        const editButtons = screen.getAllByText(/edit/i);
        fireEvent.click(editButtons[1]); // Click edit for Category 2

        await waitFor(() => screen.getByTestId("modal"));

        const modalInputs = screen.getAllByTestId("category-input");
        const modalInput = modalInputs[1];
        expect(modalInput).toHaveValue("Category 2");
    });
});

describe("Given category data with special characters and edge values", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("When categories contain special characters", async () => {
        const specialCategoriesMock = [
            { _id: "1", name: "Category & Special" },
            { _id: "2", name: "Category <script>" },
            { _id: "3", name: "" }, // Empty name
        ];

        axios.get.mockResolvedValue({
            data: { success: true, category: specialCategoriesMock }
        });

        render(<CreateCategory />);

        await waitFor(() => {
            expect(screen.getByText("Category & Special")).toBeInTheDocument();
            expect(screen.getByText("Category <script>")).toBeInTheDocument();
            const tableRows = screen.getAllByRole('row');
            expect(tableRows).toHaveLength(4); 
        });
    });

    test("When category name is very long", async () => {
        const longName = "A".repeat(1000);
        const longCategoriesMock = [
            { _id: "1", name: longName },
        ];

        axios.get.mockResolvedValue({
            data: { success: true, category: longCategoriesMock }
        });

        render(<CreateCategory />);

        await waitFor(() => {
            expect(screen.getByText(longName)).toBeInTheDocument();
        });
    });
});