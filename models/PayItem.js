export default function (sequelize, DataTypes) {
  return sequelize.define('Item', {
    itemUID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    discription: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    img: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    manager: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  }, {
    timestamps: false,
    updatedAt: false,
  })
}

