import { requireFields, validateEmail, validatePassword } from "../../../../backend/src/utils/validators.js";

describe("validators", () => {
  it("throws when required field is missing", () => {
    expect(() => requireFields({ email: "" }, ["email"]))
      .toThrow("email is required");
  });

  it("accepts valid email and rejects invalid email", () => {
    expect(() => validateEmail("valid@example.com")).not.toThrow();
    expect(() => validateEmail("invalid-email")).toThrow("Invalid email format");
  });

  it("enforces minimum password length", () => {
    expect(() => validatePassword("12345678")).not.toThrow();
    expect(() => validatePassword("short")).toThrow("Password must be at least 8 characters");
  });
});
