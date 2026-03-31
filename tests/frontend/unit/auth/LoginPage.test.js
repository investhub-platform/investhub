import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import LoginPage from "../../../../frontend/src/features/auth/pages/LoginPage";

const mockNavigate = jest.fn();
const mockLogin = jest.fn();

jest.mock("../../../../frontend/src/features/auth/useAuth", () => ({
  useAuth: () => ({ login: mockLogin }),
}));

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderPage() {
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  );
}

describe("LoginPage", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockLogin.mockReset();
  });

  it("submits credentials and navigates to /app/explore on success", async () =>  {
    mockLogin.mockResolvedValue({});
    const user = userEvent.setup();

    renderPage();

    await user.type(screen.getByPlaceholderText("you@example.com"), "user@example.com");
    await user.type(screen.getByPlaceholderText("••••••••"), "password123");
    await user.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: "user@example.com",
        password: "password123",
      });
    });

    //expect(mockNavigate).toHaveBeenCalledWith("/app");
    expect(mockNavigate).toHaveBeenCalledWith("/app/explore", { replace: true });
  });

  it("shows API error message when login fails", async () => {
    mockLogin.mockRejectedValue({
      response: { data: { message: "Invalid credentials" } },
    });
    const user = userEvent.setup();

    renderPage();

    await user.type(screen.getByPlaceholderText("you@example.com"), "user@example.com");
    await user.type(screen.getByPlaceholderText("••••••••"), "password123");
    await user.click(screen.getByRole("button", { name: /login/i }));

    expect(await screen.findByText("Invalid credentials")).toBeInTheDocument();
  });

  it("redirects to email verification when backend requires verification", async () => {
    mockLogin.mockRejectedValue({
      response: { data: { message: "Please verify your email before logging in" } },
    });
    const user = userEvent.setup();

    renderPage();

    await user.type(screen.getByPlaceholderText("you@example.com"), "pending@example.com");
    await user.type(screen.getByPlaceholderText("••••••••"), "password123");
    await user.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/auth/verify-email", {
        state: { email: "pending@example.com" },
      });
    });
  });
});
