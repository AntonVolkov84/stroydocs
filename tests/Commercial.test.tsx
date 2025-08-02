import { expect, test, describe, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Commercial from "../components/Commercial";

vi.mock("../services/commercialOfferService", () => ({
  getCommercialOffers: vi.fn().mockResolvedValue([]),
  getCommercialOffersSecondForm: vi.fn().mockResolvedValue([]),
}));

vi.mock("../services/AppContext", () => ({
  useAppContext: () => ({
    user: { id: "user123" },
    confirm: vi.fn().mockResolvedValue(true),
  }),
}));

describe("Commercial component", () => {
  test("показывает сообщение об отсутствии предложений формы 0", async () => {
    render(<Commercial />);
    expect(await screen.findByText("Нет сохранённых предложений формы 0.")).toBeInTheDocument();
  });
});
