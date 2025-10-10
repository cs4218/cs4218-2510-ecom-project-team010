import React from "react";
import { render, screen, within } from "@testing-library/react";
import Policy from "../Policy";

// assert
jest.mock("./../../components/Layout", () => ({
  __esModule: true,
  default: ({ title, children }) => (
    <div data-testid="layout" data-title={title}>
      {children}
    </div>
  ),
}));



describe("Policy (Stage 0): Page with stubbed Layout", () => {
  it("passes title to Layout component and renders on screen.", () => {
    // act
    render(<Policy />);
    const layout = screen.getByTestId("layout");

    // assert
    expect(layout).toBeInTheDocument();
    expect(layout).toHaveAttribute("data-title", "Privacy Policy");
  });

  it("passes content of policy page to Layout component and renders on screen.", () => {
    // act
    render(<Policy />);
    const layout = screen.getByTestId("layout");
    
    // assert
    // children actually render inside the stubbed Layout
    expect(within(layout).getByText(/We are commited to selling you products of the highest quality for reasonable prices./i)).toBeInTheDocument();
    expect(within(layout).getByRole("img", { name: /contactus/i })).toBeInTheDocument();
  });
});
