import { test, expect } from "../frontend/node_modules/@playwright/test/index.js";

test.describe("Auth -> Dashboard flow", () => {
  test("login and access wallet page", async ({ page, baseURL }) => {
    const email = process.env.E2E_USER_EMAIL;
    const password = process.env.E2E_USER_PASSWORD;

    test.skip(!email || !password, "Set E2E_USER_EMAIL and E2E_USER_PASSWORD to run this flow.");

    // Real flow: login then navigate through dashboard links.
    await page.goto(`${baseURL}/auth/login`);

    await page.getByPlaceholder("you@example.com").fill(email);
    await page.getByPlaceholder("••••••••").fill(password);
    await page.getByRole("button", { name: /login/i }).click();

    await page.waitForURL(/\/app/);
    await expect(page).toHaveURL(/\/app/);

    const walletLink = page.getByRole("link", { name: /wallet/i }).first();
    await walletLink.click();

    await expect(page).toHaveURL(/\/app\/wallet/);
  });
});
