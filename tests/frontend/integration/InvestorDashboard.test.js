import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import InvestorDashboard from "../../../frontend/src/pages/InvestorDashboard";

jest.mock("../../../frontend/src/lib/axios", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

// Import the mocked api after setup
const api = require("../../../frontend/src/lib/axios").default;

jest.mock("../../../frontend/src/components/layout/AppNavBar", () => () => <div>AppNavBar</div>);

jest.mock("../../../frontend/src/components/DesktopSidebar", () => ({
  DesktopSidebar: () => <div>DesktopSidebar</div>,
}));

jest.mock("../../../frontend/src/components/FilterBar", () => ({
  FilterBar: () => <div>FilterBar</div>,
}));

jest.mock("../../../frontend/src/components/StartupCard", () => ({
  StartupCard: ({ startup }) => (
    <div>
      <div>StartupCard: {startup.name}</div>
      <div>{startup.tagline}</div>
    </div>
  ),
}));

describe("InvestorDashboard integration", () => {
  beforeEach(() => {
    api.get.mockReset();
  });

  it("fetches ideas and renders normalized startup cards", async () => {
    api.get.mockResolvedValue({
      data: {
        data: [
          {
            _id: "idea-1",
            title: "MedAI",
            description: "Clinical co-pilot. Second sentence",
            category: "HealthTech",
            budget: 100000,
            currentFunding: 25000,
            aiRiskLevel: "LOW",
            aiRiskScore: 19,
            createdBy: "abc123",
          },
        ],
      },
    });

    render(
      <MemoryRouter>
        <InvestorDashboard />
      </MemoryRouter>
    );

    expect(await screen.findByText(/MedAI/)).toBeInTheDocument();
    expect(screen.getByText(/clinical co-pilot/i)).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith("/v1/ideas/all");
  });

  it("renders multiple startup cards from API response", async () => {
    api.get.mockResolvedValue({
      data: {
        data: [
          { _id: "1", title: "AlphaTech", category: "SaaS", budget: 1000, createdBy: "u1", description: "SaaS solution" },
          { _id: "2", title: "BetaHealth", category: "HealthTech", budget: 2000, createdBy: "u2", description: "Health tech platform" },
        ],
      },
    });

    render(
      <MemoryRouter>
        <InvestorDashboard />
      </MemoryRouter>
    );

    await screen.findByText(/AlphaTech/);
    expect(screen.getByText(/BetaHealth/)).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith("/v1/ideas/all");
  });
});
