import React from 'react';
import axios from 'axios';
import SearchInput from './SearchInput';

// Mocking axios.post
jest.mock('axios');

const defaultSearchState = { keyword: '', results: [] };
const mockUseSearch = jest.fn();
const mockNavigate = jest.fn();

describe("Given that a user types into the search input", () => {
    beforeEach(() => {
        jest.clearAllMocks();

        mockUseSearch.mockReturnValue([
            defaultSearchState,
            mockSetValues
        ]);
    });

    test("When user enters a keyword and clicks on the search button", () => {
        // pass
    });

    test("When user removes keyword and clicks on the search button", () => {
        // pass
    });
});