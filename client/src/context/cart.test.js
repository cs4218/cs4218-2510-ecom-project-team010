import React from "react";
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import {useCart, CartProvider} from './cart.js'

// arrange

// mimics a consumer purchasing an item by clicking the button
function TestConsumer() {
  const [cart, setCart] = useCart();
  return (
    <div>
      <div data-testid="count">{cart.length}</div>
      <pre data-testid="cart-content">{JSON.stringify(cart)}</pre>
      <button onClick={() => setCart(prev => [...prev, { id: prev.length + 1, item: `item${prev.length + 1}`, price: "25" }])}>
        add item
      </button>
    </div>
  );
}
  

window.matchMedia = window.matchMedia || function() {
    return {
      matches: false,
      addListener: function() {},
      removeListener: function() {}
    };
  };  

describe('Testing Cart Component', () => {
    //arrange
    beforeEach(() => {
        jest.clearAllMocks();

        let local_store = {}
        Object.defineProperty(window, 'localStorage', {
            value: {
            setItem: jest.fn((k, v) => local_store[k]=v),
            getItem: jest.fn(k => (k in local_store ? local_store[k]: null)),
            removeItem: jest.fn(k => (delete local_store[k])),
            },
            writable: true,
            configurable: true
        });
    }
    );

     it('localStorage is called when component is rendered', async () => {
        //action
        render(
            <CartProvider>
            <TestConsumer />
            </CartProvider>
        );
        //assert
        expect(window.localStorage.getItem).toHaveBeenCalledWith('cart');
    });

    it('child component accesses no items from an empty cart', async () => {
        //action
        render(
            <CartProvider>
            <TestConsumer />
            </CartProvider>
        );

        //assert
        const parsed = JSON.parse(screen.getByTestId('cart-content').textContent);
        expect(parsed).toEqual([]);    
    });

    it('child component accesses correct number of items from a non-empty cart', async () => {
        //arrange
        const stored_items = [
            { id: 1, name: 'book', price: 10 },
            { id: 2, name: 'mouse', price: 20 },
        ];
        window.localStorage.setItem(
            'cart',
            JSON.stringify(stored_items)
        );

        //action
        render(
            <CartProvider>
            <TestConsumer />
            </CartProvider>
        );

        //assert
        await waitFor(() =>
            expect(screen.getByTestId('count')).toHaveTextContent('2')
        );
});

    it('child component accesses correct items from a non-empty cart', async () => {
        //arrange
        const stored_items = [
            { id: 1, name: 'book', price: 10 },
            { id: 2, name: 'mouse', price: 20 },
        ];
        window.localStorage.setItem(
            'cart',
            JSON.stringify(stored_items)
        );

        //action
        render(
            <CartProvider>
            <TestConsumer />
            </CartProvider>
        );

        //assert
        const parsed = JSON.parse(screen.getByTestId('cart-content').textContent);
        expect(parsed).toEqual(stored_items);                 // deep equality
        expect(parsed[0]).toMatchObject({ name: 'book', price: 10 });
        expect(parsed[1]).toMatchObject({ name: 'mouse', price: 20 });
        expect(window.localStorage.getItem).toHaveBeenCalledWith('cart');
});

it('child component can add an item to cart', async () => {
        //arrange
        const stored_items = [
            { id: 1, name: 'book', price: 10 },
            { id: 2, name: 'mouse', price: 20 },
        ];
        window.localStorage.setItem(
            'cart',
            JSON.stringify(stored_items)
        );

        //action
        render(
            <CartProvider>
            <TestConsumer />
            </CartProvider>
        );

        //assert
        const parsed = JSON.parse(screen.getByTestId('cart-content').textContent);
        expect(parsed).toEqual(stored_items);                 // deep equality
        expect(parsed[0]).toMatchObject({ name: 'book', price: 10 });
        expect(parsed[1]).toMatchObject({ name: 'mouse', price: 20 });
        expect(window.localStorage.getItem).toHaveBeenCalledWith('cart');
});

it('child component can update an empty cart with 1 item', async () => {
        //act
        render(
            <CartProvider>
            <TestConsumer />
            </CartProvider>
        );
        //assert
        //ensure that the cart is empty initially, as expected
        expect(screen.getByTestId('count')).toHaveTextContent('0');

        fireEvent.click(screen.getByText('add item'));
       expect(screen.getByTestId('count')).toHaveTextContent('1');

       let parsed = JSON.parse(screen.getByTestId('cart-content').textContent);
       expect(parsed).toEqual([{ id: 1, item: 'item1', price: '25' }]);
});
//can also test removal of item 
}
);