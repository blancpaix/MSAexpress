export default function (sequelize, DataTypes) {
  return sequelize.define('Purchase', {
    idx: {
      type: DataTypes.INTEGER,
      aautoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    count: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    discount: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    method: {
      type: DataTypes.STRING,
      allowNull: false,
      default: 'card'
    },
    userUID: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    memo: {
      type: DataTypes.STRING,
      allowNull: true,
    }
  }, {
    timestamps: false,
    updatedAt: false,
    createdAt: true,
  });
}
