export default function (sequelize, DataTypes) {
  return sequelize.define('Purchase', {
    idx: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: {
          args: [1],
          msg: "최소 1개 이상 구매할 수 있습니다."
        },
        isNumeric: {
          msg: "숫자만 입력할 수 있습니다."
        },
      }
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: {
          args: [1],
          msg: "결제 가격은 최소 1원입니다."
        },
        isNumeric: {
          msg: "숫자만 입력할 수 있습니다."
        },
      }
    },
    discount: {
      type: DataTypes.INTEGER,
      allowNull: true,
      isNumeric: {
        msg: "숫자만 입력할 수 있습니다."
      },
    },
    type: {
      type: DataTypes.STRING,
      defaultValue: 'etc',
      allowNull: false,
      validate: {
        isIn: {
          args: [['debit', 'point', 'phone', 'etc']],
          msg: "결제 수단이 잘못되었습니다.",
        }
      }
    },
    userUID: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    remark: {
      type: DataTypes.STRING,
      allowNull: true,
    }
  }, {
    timestamps: true,
    updatedAt: false,
  });
}
