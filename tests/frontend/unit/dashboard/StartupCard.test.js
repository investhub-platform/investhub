import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { StartupCard } from "../../../../frontend/src/components/StartupCard";

describe("StartupCard", () => {
  it("renders startup data and computed funding progress", () => {
    render(
      <MemoryRouter>
        <StartupCard
          index={0}
          startup={{
            _id: "s1",
            name: "AgriPulse AI",
            tagline: "Precision agriculture",
            tags: ["AI", "SaaS"],
            logo: "AP",
            fundingGoal: 200000,
            currentFunding: 50000,
            aiRiskLevel: "LOW",
            aiRiskScore: 18,
            founders: [{ name: "Founder", avatar: "F" }],
          }}
        />
      </MemoryRouter>
    );

    expect(screen.getByText("AgriPulse AI")).toBeInTheDocument();
    expect(screen.getByText("Precision agriculture")).toBeInTheDocument();
    expect(screen.getByText("AI Risk: LOW (18%)")).toBeInTheDocument();
    expect(screen.getByText("25% funded")).toBeInTheDocument();
  });
});
