// i have run this test and it passes BUT there is a problem with a small thing that outreatches this projects scope so i left it as it is!
// but the test runs moothly and passes!

import {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
} from "@/lib/auth";

describe("Auth utilities", () => {
  describe("Password hashing", () => {
    it("should hash password correctly", async () => {
      const password = "testpassword123";
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50);
    });

    it("should verify password correctly", async () => {
      const password = "testpassword123";
      const hash = await hashPassword(password);

      const isValid = await comparePassword(password, hash);
      const isInvalid = await comparePassword("wrongpassword", hash);

      expect(isValid).toBe(true);
      expect(isInvalid).toBe(false);
    });
  });

  describe("JWT tokens", () => {
    it("should generate and verify token correctly", () => {
      const payload = {
        userId: "123",
        email: "test@example.com",
        role: "USER",
      };

      const token = generateToken(payload);
      const decoded = verifyToken(token);

      expect(token).toBeDefined();
      expect(decoded).toMatchObject(payload);
    });

    it("should return null for invalid token", () => {
      const decoded = verifyToken("invalid-token");
      expect(decoded).toBeNull();
    });
  });
});
