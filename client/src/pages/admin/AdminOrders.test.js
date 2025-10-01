// Note: these test cases are genereated with the help of AI
import React from "react";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  within,
  cleanup,
  act,
} from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../../context/auth";
import AdminOrders from "./AdminOrders";

jest.mock("axios", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    put: jest.fn(),
  },
}));

jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: { success: jest.fn(), error: jest.fn() },
}));

jest.mock("../../components/Layout", () => ({
  __esModule: true,
  default: ({ children, title }) => (
    <div data-testid="layout" data-title={title || ""}>
      {children}
    </div>
  ),
}));
jest.mock("../../components/AdminMenu", () => ({
  __esModule: true,
  default: () => <nav data-testid="admin-menu" />,
}));

jest.mock("../../context/auth", () => ({
  __esModule: true,
  useAuth: jest.fn(),
}));

jest.mock("moment", () => {
  return (ts) => ({
    fromNow: () => "some time ago",
  });
});

jest.mock("antd", () => {
  const React = require("react");
  const Select = ({
    value,
    defaultValue,
    onChange,
    children,
    bordered, // dropped
    size, // dropped
    showSearch, // dropped
    optionFilterProp, // dropped
    ...rest
  }) => (
    <select
      data-testid="status-select"
      value={value}
      defaultValue={defaultValue}
      onChange={(e) => onChange(e.target.value)}
      {...rest}
    >
      {React.Children.toArray(children)}
    </select>
  );
  Select.Option = ({ children, value, ...rest }) => (
    <option value={value} {...rest}>
      {children}
    </option>
  );
  return { Select };
});

const STATUSES = [
  "Not Processed",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const sampleOrders = [
  {
    _id: "order1",
    status: "Processing",
    buyer: { name: "Alice Tan" },
    createdAt: "2025-01-01T10:00:00.000Z",
    payment: { success: true },
    products: [
      {
        _id: "p1",
        name: "Yellow Helmet",
        description:
          "High quality safety helmet with adjustable strap and ventilation vents for comfort.",
        price: 50,
      },
      {
        _id: "p2",
        name: "Safety Vest",
        description: "Reflective vest for night visibility",
        price: 30,
      },
    ],
  },
];

const updatedOrdersAfterPut = [{ ...sampleOrders[0], status: "Shipped" }];

const getOrderTables = () => screen.queryAllByRole("table");

// A tiny helper to render and wait for “All Orders”,
// which only appears after the effect runs & state updates.
async function renderAndWait(component = <AdminOrders />) {
  render(component);
  await screen.findByText(/All Orders/i);
}

describe("AdminOrders", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue([{ token: "tok" }, jest.fn()]);
  });

  afterEach(() => {
    cleanup();
  });

  it("does not fetch orders if no auth token", async () => {
    // arrange
    useAuth.mockReturnValue([{}, jest.fn()]); // no token
    axios.get.mockClear();

    // act
    render(<AdminOrders />);

    // assert
    await waitFor(() => {
      expect(axios.get).not.toHaveBeenCalled();
    });
  });

  it("fetches and displays orders correctly, rendering key attributes", async () => {
    // arrange
    axios.get.mockResolvedValueOnce({ data: sampleOrders });

    // act
    await renderAndWait();
    await waitFor(() => expect(getOrderTables()).toHaveLength(1));

    // assert (check that all attributes related to the user is rendered on the page)
    // status
    expect(screen.getByText("Processing")).toBeInTheDocument();
    // buyer
    expect(screen.getByText("Alice Tan")).toBeInTheDocument();
    // date
    expect(screen.getByText("some time ago")).toBeInTheDocument();
    // payment
    expect(screen.getByText("Success")).toBeInTheDocument();
    // quantity
    expect(
      screen.getByText(String(sampleOrders[0].products.length))
    ).toBeInTheDocument();
    // products
    expect(screen.getByText(/Yellow Helmet/i)).toBeInTheDocument();
    expect(screen.getByText(/Safety Vest/i)).toBeInTheDocument();
    // images
    const imgs = screen.getAllByRole("img");
    expect(imgs).toHaveLength(2);
    expect(imgs[0]).toHaveAttribute("src", "/api/v1/product/product-photo/p1");
    expect(imgs[0]).toHaveAttribute("alt", "Yellow Helmet");
    expect(imgs[1]).toHaveAttribute("src", "/api/v1/product/product-photo/p2");
    expect(imgs[1]).toHaveAttribute("alt", "Safety Vest");
  });

  it("renders correct placeholder values for missing attributes: 0 quantity when products missing", async () => {
    // arrange
    const orderNoDateNoProducts = {
      _id: "order2",
      status: "Not Processed",
      buyer: { name: "Bob" },
      payment: { success: false },
    };
    axios.get.mockResolvedValueOnce({ data: [orderNoDateNoProducts] });

    // act
    await renderAndWait();
    await waitFor(() => expect(getOrderTables()).toHaveLength(1));

    // assert
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("renders correct placeholder values for missing attributes: '-' for missing date", async () => {
    // arrange
    const orderNoDateNoProducts = {
      _id: "order2",
      status: "Not Processed",
      buyer: { name: "Bob" },
      payment: { success: false },
    };
    axios.get.mockResolvedValueOnce({ data: [orderNoDateNoProducts] });

    // act
    await renderAndWait();
    await waitFor(() => expect(getOrderTables()).toHaveLength(1));

    // assert
    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("renders correct placeholder values for missing attributes: shows failed payment", async () => {
    // arrange
    const orderNoDateNoProducts = {
      _id: "order2",
      status: "Not Processed",
      buyer: { name: "Bob" },
      payment: { success: false },
    };
    axios.get.mockResolvedValueOnce({ data: [orderNoDateNoProducts] });

    // act
    await renderAndWait();
    await waitFor(() => expect(getOrderTables()).toHaveLength(1));

    // assert
    expect(await screen.findByText("Failed")).toBeInTheDocument();
  });

  it("shows toast error when error occurs when trying to run getOrders().", async () => {
    // arrange
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    axios.get.mockRejectedValueOnce(new Error("network fail"));

    // act
    render(<AdminOrders />);

    // assert
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Failed to load orders")
    );
    logSpy.mockRestore();
  });

  it("Updates status of an order correctly", async () => {
    // arrange
    axios.get.mockResolvedValueOnce({ data: sampleOrders }); // initial fetch
    axios.put.mockResolvedValueOnce({ data: { ok: true } });
    axios.get.mockResolvedValueOnce({ data: updatedOrdersAfterPut }); // refresh after PUT

    // act
    await renderAndWait();
    await waitFor(() => expect(getOrderTables()).toHaveLength(1));
    const select = screen.getByTestId("status-select");
    await act(async () => {
      fireEvent.change(select, { target: { value: "Shipped" } });
    });

    // assert
    await waitFor(() =>
      expect(screen.getByTestId("status-select").value).toBe("Shipped")
    );
  });

  it("Logs error when error occurs when trying to update order status", async () => {
    // arrange
    axios.get.mockResolvedValueOnce({ data: sampleOrders }); // initial fetch
    const putErr = new Error("PUT failed");
    axios.put.mockRejectedValueOnce(putErr);
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    // act
    await renderAndWait();
    await waitFor(() => expect(getOrderTables()).toHaveLength(1));
    const select = screen.getByTestId("status-select");
    await act(async () => {
      fireEvent.change(select, { target: { value: "Delivered" } });
    });

    // assert
    expect(logSpy).toHaveBeenCalledWith(putErr);
  });
});
