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

  const RecapData = sequelize.define(
    "recap_data",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      created_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      created_by: {
        type: DataTypes.STRING,
        allowNull: false
      },
      claim_type: {
        type: DataTypes.ENUM('HEALTH', 'WELLNESS', 'TAX', 'DEDUCTION'),
        allowNull: false
      },
      claim_name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      claim_description: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      nominal: {
        type: DataTypes.DECIMAL,
        allowNull: false
      },
      period_month: {
        type: DataTypes.TINYINT,
        allowNull: false
      },
      period_year: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      employee_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    },
    {
      timestamps: true,
      createdAt: false, // don't add createdAt attribute
      updatedAt: false,
    }
  );

  RecapData.belongsTo(UserEmployee, { foreignKey: 'employee_id' });
  return RecapData;
};
