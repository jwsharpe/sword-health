const { queryUser } = require("../../../../src/api/v1/middleware/queryUser");

describe("queryUser middleware", () => {
  test("should add roleData to the request", () => {
    const req = {
      headers: { "x-api-key": "manager-123" },
    };
    const res = {};
    const next = jest.fn();

    queryUser(req, res, next);

    expect(req.roleData).toEqual({ role: "manager", id: "123" });
    expect(next).toHaveBeenCalled();
  });
});
