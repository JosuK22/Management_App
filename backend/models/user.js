'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Task, { foreignKey: 'userId' });
    }
  }
  User.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4, 
      primaryKey: true
    },
    name: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      allowNull: false,  
      unique: true,      
      validate: {
        isEmail: true     
      }
    },
    password: DataTypes.STRING,
    role: DataTypes.STRING,
    reset_token: DataTypes.STRING,
    reset_token_expiration: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'User',
  });

  return User;
};
