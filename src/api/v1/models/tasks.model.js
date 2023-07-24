module.exports = (sequelize, Sequelize) => {
  const Task = sequelize.define("task", {
    title: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    summary: {
      type: Sequelize.TEXT,
    },
    deletedDate: {
      type: Sequelize.DATE,
    },
    createdAt: {
      type: Sequelize.DATE,
    },
    updatedAt: {
      type: Sequelize.DATE,
    },
  });

  Task.associate = (models) => {
    Task.belongsTo(models.Technician);
  };

  return Task;
};
