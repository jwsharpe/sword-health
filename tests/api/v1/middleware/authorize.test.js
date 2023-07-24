const { authorize } = require("../../../../src/api/v1/middleware/authorize");

describe("authorize middleware", () => {
  test("should return 401 if authorization token is missing", () => {
    const req = {
      headers: {},
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    authorize(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Operation Failed",
      data: "Authorization token not found.",
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("should return 403 if authorization token is invalid", () => {
    const req = {
      headers: { "x-api-key": "invalid-token" },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    const next = jest.fn();

    authorize(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.send).toHaveBeenCalledWith("Forbidden");
    expect(next).not.toHaveBeenCalled();
  });

  test("should call next if authorization token is valid", () => {
    const req = {
      headers: { "x-api-key": "manager-123" },
    };
    const res = {};
    const next = jest.fn();

    authorize(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
