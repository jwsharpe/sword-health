module.exports = (sequelize, Sequelize) => {
  const Manager = sequelize.define("manager", {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    createdAt: {
      type: Sequelize.DATE,
    },
    updatedAt: {
      type: Sequelize.DATE,
    },
  });

  Manager.associate = (models) => {
    Manager.hasMany(models.Technician);
  };

  return Manager;
};
