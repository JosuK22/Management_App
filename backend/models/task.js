'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Task extends Model {
    static associate(models) {
      Task.belongsTo(models.User, { foreignKey: 'userId' });
    }
  }
  Task.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4, 
      primaryKey: true
    },
    employee_name: DataTypes.STRING,
    due_date: DataTypes.DATE,
    requirements: DataTypes.TEXT,
    status: DataTypes.STRING,
    content: DataTypes.TEXT,
    client_name: DataTypes.STRING,
    description: DataTypes.TEXT,
    priority: DataTypes.STRING,
    userId: {
      type: DataTypes.UUID,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Task',
  });

  return Task;
};
