import React from "react";
import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { useCart, CartProvider } from "./cart.js";

// Note: these test cases are generated with the help of AI

// arrange

// mimics a consumer purchasing an item by clicking an "add item" button.
// consumer can also clear cart with the "clear cart" button.
// also displays the number of items in this cart and the content for easy reference
// during tesing.
function TestConsumer() {
  const [cart, setCart] = useCart();
  return (
    <div>
      <div data-testid="count">{cart.length}</div>
      <pre data-testid="cart-content">{JSON.stringify(cart)}</pre>
      <button
        onClick={() =>
          setCart((prev) => [
            ...prev,
            { id: prev.length + 1, name: `item${prev.length + 1}`, price: 25 },
          ])
        }
      >
        add item
      </button>
      <button onClick={() => setCart([])}>clear cart</button>
    </div>
  );
}

window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: function () {},
      removeListener: function () {},
    };
  };

describe("Testing cart component", () => {
  //arrange
  beforeEach(() => {
    jest.clearAllMocks();

    // Provide a mock implementation of localStorage.
    // This lets tests verify that components read/write to localStorage
    // without touching the real browser storage.
    let local_store = {};
    Object.defineProperty(window, "localStorage", {
      value: {
        setItem: jest.fn((k, v) => (local_store[k] = v)),
        getItem: jest.fn((k) => (k in local_store ? local_store[k] : null)),
        removeItem: jest.fn((k) => delete local_store[k]),
      },
      writable: true,
      configurable: true,
    });
  });

  it("Cart is initalised correctly and calls LocalStorage.", async () => {
    // act
    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>
    );

    // assert
    expect(window.localStorage.getItem).toHaveBeenCalledWith("cart");
  });

  it("Child component accesses no items from an empty cart.", async () => {
    // act
    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>
    );
    const parsed = JSON.parse(screen.getByTestId("cart-content").textContent);

    // assert
    expect(parsed).toEqual([]);
  });

  it("Child component accesses correct items from a non-empty cart.", async () => {
    // arrange
    const stored_items = [
      { id: 1, name: "book", price: 10 },
      { id: 2, name: "mouse", price: 20 },
    ];

    // act
    window.localStorage.setItem("cart", JSON.stringify(stored_items));
    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>
    );
    const parsed = JSON.parse(screen.getByTestId("cart-content").textContent);

    // assert
    expect(parsed).toEqual(stored_items);
    expect(parsed[0]).toMatchObject({ name: "book", price: 10 });
    expect(parsed[1]).toMatchObject({ name: "mouse", price: 20 });
  });

  it("Child component can add an item to cart.", async () => {
    // arrange
    const stored_items = [
      { id: 1, name: "book", price: 10 },
      { id: 2, name: "mouse", price: 20 },
    ];

    // act
    window.localStorage.setItem("cart", JSON.stringify(stored_items));
    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>
    );
    fireEvent.click(screen.getByText("add item"));
    const parsed = JSON.parse(screen.getByTestId("cart-content").textContent);

    // assert
    expect(screen.getByTestId("count")).toHaveTextContent("3")
    expect(parsed).toEqual([
      { id: 1, name: "book", price: 10 },
      { id: 2, name: "mouse", price: 20 },
      { id: 3, name: "item3", price: 25 },
    ]);
  });

  it("Child component can clear the cart.", async () => {
    // arrange
    const stored_items = [
      { id: 1, name: "book", price: 10 },
      { id: 2, name: "mouse", price: 20 },
    ];

    // act
    window.localStorage.setItem("cart", JSON.stringify(stored_items));
    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>
    );
    fireEvent.click(screen.getByText("clear cart"));
    const parsed = JSON.parse(screen.getByTestId("cart-content").textContent);

    // assert
    expect(screen.getByTestId("count")).toHaveTextContent("0")
    expect(parsed).toEqual([]);
  });
});
