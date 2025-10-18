import { requireSignIn, isAdmin } from "./authMiddleware.js";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

jest.mock("../models/userModel.js");

describe("Auth Middleware", () => {
  describe("requireSignIn", () => {
    it("should call next() if token is valid", () => {
      const req = {
        headers: {
          authorization: jwt.sign({ _id: "123" }, "test-secret"),
        },
      };
      const res = {};
      const next = jest.fn();

      process.env.JWT_SECRET = "test-secret";

      requireSignIn(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
    });
  });

  describe("isAdmin", () => {
    it("should call next() if user is an admin", async () => {
      const req = { user: { _id: "123" } };
      const res = {};
      const next = jest.fn();

      userModel.findById.mockResolvedValue({ role: 1 });

      await isAdmin(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it("should return 401 if user is not an admin", async () => {
      const req = { user: { _id: "123" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };
      const next = jest.fn();

      userModel.findById.mockResolvedValue({ role: 0 });

      await isAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "UnAuthorized Access",
      });
    });
  });
});