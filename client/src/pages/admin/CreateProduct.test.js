import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";
import CreateProduct from "./CreateProduct";

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
        
        // suppress console.log
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
});