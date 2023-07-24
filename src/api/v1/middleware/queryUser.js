const queryUser = (req, res, next) => {
  const authorization = req.headers["x-api-key"];
  const [role, id] = authorization.split("-");
  req.roleData = { role, id };
  next();
};

module.exports = {
  queryUser,
};
