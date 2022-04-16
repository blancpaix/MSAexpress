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
      validate: {
        len: {
          args: [1, 64],
          msg: "1자 이상, 64자 미만으로 입력할 수 있습니다.",
        },
      }
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: {
          args: [1],
          msg: '상품 가격은 1원부터 지정 가능합니다.'
        }
      }
    },
    discription: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: "재고가 부족합니다."
        }
      }
    },
    img: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    manager: {    // user email
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    paranoid: true,
    timestamps: true,
    createdAt: false,
    updatedAt: true,
  })
}

