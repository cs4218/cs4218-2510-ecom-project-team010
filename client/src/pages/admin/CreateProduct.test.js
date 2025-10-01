import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import CreateProduct from "./CreateProduct";

// Note: Some of these test cases are generated with the help of AI

jest.mock("axios");
jest.mock("react-hot-toast");

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate,
}));

jest.mock("./../../components/Layout", () => ({ children, title }) => (
    <div data-testid="layout" title={title}>
        {children}
    </div>
));

jest.mock("./../../components/AdminMenu", () => () => (
    <div data-testid="admin-menu">AdminMenu</div>
));

jest.mock("antd", () => {
    const MockSelect = ({ children, onChange, placeholder, className }) => (
        <select
            data-testid={placeholder && placeholder.includes("category") ? "category-select" : "shipping-select"}
            className={className}
            onChange={(e) => onChange && onChange(e.target.value)}
        >
        <option value="">{placeholder}</option>
            {children}
        </select>
    );

    const MockOption = ({ children, value }) => (
        <option value={value}>{children}</option>
    );

    MockSelect.Option = MockOption;

    return {
        Select: MockSelect,
    };
});

const Wrapper = ({ children }) => <BrowserRouter>{children}</BrowserRouter>;

describe("Given some products to be updated", () => {
    const mockCategories = [
        { _id: "1", name: "Electronics" },
        { _id: "2", name: "Clothing" },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        mockNavigate.mockClear();
        
        axios.get.mockResolvedValue({
            data: { success: true, category: mockCategories },
        });

        global.URL.createObjectURL = jest.fn(() => "mocked-url");
        
        jest.spyOn(console, "log").mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("When the user navigates to the create product page", async () => {
        await act(async () => {
            render(<CreateProduct />, { wrapper: Wrapper });
        });

        expect(screen.getByText("Create Product")).toBeInTheDocument();
        expect(screen.getByTestId("layout")).toBeInTheDocument();
        expect(screen.getByTestId("admin-menu")).toBeInTheDocument();

        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith("/api/v1/category/get-category");
        });
    });

    test("When the page mounts", async () => {
        await act(async () => {
            render(<CreateProduct />, { wrapper: Wrapper });
        });

        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith("/api/v1/category/get-category");
        });
    });

    test("When the user edits the product name input", async () => {
        await act(async () => {
            render(<CreateProduct />, { wrapper: Wrapper });
        });

        const nameInput = screen.getByPlaceholderText("Product Name");
        fireEvent.change(nameInput, { target: { value: "Test Product" } });

        expect(nameInput).toHaveValue("Test Product");
    });

    test("When the user edits the product description input", async () => {
        await act(async () => {
            render(<CreateProduct />, { wrapper: Wrapper });
        });

        const descriptionInput = screen.getByPlaceholderText("Product Description");
        fireEvent.change(descriptionInput, {
            target: { value: "Test Description" },
        });

        expect(descriptionInput).toHaveValue("Test Description");
    });

    test("When the user edits the product price input", async () => {
        await act(async () => {
        render(<CreateProduct />, { wrapper: Wrapper });
    });

        const priceInput = screen.getByPlaceholderText("Product Price");
        fireEvent.change(priceInput, { target: { value: "100" } });

        expect(priceInput).toHaveValue(100);
    });

    test("When the user edits the product quantity input", async () => {
        await act(async () => {
            render(<CreateProduct />, { wrapper: Wrapper });
        });

        const quantityInput = screen.getByPlaceholderText("Product Quantity");
        fireEvent.change(quantityInput, { target: { value: "50" } });

        expect(quantityInput).toHaveValue(50);
    });

    test("When the user selects a category", async () => {
        await act(async () => {
            render(<CreateProduct />, { wrapper: Wrapper });
        });

        await waitFor(() => {
            const categorySelect = screen.getByTestId("category-select");
            expect(categorySelect).toBeInTheDocument();
        });

        const categorySelect = screen.getByTestId("category-select");
        fireEvent.change(categorySelect, { target: { value: "1" } });

        expect(categorySelect).toHaveValue("1");
    });

    test("When the user selects the shipping", async () => {
        await act(async () => {
            render(<CreateProduct />, { wrapper: Wrapper });
        });

        const shippingSelect = screen.getByTestId("shipping-select");
        fireEvent.change(shippingSelect, { target: { value: "1" } });

        expect(shippingSelect).toHaveValue("1");
    });

    test("When the user adds a product image", async () => {
        await act(async () => {
            render(<CreateProduct />, { wrapper: Wrapper });
        });

        const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
        const fileInput = screen.getByText("Upload Photo").querySelector("input[type='file']");

        fireEvent.change(fileInput, { target: { files: [file] } });

        await waitFor(() => {
            expect(screen.getByText("test.jpg")).toBeInTheDocument();
        });
    });

    test("When the user finished uploading a new product image", async () => {
        await act(async () => {
            render(<CreateProduct />, { wrapper: Wrapper });
        });

        const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
        const fileInput = screen.getByText("Upload Photo").querySelector("input[type='file']");

        fireEvent.change(fileInput, { target: { files: [file] } });

        await waitFor(() => {
            const image = screen.getByAltText("product_photo");
            expect(image).toBeInTheDocument();
            expect(image).toHaveAttribute("src", "mocked-url");
            expect(global.URL.createObjectURL).toHaveBeenCalledWith(file);
        });
    });

    test("When the user clicks the create product button with valid data", async () => {
        axios.post.mockResolvedValue({
            data: { success: true },
        });

        await act(async () => {
            render(<CreateProduct />, { wrapper: Wrapper });
        });

        // Fill in form data
        const nameInput = screen.getByPlaceholderText("Product Name");
        const descriptionInput = screen.getByPlaceholderText("Product Description");
        const priceInput = screen.getByPlaceholderText("Product Price");
        const quantityInput = screen.getByPlaceholderText("Product Quantity");
        
        fireEvent.change(nameInput, { target: { value: "Test Product" } });
        fireEvent.change(descriptionInput, { target: { value: "Test Description" } });
        fireEvent.change(priceInput, { target: { value: "100" } });
        fireEvent.change(quantityInput, { target: { value: "50" } });

        const categorySelect = screen.getByTestId("category-select");
        fireEvent.change(categorySelect, { target: { value: "1" } });

        const shippingSelect = screen.getByTestId("shipping-select");
        fireEvent.change(shippingSelect, { target: { value: "1" } });

        // Upload file first, then find the input
        const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
        const fileInput = screen.getByText("Upload Photo").querySelector("input[type='file']");
        fireEvent.change(fileInput, { target: { files: [file] } });

        // Wait for the file to be uploaded and UI to update
        await waitFor(() => {
            expect(screen.getByText("test.jpg")).toBeInTheDocument();
        });

        // Click create button
        const createButton = screen.getByText("CREATE PRODUCT");
        fireEvent.click(createButton);

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                "/api/v1/product/create-product",
                expect.any(FormData)
            );
            expect(toast.success).toHaveBeenCalledWith("Product Created Successfully");
            expect(mockNavigate).toHaveBeenCalledWith("/dashboard/admin/products");
        });
    });

    test("When the user clicks create product button but API returns failure", async () => {
        axios.post.mockResolvedValue({
            data: { success: false, message: "Product creation failed" },
        });

        await act(async () => {
            render(<CreateProduct />, { wrapper: Wrapper });
        });

        const createButton = screen.getByText("CREATE PRODUCT");
        fireEvent.click(createButton);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Product creation failed");
        });
    });

    test("When the create product API call fails with error", async () => {
        axios.post.mockRejectedValue(new Error("Network error"));

        await act(async () => {
            render(<CreateProduct />, { wrapper: Wrapper });
        });

        const createButton = screen.getByText("CREATE PRODUCT");
        fireEvent.click(createButton);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Something went wrong in creating new product");
        });
    });

    test("When the category API call fails", async () => {
        axios.get.mockRejectedValue(new Error("Network error"));

        await act(async () => {
            render(<CreateProduct />, { wrapper: Wrapper });
        });

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Something wwent wrong in getting category");
        });
    });

    test("When the category API returns unsuccessful response", async () => {
        axios.get.mockResolvedValue({
            data: { success: false },
        });

        await act(async () => {
            render(<CreateProduct />, { wrapper: Wrapper });
        });

        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith("/api/v1/category/get-category");
        });

        const categorySelect = screen.getByTestId("category-select");
        expect(categorySelect.children).toHaveLength(1);
    });

    test("When all form fields are filled correctly", async () => {
        await act(async () => {
            render(<CreateProduct />, { wrapper: Wrapper });
        });

        fireEvent.change(screen.getByPlaceholderText("Product Name"), { target: { value: "Test Product" } });
        fireEvent.change(screen.getByPlaceholderText("Product Description"), { target: { value: "Test Description" } });
        fireEvent.change(screen.getByPlaceholderText("Product Price"), { target: { value: "100" } });
        fireEvent.change(screen.getByPlaceholderText("Product Quantity"), { target: { value: "50" } });
        
        fireEvent.change(screen.getByTestId("category-select"), { target: { value: "1" } });
        fireEvent.change(screen.getByTestId("shipping-select"), { target: { value: "1" } });

        const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
        const fileInput = screen.getByText("Upload Photo").querySelector("input[type='file']");
        fireEvent.change(fileInput, { target: { files: [file] } });

        expect(screen.getByPlaceholderText("Product Name")).toHaveValue("Test Product");
        expect(screen.getByPlaceholderText("Product Description")).toHaveValue("Test Description");
        expect(screen.getByPlaceholderText("Product Price")).toHaveValue(100);
        expect(screen.getByPlaceholderText("Product Quantity")).toHaveValue(50);
        expect(screen.getByTestId("category-select")).toHaveValue("1");
        expect(screen.getByTestId("shipping-select")).toHaveValue("1");
        
        await waitFor(() => {
            expect(screen.getByText("test.jpg")).toBeInTheDocument();
        });
    });

    test("When the component renders with correct layout structure", async () => {
        await act(async () => {
            render(<CreateProduct />, { wrapper: Wrapper });
        });

        expect(screen.getByTestId("layout")).toHaveAttribute("title", "Dashboard - Create Product");
        expect(screen.getByTestId("admin-menu")).toBeInTheDocument();
        expect(screen.getByText("Create Product")).toBeInTheDocument();
        expect(screen.getByText("CREATE PRODUCT")).toBeInTheDocument();
    });

    test("When categories are loaded successfully", async () => {
        await act(async () => {
            render(<CreateProduct />, { wrapper: Wrapper });
        });

        await waitFor(() => {
            const categorySelect = screen.getByTestId("category-select");
            expect(categorySelect).toBeInTheDocument();
            expect(categorySelect.children).toHaveLength(3);
        });
    });

    test("When the shipping select displays correct options", async () => {
        await act(async () => {
            render(<CreateProduct />, { wrapper: Wrapper });
        });

        const shippingSelect = screen.getByTestId("shipping-select");
        expect(shippingSelect).toBeInTheDocument();
        
        expect(shippingSelect.children).toHaveLength(3);
        expect(screen.getByText("No")).toBeInTheDocument();
        expect(screen.getByText("Yes")).toBeInTheDocument();
    });
});