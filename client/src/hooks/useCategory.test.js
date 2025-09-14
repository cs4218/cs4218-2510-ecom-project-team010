import { renderHook, waitFor } from '@testing-library/react';
import axios from 'axios';
import useCategory from './useCategory';

jest.mock('axios');

describe('useCategory Hook', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Given that the hook is initialized', () => {
        test('When the API call is successful', async () => {
        const mockCategories = [
            { id: 1, name: 'Electronics' },
            { id: 2, name: 'Clothing' },
            { id: 3, name: 'Books' },
        ];
        axios.get.mockResolvedValueOnce({ data: { category: mockCategories } });

        const { result } = renderHook(() => useCategory());

        await waitFor(() => {
            expect(result.current).toEqual(mockCategories);
        });

        expect(axios.get).toHaveBeenCalledWith('/api/v1/category/get-category');
        expect(axios.get).toHaveBeenCalledTimes(1);
        });

        test('When the API call returns empty array', async () => {
        axios.get.mockResolvedValueOnce({ data: { category: [] } });

        const { result } = renderHook(() => useCategory());

        await waitFor(() => {
            expect(result.current).toEqual([]);
        });

        expect(axios.get).toHaveBeenCalledTimes(1);
        });

        test('When the API call returns undefined category', async () => {
        axios.get.mockResolvedValueOnce({ data: { category: undefined } });

        const { result } = renderHook(() => useCategory());

        await waitFor(() => {
            expect(result.current).toBeUndefined();
        });

        expect(axios.get).toHaveBeenCalledTimes(1);
        });

        test('When API response has unexpected structure', async () => {
        axios.get.mockResolvedValueOnce({}); // no data

        const { result } = renderHook(() => useCategory());

        await waitFor(() => {
            expect(result.current).toBeUndefined();
        });

        expect(axios.get).toHaveBeenCalledTimes(1);
        });
    });

    describe('Given multiple hook instances', () => {
        test('When each instance makes its own API call', async () => {
        const mockCategories = [{ id: 1, name: 'Test' }];
        axios.get.mockResolvedValue({ data: { category: mockCategories } });

        const { result: result1 } = renderHook(() => useCategory());
        const { result: result2 } = renderHook(() => useCategory());

        await waitFor(() => {
            expect(result1.current).toEqual(mockCategories);
            expect(result2.current).toEqual(mockCategories);
        });

        expect(axios.get).toHaveBeenCalledTimes(2);
        });
    });
});
