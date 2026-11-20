import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Pagination } from "./pagination";

const props = {
  total: 60,
  start: 25,
  end: 50,
  page: 2,
  pages: 3,
  size: 25,
  onPageChange: vi.fn(),
  onSizeChange: vi.fn(),
};

describe("Pagination", () => {
  it("shows the visible range and total", () => {
    render(<Pagination {...props} />);
    expect(
      screen.getByRole("button", { name: "Rows per page: 25" }),
    ).toHaveTextContent("26–50");
    expect(screen.getByText("60")).toBeInTheDocument();
  });

  it("moves between pages", async () => {
    const user = userEvent.setup();
    render(<Pagination {...props} />);
    await user.click(screen.getByLabelText("Next page"));
    await user.click(screen.getByLabelText("Previous page"));
    expect(props.onPageChange.mock.calls).toEqual([[3], [1]]);
  });

  it("disables the buttons at the ends", () => {
    render(<Pagination {...props} page={1} pages={1} />);
    expect(screen.getByLabelText("Previous page")).toBeDisabled();
    expect(screen.getByLabelText("Next page")).toBeDisabled();
  });

  it("reads 0 results when empty", () => {
    render(<Pagination {...props} total={0} />);
    expect(screen.getByText(/0 results/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Rows per page/ })).toBeNull();
  });
});
