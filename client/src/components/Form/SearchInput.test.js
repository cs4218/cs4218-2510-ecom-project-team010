import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import SearchInput from './SearchInput';
import { useSearch } from '../../context/search';
import { useNavigate } from 'react-router-dom';

// Mock dependencies
jest.mock('axios');
jest.mock('../../context/search');
jest.mock('react-router-dom');

const defaultSearchState = { keyword: '', results: [] };
const mockSetValues = jest.fn();
const mockNavigate = jest.fn();


describe("Given that a user types into the search input", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useSearch.mockReturnValue([defaultSearchState, mockSetValues]);
        useNavigate.mockReturnValue(mockNavigate);
    });

    test("When user enters a keyword and clicks on the search button", async () => {
        const mockData = { data: [{ id: 1, name: 'Test Search' }] };
        axios.get.mockResolvedValueOnce(mockData);

        const currentSearchState = { ...defaultSearchState, keyword: 'test' }
        useSearch.mockReturnValueOnce([currentSearchState, mockSetValues]);
        
        const { getByRole, getByPlaceholderText } = render(<SearchInput />);
        
        fireEvent.change(getByPlaceholderText('Search'), { target: { value: 'test' } });
        fireEvent.click(getByRole('button', { name: /search/i }));

        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith('/api/v1/product/search/test');
        });
        
        await waitFor(() => {
            expect(mockSetValues).toHaveBeenCalledWith({
            ...currentSearchState,
            results: mockData.data
            });
        });
        
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/search');
        });
    });

    test("When user removes keyword and clicks on the search button", async () => {
        axios.get.mockResolvedValueOnce({ data: [] });
        
        render(<SearchInput />);
        
        const input = screen.getByPlaceholderText('Search');
        const searchButton = screen.getByRole('button', { name: /search/i });
        
        fireEvent.change(input, { target: { value: '' } });
        fireEvent.click(searchButton);

        expect(axios.get).toHaveBeenCalledWith('/api/v1/product/search/');
    });

    test("When input value changes", () => {
        render(<SearchInput />);
        
        const input = screen.getByPlaceholderText('Search');
        fireEvent.change(input, { target: { value: 'new search' } });

        expect(mockSetValues).toHaveBeenCalledWith({
            ...defaultSearchState,
            keyword: 'new search'
        });
    });
});