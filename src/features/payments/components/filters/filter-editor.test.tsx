import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { filterGroups } from "../../domain/filters";
import { FilterEditor } from "./filter-editor";

const group = (label: string) => filterGroups.find((g) => g.label === label)!;

function setup(label: string, search = "") {
  const handlers = { onSave: vi.fn(), onPreview: vi.fn(), onBack: vi.fn() };
  render(
    <FilterEditor
      group={group(label)}
      params={new URLSearchParams(search)}
      {...handlers}
    />,
  );
  return { user: userEvent.setup(), ...handlers };
}

const saved = (onSave: ReturnType<typeof vi.fn>) =>
  new URLSearchParams([...(onSave.mock.calls[0][0] as FormData)] as [
    string,
    string,
  ][]).toString();

describe("FilterEditor", () => {
  it("pre-checks current status values and saves the selection", async () => {
    const { user, onSave } = setup("Status", "status=Failed");
    expect(screen.getByLabelText("Failed")).toBeChecked();
    await user.click(screen.getByLabelText("Pending"));
    await user.click(screen.getByRole("button", { name: "Apply" }));
    // Values follow the checkbox order, which follows `statuses`.
    expect(saved(onSave)).toBe("status=Pending&status=Failed");
  });

  it("switches amount inputs with the operator", async () => {
    const { user } = setup("Amount");
    expect(screen.getByLabelText("Filter value")).toBeRequired();
    await user.selectOptions(
      screen.getByLabelText("Number filter select"),
      "between",
    );
    expect(screen.getByLabelText("Minimum")).not.toBeRequired();
    expect(screen.getByLabelText("Maximum")).toBeInTheDocument();
  });

  it("starts in 'between' mode when a range is already set", () => {
    setup("Amount", "min=5&max=10");
    expect(screen.getByLabelText("Number filter select")).toHaveValue(
      "between",
    );
    expect(screen.getByLabelText("Minimum")).toHaveValue(5);
  });

  it("shows an error for an inverted range and clears it on input", async () => {
    const { user, onSave } = setup("Amount");
    await user.selectOptions(
      screen.getByLabelText("Number filter select"),
      "between",
    );
    await user.type(screen.getByLabelText("Minimum"), "10");
    await user.type(screen.getByLabelText("Maximum"), "5");
    await user.click(screen.getByRole("button", { name: "Apply" }));
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Maximum must be at least the minimum.",
    );
    expect(onSave).not.toHaveBeenCalled();
    await user.type(screen.getByLabelText("Maximum"), "0");
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("rounds an amount on blur", async () => {
    const { user } = setup("Amount");
    const input = screen.getByLabelText("Filter value");
    await user.type(input, "12.252665");
    await user.tab();
    expect(input).toHaveValue(12.25);
  });

  it("shows date inputs only for a custom range", async () => {
    const { user } = setup("Date and time");
    expect(screen.queryByLabelText("Start date")).toBeNull();
    await user.selectOptions(screen.getByLabelText("Date range"), "Custom");
    expect(screen.getByLabelText("Start date")).toBeRequired();
    expect(screen.getByLabelText("End date")).toBeRequired();
  });

  it("previews edits before they are applied", async () => {
    const { user, onPreview } = setup("Currency");
    await user.click(screen.getByLabelText("EUR"));
    await vi.waitFor(() => expect(onPreview).toHaveBeenCalled());
  });

  it("goes back without saving", async () => {
    const { user, onBack, onSave } = setup("More filters");
    expect(
      screen.getByRole("heading", { name: "Search payments" }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Back" }));
    expect(onBack).toHaveBeenCalled();
    expect(onSave).not.toHaveBeenCalled();
  });
});
