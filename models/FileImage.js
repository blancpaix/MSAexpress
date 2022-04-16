export default function (sequelize, DataTypes) {
  return sequelize.define('File', {
    imageUID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      unique: {
        args: true,
        msg: '다시 시도해주세요.'
      },
      allowNull: false,
    },
    itemUID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  }, {
    timestamps: true,
    createdAt: false,
    updatedAt: false,
    paranoid: true,
  })
}