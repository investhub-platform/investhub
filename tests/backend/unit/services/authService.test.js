import { jest } from "@jest/globals";

process.env.JWT_ACCESS_SECRET = "test-access-secret";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret";

const findByEmail = jest.fn();
const findById = jest.fn();
const create = jest.fn();
const save = jest.fn();

const hash = jest.fn();
const compare = jest.fn();

const sign = jest.fn();
const verify = jest.fn();

const sendEmail = jest.fn();

jest.unstable_mockModule("../../../../backend/src/repositories/userRepository.js", () => ({
  findByEmail,
  findById,
  create,
  save,
}));

jest.unstable_mockModule("bcryptjs", () => ({
  default: { hash, compare },
}));

jest.unstable_mockModule("jsonwebtoken", () => ({
  default: { sign, verify },
}));

jest.unstable_mockModule("../../../../backend/src/services/emailService.js", () => ({
  sendEmail,
}));

const authService = await import("../../../../backend/src/services/authService.js");

describe("authService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("registers a new user and sends verification OTP email", async () => {
    findByEmail.mockResolvedValue(null);
    hash.mockResolvedValue("hashed-password");
    create.mockResolvedValue({
      _id: "u1",
      email: "newuser@example.com",
      status: "pending_email_verification",
    });
    sendEmail.mockResolvedValue(undefined);

    const result = await authService.register({
      name: "New User",
      email: "NEWUSER@EXAMPLE.COM",
      password: "Password123",
    });

    expect(findByEmail).toHaveBeenCalledWith("NEWUSER@EXAMPLE.COM");
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "New User",
        email: "newuser@example.com",
        passwordHash: "hashed-password",
        roles: ["user"],
      })
    );
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: "newuser@example.com" })
    );
    expect(result).toEqual(
      expect.objectContaining({
        email: "newuser@example.com",
        status: "pending_email_verification",
      })
    );
  });

  it("rejects login for users pending email verification", async () => {
    findByEmail.mockResolvedValue({
      _id: "u2",
      email: "pending@example.com",
      passwordHash: "hash",
      status: "pending_email_verification",
      roles: ["user"],
    });
    compare.mockResolvedValue(true);

    await expect(
      authService.login({ email: "pending@example.com", password: "Password123" })
    ).rejects.toThrow("Please verify your email before logging in");
  });

  it("logs in active users and stores refresh token hash", async () => {
    const user = {
      _id: "u3",
      name: "Active User",
      email: "active@example.com",
      passwordHash: "hash",
      status: "active",
      roles: ["user"],
    };

    findByEmail.mockResolvedValue(user);
    compare.mockResolvedValue(true);
    sign.mockReturnValueOnce("access-token").mockReturnValueOnce("refresh-token");
    save.mockResolvedValue(user);

    const result = await authService.login({
      email: "active@example.com",
      password: "Password123",
    });

    expect(result).toEqual(
      expect.objectContaining({
        accessToken: "access-token",
        refreshToken: "refresh-token",
        user: expect.objectContaining({ email: "active@example.com" }),
      })
    );
    expect(save).toHaveBeenCalledWith(expect.objectContaining({ _id: "u3" }));
    expect(user.refreshTokenHash).toBeTruthy();
  });
});
