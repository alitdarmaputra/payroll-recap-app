module.exports = (sequelize, DataTypes) => {
  const UserEmployee = sequelize.define(
    "user_employee",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      full_name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [4, 30],
        },
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: { isEmail: true },
      },
      created_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updated_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM,
        values: ["ACTIVE", "DELETED"],
      },
      salary: {
        type: DataTypes.DECIMAL,
      },
    },
    {
      timestamps: true,
      createdAt: false, // don't add createdAt attribute
      updatedAt: false,
    }
  );
  return UserEmployee;
};
