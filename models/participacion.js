const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

class Participacion extends Model { }
const participacion = Participacion.init(
    {
        idParticipacion: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        idAsistente: {
            allowNull: false,
            type: DataTypes.INTEGER,
            references: {
                model: "Asistente",
                key: "idAsistente",
            },
        },
        idEvento: {
            allowNull: false,
            type: DataTypes.INTEGER,
            references: {
                model: "Evento",
                key: "idEvento",
            },
        },
        confirmacion: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
    },
    {
        sequelize,
        freezeTableName: true,
        timestamps: false,
        modelName: "Participacion",
        tableName: "participacion",
        indexes: [
            {
                unique: true,
                fields: ["idAsistente", "idEvento"]
            }
        ]
    }
);

module.exports = participacion;
