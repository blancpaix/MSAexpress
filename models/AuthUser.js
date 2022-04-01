export default function (sequelize, DataTypes) {
  return sequelize.define('User', {
    userUID: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    phonenum: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    displayname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    point: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    role: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      // 0 : Active, 1: Deactive, 3: deleted, 4: manager
    },
  }, {
    // Other model options go here
    paranoid: true,
    timestamps: true,
    updatedAt: false,
    createdAt: false,
  })
}