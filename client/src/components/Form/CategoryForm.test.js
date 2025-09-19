import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import CategoryForm from "./CategoryForm";

describe("Given that the CategoryForm accepts an input", () => {

    let mockHandleSubmit;
    let value;
    let setValue;

    beforeEach(() => {
        mockHandleSubmit = jest.fn((e) => e.preventDefault());
        value = "";
        setValue = jest.fn();
    });

    test("When navigating to the form", () => {
        render(<CategoryForm handleSubmit={mockHandleSubmit} value={value} setValue={setValue} />);
        
        expect(screen.getByPlaceholderText("Enter new category")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
    });

    test("When user enters a new category input", () => {
        render(<CategoryForm handleSubmit={mockHandleSubmit} value={value} setValue={setValue} />);
        
        const input = screen.getByPlaceholderText("Enter new category");
        
        fireEvent.change(input, { target: { value: "New Category" } });
        
        expect(setValue).toHaveBeenCalledWith("New Category");
    });

    test("Wen the user clicks the submit button", () => {
        render(<CategoryForm handleSubmit={mockHandleSubmit} value={value} setValue={setValue} />);
        
        const button = screen.getByRole("button", { name: /submit/i });
        
        fireEvent.click(button);
        
        expect(mockHandleSubmit).toHaveBeenCalled();
    });

    test("When the new category has been submitted", () => {
        const longValue = "a".repeat(256); 
        render(<CategoryForm handleSubmit={mockHandleSubmit} value={longValue} setValue={setValue} />);
        
        fireEvent.click(screen.getByRole("button", { name: /submit/i }));
        
        expect(mockHandleSubmit).toHaveBeenCalled();
    });

});
