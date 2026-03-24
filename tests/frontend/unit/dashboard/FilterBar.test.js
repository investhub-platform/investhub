import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FilterBar } from "../../../../frontend/src/components/FilterBar";

describe("FilterBar", () => {
  it("calls search and filter callbacks with user input", async () => {
    const user = userEvent.setup();
    const onSearchChange = jest.fn();
    const onToggleFilter = jest.fn();

    render(
      <FilterBar
        searchQuery=""
        onSearchChange={onSearchChange}
        activeFilters={[]}
        onToggleFilter={onToggleFilter}
      />
    );

    await user.type(
      screen.getByPlaceholderText("Search by industry or AI keyword..."),
      "fintech"
    );

    expect(onSearchChange).toHaveBeenLastCalledWith("h");

    await user.click(screen.getByRole("button", { name: "Fintech" }));
    expect(onToggleFilter).toHaveBeenCalledWith("Fintech");
  });

  it("shows active filter styling when filter is selected", () => {
    render(
      <FilterBar
        searchQuery=""
        onSearchChange={jest.fn()}
        activeFilters={["SaaS"]}
        onToggleFilter={jest.fn()}
      />
    );

    const saasButton = screen.getByRole("button", { name: "SaaS" });
    expect(saasButton.className).toContain("pill-filter-active");
  });
});
