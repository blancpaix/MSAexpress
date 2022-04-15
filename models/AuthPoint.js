// 오직 포인트의 증감내역, 언제 사용했는지 정도까지만, 그러면 참조할 것이 없음
// type : 어떤 수단으로 포인트가 증감되었는지? load : debit,cash, phone / pay : point

export default function (sequelize, DataTypes) {
  return sequelize.define('Point', {
    idx: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      defaultValue: 'etc',
      // cash, debit, etc,
      allowNull: false,
      validate: {
        isIn: {
          args: [['debit', 'point', 'phone', 'etc']],
          msg: "결제 수단이 잘못되었습니다.",
        }
      }
    },
    remark: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pay: {    // 사용
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: "최소 지불 비용은 0 입니다."
        }
      }
    },
    load: {   // 적립
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: "최소 충전 비용은 0 입니다."
        }
      }
    },
    purchaseUID: {
      type: DataTypes.INTEGER,
      allowNull: true,
    }
  }, {
    timestamps: true,
    updatedAt: false,
  });
}
