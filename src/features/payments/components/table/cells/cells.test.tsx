import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { statuses } from "../../../domain/payment";
import { PaymentMethodCell } from "./payment-method-cell";
import { StatusBadge } from "./status-badge";

describe("StatusBadge", () => {
  it.each(statuses)("renders %s with its class and an icon", (status) => {
    const { container } = render(<StatusBadge status={status} />);
    const badge = screen.getByText(status);
    expect(badge).toHaveClass("badge", status);
    expect(container.querySelector("svg")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("can hide the icon", () => {
    const { container } = render(
      <StatusBadge status="Failed" withIcon={false} />,
    );
    expect(container.querySelector("svg")).toBeNull();
  });
});

describe("PaymentMethodCell", () => {
  it("labels a card for screen readers", () => {
    render(<PaymentMethodCell brand="Visa" wallet="—" last4="4242" />);
    expect(screen.getByText("Visa ending in 4242")).toHaveClass("sr");
  });

  it("names the wallet before the card", () => {
    render(
      <PaymentMethodCell brand="Mastercard" wallet="Apple Pay" last4="0900" />,
    );
    expect(
      screen.getByText("Apple Pay Mastercard ending in 0900"),
    ).toBeInTheDocument();
  });

  it("calls bank accounts ACH", () => {
    render(<PaymentMethodCell brand="Bank" wallet="—" last4="6789" />);
    expect(screen.getByText("ACH ending in 6789")).toBeInTheDocument();
  });

  it("falls back to a generic card icon", () => {
    const { container } = render(
      <PaymentMethodCell brand="Unknown" wallet="—" last4="1111" />,
    );
    expect(container.querySelectorAll("svg")).toHaveLength(1);
  });
});
