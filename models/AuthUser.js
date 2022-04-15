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
      unique: {
        args: true,
        msg: "이미 등록된 이메일입니다."
      },
      validate: {
        isEmail: {
          msg: '이메일 주소를 다시 입력해주세요.'
        },
        not: {
          args: [/\S*\|{1,}\S*/g],
          msg: "특수문자 | 는 입력할 수 없습니다."
        }

      }
    },
    phonenum: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: {
        args: true,
        msg: "이미 등록된 전화번호입니다."
      },
      validate: {
        is: {
          args: /(0+[0-9]{8,9})\d$/g,
          msg: "휴대전화 번호를 다시 입력해주세요."
        }
      }
    },
    displayname: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [2, 12],
          msg: "2자 부터 12자까지 설정 할 수 있습니다."
        },
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    point: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: "포인트가 부족합니다."
        }
      }
    },
    role: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      // 0 : Active, 1: Deactive, 2: deleted, 3: manager,
      validate: {
        len: {
          args: [0, 3],
          msg: "잘못된 값이 지정되었습니다.",
        }
      }
    },
  }, {
    paranoid: true,
    timestamps: true,
    updatedAt: false,
    createdAt: false,
  })
}