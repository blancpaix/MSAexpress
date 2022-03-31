export default function (sequelize, DataTypes) {
  return sequelize.define('Point', {
    idx: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    method: {
      type: DataTypes.STRING,
      defaultValue: 'etc',
      allowNull: false,
    },
    note: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  }, {
    timestamps: false,
    updatedAt: false,
  });
}
