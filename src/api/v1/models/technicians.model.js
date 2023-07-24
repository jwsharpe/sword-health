module.exports = (sequelize, Sequelize) => {
  const Technician = sequelize.define("technician", {
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

  Technician.associate = (models) => {
    Technician.belongsTo(models.Manager);
    Technician.hasMany(models.Task);
  };

  return Technician;
};
