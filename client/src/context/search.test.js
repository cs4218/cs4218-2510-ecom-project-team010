import React from "react";
import { render, waitFor } from "@testing-library/react";
import { useSearch, SearchProvider } from "./search";

test("useSearch provides default values and updates state", async () => {
    let testValues;
    let setAuthFunction;
    
    const SearchTestComponent = () => {
        const [auth, setAuth] = useSearch();
        testValues = auth;
        setAuthFunction = setAuth;
        return null;
    };

    render(
        <SearchProvider>
        <SearchTestComponent />
        </SearchProvider>
    );

    const initialState = { keyword: "", results: [] };
    const updatedState = { keyword: "mock_kw", results: ["mock_result"] };

    expect(testValues).toEqual(initialState);

    await waitFor(() => {
        setAuthFunction(updatedState);
    });

    await waitFor(() => {
        expect(testValues).toEqual(updatedState);
    });
});
