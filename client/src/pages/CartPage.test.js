import React from "react";
import {
  render,
  screen,
  within,
  waitFor,
  fireEvent,
} from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import axios from "axios";
import toast from "react-hot-toast";
import CartPage from "./CartPage";

// Note: these test cases are genereated with the help of AI

// arrange
jest.mock("axios", () => ({
  __esModule: true,
  default: {
    get: jest.fn().mockResolvedValue({ data: { clientToken: "tok" } }),
    post: jest.fn(),
  },
}));
jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: { success: jest.fn(), error: jest.fn() },
}));

jest.mock("../context/auth", () => ({
  useAuth: jest.fn(),
}));
jest.mock("../context/cart", () => ({
  useCart: jest.fn(),
}));

jest.mock("./../components/Layout", () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>,
}));

let mockRequestPaymentMethod;
let mockDropInProvided = false;
jest.mock("braintree-web-drop-in-react", () => {
  const React = require("react");
  return function MockDropIn({ onInstance }) {
    React.useEffect(() => {
      if (mockDropInProvided) return;
      mockDropInProvided = true;
      onInstance({
        requestPaymentMethod: (...args) => mockRequestPaymentMethod?.(...args),
      });
    }, [onInstance]);
    return null;
  };
});

const flush = () => new Promise((r) => setTimeout(r, 0));

beforeEach(() => {
  mockDropInProvided = false;
  mockRequestPaymentMethod = undefined;
});

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});
beforeEach(() => mockNavigate.mockReset());

const { useAuth } = require("../context/auth");
const { useCart } = require("../context/cart");

describe("CartPage totalPrice()", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue([
      { token: "t", user: { name: "Alice", address: "123 Main" } },
      jest.fn(),
    ]);
  });

  it("displays the total price accurately for a cart with 1 item.", async () => {
    // arrange
    useCart.mockReturnValue([
      [{ _id: "1", name: "Item A", description: "aaaaaa", price: 20 }],
      jest.fn(),
    ]);

    // act
    render(
      <MemoryRouter initialEntries={["/cart"]}>
        <Routes>
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </MemoryRouter>
    );

    // assert
    expect(await screen.findByText(/Total : \$20\.00/i)).toBeInTheDocument();
  });

  it("displays the total price accurately for a cart with more than 1 item.", async () => {
    // arrange
    useCart.mockReturnValue([
      [
        { _id: "1", name: "Item A", description: "aaaaaa", price: 20 },
        { _id: "2", name: "Item B", description: "bbbbbb", price: 49 },
      ],
      jest.fn(),
    ]);

    // act
    render(
      <MemoryRouter initialEntries={["/cart"]}>
        <Routes>
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </MemoryRouter>
    );

    // assert
    expect(await screen.findByText(/Total : \$69\.00/i)).toBeInTheDocument();
  });

  it("displays the total price accurately for a cart with no items.", async () => {
    // arrange
    useCart.mockReturnValue([[], jest.fn()]);

    // act
    render(
      <MemoryRouter initialEntries={["/cart"]}>
        <Routes>
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </MemoryRouter>
    );

    // assert
    expect(await screen.findByText(/Total : \$0\.00/i)).toBeInTheDocument();
  });

  it("displays the total price accurately for a cart where prices are strings.", async () => {
    // arrange
    useCart.mockReturnValue([
      [
        { _id: "1", name: "Item A", description: "aaaaaa", price: "20" },
        { _id: "2", name: "Item B", description: "bbbbbb", price: "49" },
      ],
      jest.fn(),
    ]);

    // act
    render(
      <MemoryRouter initialEntries={["/cart"]}>
        <Routes>
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </MemoryRouter>
    );

    // assert
    expect(await screen.findByText(/Total : \$69\.00/i)).toBeInTheDocument();
  });

  it("logs error when toLocaleString throws", async () => {
    // arrange
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    useAuth.mockReturnValue([
      { token: "t", user: { name: "A", address: "X" } },
      jest.fn(),
    ]);
    useCart.mockReturnValue([[], jest.fn()]);

    const toLocaleSpy = jest
      .spyOn(Number.prototype, "toLocaleString")
      .mockImplementation(() => {
        throw new Error("boom");
      });

    // act
    render(
      <MemoryRouter initialEntries={["/cart"]}>
        <Routes>
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() =>
      expect(axios.get).toHaveBeenCalledWith("/api/v1/product/braintree/token")
    );

    // assert
    expect(logSpy).toHaveBeenCalledWith(expect.any(Error));
    expect(logSpy.mock.calls[0][0].message).toBe("boom");
    toLocaleSpy.mockRestore();
    logSpy.mockRestore();
  });
});

describe("testing deleteCartItem", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue([
      { token: "t", user: { name: "Alice", address: "123 Main" } },
      jest.fn(),
    ]);
  });

  const mount = () =>
    render(
      <MemoryRouter initialEntries={["/cart"]}>
        <Routes>
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </MemoryRouter>
    );

  const waitToken = () =>
    waitFor(() =>
      expect(axios.get).toHaveBeenCalledWith("/api/v1/product/braintree/token")
    );

  it("no remove button rendered for empty cart", async () => {
    // arrange
    const setCart = jest.fn();
    useCart.mockReturnValue([[], setCart]);
    const setItemSpy = jest.spyOn(window.localStorage.__proto__, "setItem");

    // act
    mount();
    await waitToken();

    // assert
    expect(screen.queryByRole("button", { name: /remove/i })).toBeNull();
    expect(setCart).not.toHaveBeenCalled();
    expect(setItemSpy).not.toHaveBeenCalled();
    setItemSpy.mockRestore();
  });

  it("removes item from a cart with 1 item", async () => {
    // arrange
    const a = { _id: "A", name: "Shirt", description: "cotton", price: 10 };
    const setCart = jest.fn();
    useCart.mockReturnValue([[a], setCart]);
    const setItemSpy = jest.spyOn(window.localStorage.__proto__, "setItem");

    // act
    mount();
    await waitToken();
    const aCard = screen.getByText("Name : Shirt").closest(".card");
    const removeBtn = within(aCard).getByRole("button", { name: /remove/i });
    fireEvent.click(removeBtn);

    // assert
    expect(setCart).toHaveBeenCalledWith([]);
    expect(setItemSpy).toHaveBeenCalledWith("cart", JSON.stringify([]));
    setItemSpy.mockRestore();
  });

  it("removes 1 item from a cart with 1 item", async () => {
    // arrange
    const a = { _id: "A", name: "Shirt", description: "cotton", price: 10 };
    const setCart = jest.fn();
    useCart.mockReturnValue([[a], setCart]);
    const setItemSpy = jest.spyOn(window.localStorage.__proto__, "setItem");

    // act
    mount();
    await waitToken();
    const aCard = screen.getByText("Name : Shirt").closest(".card");
    const removeBtn = within(aCard).getByRole("button", { name: /remove/i });
    fireEvent.click(removeBtn);

    // assert
    expect(setCart).toHaveBeenCalledWith([]);
    expect(setItemSpy).toHaveBeenCalledWith("cart", JSON.stringify([]));
    setItemSpy.mockRestore();
  });

  it("removes 1 item from a cart with multiple items", async () => {
    // arrange
    const a = { _id: "A", name: "Shirt", description: "cotton", price: 10 };
    const b = { _id: "B", name: "Item B", description: "bbbbbb", price: 49 };
    const setCart = jest.fn();
    useCart.mockReturnValue([[a, b], setCart]);
    const setItemSpy = jest.spyOn(window.localStorage.__proto__, "setItem");

    // act
    mount();
    await waitToken();
    const aCard = screen.getByText("Name : Shirt").closest(".card");
    const removeBtn = within(aCard).getByRole("button", { name: /remove/i });
    fireEvent.click(removeBtn);

    // assert
    expect(setCart).toHaveBeenCalledWith([b]);
    expect(setItemSpy).toHaveBeenCalledWith("cart", JSON.stringify([b]));
    setItemSpy.mockRestore();
  });

  //found error here + fixed
  it("removes 1 item from a cart with multiple repeated items", async () => {
    // arrange
    const a = { _id: "A", name: "Shirt", description: "cotton", price: 10 };
    const b = { _id: "B", name: "Item B", description: "bbbbbb", price: 49 };
    const setCart = jest.fn();
    useCart.mockReturnValue([[a, b, b], setCart]);
    const setItemSpy = jest.spyOn(window.localStorage.__proto__, "setItem");

    // actg
    mount();
    await waitToken();
    const aCard = screen.getByText("Name : Shirt").closest(".card");
    const removeBtn = within(aCard).getByRole("button", { name: /remove/i });
    fireEvent.click(removeBtn);

    // assert
    expect(setCart).toHaveBeenCalledWith([b, b]);
    expect(setItemSpy).toHaveBeenCalledWith("cart", JSON.stringify([b, b]));
    setItemSpy.mockRestore();
  });
});

describe("testing getToken", () => {
  const renderOnCart = () =>
    render(
      <MemoryRouter initialEntries={["/cart"]}>
        <Routes>
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </MemoryRouter>
    );

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue([
      { token: "t", user: { name: "Alice", address: "123 Main" } },
      jest.fn(),
    ]);

    useCart.mockReturnValue([
      [{ _id: "1", name: "Item A", description: "aaaaaa", price: 10 }],
      jest.fn(),
    ]);
  });

  it("calls /token and shows payment UI on success", async () => {
    // arrange
    axios.get.mockResolvedValueOnce({ data: { clientToken: "tok_123" } });

    // act
    renderOnCart();
    await waitFor(() =>
      expect(axios.get).toHaveBeenCalledWith("/api/v1/product/braintree/token")
    );

    // assert
    expect(
      await screen.findByRole("button", { name: /make payment/i })
    ).toBeInTheDocument();
  });

  it("logs error and does not show payment UI on failure", async () => {
    // arrange
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    axios.get.mockRejectedValueOnce(new Error("network down"));

    // act
    renderOnCart();
    await waitFor(() => expect(axios.get).toHaveBeenCalled());

    // assert
    expect(logSpy).toHaveBeenCalledWith(expect.any(Error));
    expect(logSpy.mock.calls[0][0].message).toBe("network down");
    expect(screen.queryByRole("button", { name: /make payment/i })).toBeNull();
    logSpy.mockRestore();
  });
});

// did not test empty cart for this function because it is not possible, there isnt even
// a purchase button to press
describe("handlePayment", () => {
  const renderOnCart = () =>
    render(
      <MemoryRouter initialEntries={["/cart"]}>
        <Routes>
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </MemoryRouter>
    );

  const getReadyPayBtn = async () => {
    const btn = await screen.findByRole("button", { name: /make payment/i });
    await waitFor(() => expect(btn).not.toBeDisabled());
    return btn;
  };

  let CART;

  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockResolvedValue({ data: { clientToken: "tok" } });
    useAuth.mockReturnValue([
      { token: "t", user: { name: "Alice", address: "123 Main" } },
      jest.fn(),
    ]);

    CART = [
      { _id: "1", name: "Item A", description: "aaaaaa", price: 20 },
      { _id: "2", name: "Item B", description: "bbbbbb", price: 49 },
    ];

    useCart.mockReturnValue([CART, jest.fn()]);
  });

  it("successfully posts correct cart of multiple distinct items", async () => {
    // arrange
    mockRequestPaymentMethod = jest
      .fn()
      .mockResolvedValue({ nonce: "nonce-123" });
    axios.post.mockResolvedValueOnce({ data: { ok: true } });

    // act
    renderOnCart();
    const payBtn = await getReadyPayBtn();
    fireEvent.click(payBtn);
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
    const [url, body] = axios.post.mock.calls[0];

    // assert
    expect(url).toBe("/api/v1/product/braintree/payment");
    expect(body).toEqual({ nonce: "nonce-123", cart: CART });
    expect(body.cart).toBe(CART);
  });

  it("successfully clears cart of multiple distinct items", async () => {
    // arrange
    mockRequestPaymentMethod = jest
      .fn()
      .mockResolvedValue({ nonce: "nonce-123" });
    axios.post.mockResolvedValueOnce({ data: { ok: true } });
    const removeItemSpy = jest.spyOn(
      window.localStorage.__proto__,
      "removeItem"
    );

    // act
    renderOnCart();
    const payBtn = await getReadyPayBtn();
    fireEvent.click(payBtn);
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
    const [, setCart] = useCart.mock.results[0].value;

    // assert
    expect(removeItemSpy).toHaveBeenCalledWith("cart");
    expect(setCart).toHaveBeenCalledWith([]);
    removeItemSpy.mockRestore();
  });

  it("successfully navigates to user orders page when payment completed on a cart of multiple disticnt items", async () => {
    // arrange
    mockRequestPaymentMethod = jest
      .fn()
      .mockResolvedValue({ nonce: "nonce-123" });
    axios.post.mockResolvedValueOnce({ data: { ok: true } });

    // act
    renderOnCart();
    const payBtn = await getReadyPayBtn();
    fireEvent.click(payBtn);
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    // assert
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard/user/orders");
  });

  it("successfully sends payment commpleted notifcation on a cart with multiple distinct items", async () => {
    // arrange
    mockRequestPaymentMethod = jest
      .fn()
      .mockResolvedValue({ nonce: "nonce-123" });
    axios.post.mockResolvedValueOnce({ data: { ok: true } });

    // act
    renderOnCart();
    const payBtn = await getReadyPayBtn();
    fireEvent.click(payBtn);
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    // assert
    expect(toast.success).toHaveBeenCalledWith(
      "Payment Completed Successfully "
    );
  });

  it("renders no payment button when cart is empty and never posts", async () => {
    // arrange
    const setCart = jest.fn();
    useCart.mockReturnValue([[], setCart]);

    // act
    renderOnCart();
    await waitFor(() =>
      expect(axios.get).toHaveBeenCalledWith("/api/v1/product/braintree/token")
    );

    // assert
    expect(screen.queryByRole("button", { name: /make payment/i })).toBeNull();
    expect(axios.post).not.toHaveBeenCalled();
  });

  it("handles nonce (requestPaymentMethod) error: logs, no post, no side effects", async () => {
    // arrange
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    mockRequestPaymentMethod = jest
      .fn()
      .mockRejectedValue(new Error("nonce fail"));

    // act
    renderOnCart();
    const payBtn = await getReadyPayBtn();
    fireEvent.click(payBtn);
    await waitFor(() => expect(logSpy).toHaveBeenCalledWith(expect.any(Error)));

    // assert
    expect(axios.post).not.toHaveBeenCalled();
    logSpy.mockRestore();
  });
});

describe("CartPage greeting & subtext header", () => {
  const renderCart = () =>
    render(
      <MemoryRouter initialEntries={["/cart"]}>
        <Routes>
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </MemoryRouter>
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Guest + empty cart → 'Hello Guest' and 'Your Cart Is Empty'", async () => {
    // arrange
    useAuth.mockReturnValue([{}, jest.fn()]);
    useCart.mockReturnValue([[], jest.fn()]);
    axios.get.mockImplementationOnce(() => new Promise(() => {}));

    // act
    renderCart();
    const h1 = await screen.findByRole("heading", { level: 1 });

    // assert
    expect(h1).toHaveTextContent(/Hello\s+Guest/i);
    expect(within(h1).getByText(/Your Cart Is Empty/i)).toBeInTheDocument();
  });

  it("Logged in (token+user) + 2 items → 'Hello  Alice' and count text", async () => {
    // arrange
    useAuth.mockReturnValue([
      { token: "t", user: { name: "Alice", address: "123 Main" } },
      jest.fn(),
    ]);
    useCart.mockReturnValue([
      [
        { _id: "1", name: "A", description: "x", price: 1 },
        { _id: "2", name: "B", description: "y", price: 2 },
      ],
      jest.fn(),
    ]);
    axios.get.mockImplementationOnce(() => new Promise(() => {}));

    // act
    renderCart();
    const h1 = await screen.findByRole("heading", { level: 1 });

    // assert
    expect(h1).toHaveTextContent(/Hello\s+Alice/i);
    expect(
      within(h1).getByText(/You Have 2 items in your cart\s*$/i)
    ).toBeInTheDocument();
  });

  it("User object but NO token + items → greeting + login hint", async () => {
    // arrange
    useAuth.mockReturnValue([{ user: { name: "Alice" } }, jest.fn()]);
    useCart.mockReturnValue([
      [{ _id: "1", name: "A", description: "x", price: 1 }],
      jest.fn(),
    ]);
    axios.get.mockImplementationOnce(() => new Promise(() => {}));

    // act
    renderCart();
    const h1 = await screen.findByRole("heading", { level: 1 });

    // assert
    expect(h1).toHaveTextContent(/Hello\s+Alice/i);
    expect(
      within(h1).getByText(
        /You Have 1 items in your cart\s+please login to checkout !/i
      )
    ).toBeInTheDocument();
  });

  it("Guest + items → 'Hello Guest' and login hint appended", async () => {
    // arrange
    useAuth.mockReturnValue([{}, jest.fn()]);
    useCart.mockReturnValue([
      [
        { _id: "1", name: "A", description: "x", price: 1 },
        { _id: "2", name: "B", description: "y", price: 2 },
      ],
      jest.fn(),
    ]);
    axios.get.mockImplementationOnce(() => new Promise(() => {}));

    // act
    renderCart();
    const h1 = await screen.findByRole("heading", { level: 1 });

    // assert
    expect(h1).toHaveTextContent(/Hello\s+Guest/i);
    expect(
      within(h1).getByText(
        /You Have 2 items in your cart\s+please login to checkout !/i
      )
    ).toBeInTheDocument();
  });

  it("Logged in (token+user) + empty cart → 'Hello  Alice' and empty text", async () => {
    // arrange
    useAuth.mockReturnValue([
      { token: "t", user: { name: "Alice", address: "123 Main" } },
      jest.fn(),
    ]);
    useCart.mockReturnValue([[], jest.fn()]);
    axios.get.mockImplementationOnce(() => new Promise(() => {}));

    // act
    renderCart();
    const h1 = await screen.findByRole("heading", { level: 1 });

    // assert
    expect(h1).toHaveTextContent(/Hello\s+Alice/i);
    expect(within(h1).getByText(/Your Cart Is Empty/i)).toBeInTheDocument();
  });
});

describe("CartPage summary column (address + payment gates)", () => {
  const renderCart = () =>
    render(
      <MemoryRouter initialEntries={["/cart"]}>
        <Routes>
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </MemoryRouter>
    );

  beforeEach(() => {
    jest.clearAllMocks();
    mockDropInProvided = false;
    mockRequestPaymentMethod = undefined;

    // default user/cart; individual tests override as needed
    useAuth.mockReturnValue([
      { token: "t", user: { name: "Alice", address: "123 Main" } },
      jest.fn(),
    ]);
    useCart.mockReturnValue([
      [{ _id: "1", name: "A", description: "x", price: 10 }],
      jest.fn(),
    ]);
  });

  it("renders summary headings and total", async () => {
    // arrange
    axios.get.mockImplementationOnce(() => new Promise(() => {}));

    // act
    renderCart();

    // assert
    expect(
      await screen.findByRole("heading", { name: /cart summary/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/total \| checkout \| payment/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Total : \$10\.00/i)).toBeInTheDocument();
  });

  it("with address: shows Current Address + Update Address and navigates", async () => {
    axios.get.mockImplementationOnce(() => new Promise(() => {}));
    renderCart();

    expect(screen.getByText(/current address/i)).toBeInTheDocument();
    expect(screen.getByText("123 Main")).toBeInTheDocument();

    const btn = screen.getByRole("button", { name: /update address/i });
    fireEvent.click(btn);
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard/user/profile");
  });

  it("no address but logged-in: shows Update Address (navigates to profile)", async () => {
    useAuth.mockReturnValue([
      { token: "t", user: { name: "Alice" } },
      jest.fn(),
    ]);
    axios.get.mockImplementationOnce(() => new Promise(() => {}));

    renderCart();

    const btn = await screen.findByRole("button", { name: /update address/i });
    fireEvent.click(btn);
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard/user/profile");
  });

  it("guest (no token): shows login CTA to /login with state '/cart'", async () => {
    useAuth.mockReturnValue([{}, jest.fn()]);
    axios.get.mockImplementationOnce(() => new Promise(() => {}));

    renderCart();

    const btn = await screen.findByRole("button", {
      name: /please login to checkout/i,
    });
    fireEvent.click(btn);
    expect(mockNavigate).toHaveBeenCalledWith("/login", { state: "/cart" });
  });

  it("hides payment UI when clientToken missing", async () => {
    axios.get.mockResolvedValueOnce({ data: { clientToken: "" } });
    renderCart();
    await waitFor(() => expect(axios.get).toHaveBeenCalled());
    await flush();
    expect(screen.queryByRole("button", { name: /make payment/i })).toBeNull();
  });

  it("hides payment UI when not logged in", async () => {
    useAuth.mockReturnValue([
      { user: { name: "Alice", address: "123 Main" } },
      jest.fn(),
    ]); // no token
    axios.get.mockResolvedValueOnce({ data: { clientToken: "tok" } });

    renderCart();
    await waitFor(() => expect(axios.get).toHaveBeenCalled());
    await flush();
    expect(screen.queryByRole("button", { name: /make payment/i })).toBeNull();
  });

  it("hides payment UI when cart empty", async () => {
    useCart.mockReturnValue([[], jest.fn()]);
    axios.get.mockResolvedValueOnce({ data: { clientToken: "tok" } });

    renderCart();
    await waitFor(() => expect(axios.get).toHaveBeenCalled());
    await flush();
    expect(screen.queryByRole("button", { name: /make payment/i })).toBeNull();
  });

  it("shows payment UI when all gates pass", async () => {
    axios.get.mockResolvedValueOnce({ data: { clientToken: "tok" } });
    renderCart();

    const payBtn = await screen.findByRole("button", { name: /make payment/i });
    expect(payBtn).toBeInTheDocument();
  });

  it("disables Make Payment when address is missing", async () => {
    useAuth.mockReturnValue([
      { token: "t", user: { name: "Alice" } },
      jest.fn(),
    ]);
    mockRequestPaymentMethod = jest.fn().mockResolvedValue({ nonce: "n" });

    axios.get.mockResolvedValueOnce({ data: { clientToken: "tok" } });
    renderCart();

    const payBtn = await screen.findByRole("button", { name: /make payment/i });
    expect(payBtn).toBeDisabled();
  });

  it("disables Make Payment when DropIn instance not provided", async () => {
    mockDropInProvided = true; // our DropIn mock won't call onInstance
    axios.get.mockResolvedValueOnce({ data: { clientToken: "tok" } });

    renderCart();

    const payBtn = await screen.findByRole("button", { name: /make payment/i });
    expect(payBtn).toBeDisabled();
  });
});
