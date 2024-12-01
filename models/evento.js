"use strict";
const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

class Evento extends Model { }
const evento = Evento.init(
    {
        idEvento: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        nombre: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        fecha: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        ubicacion: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        descripcion: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        sequelize,
        freezeTableName: true,
        timestamps: false,
        modelName: "Evento",
        tableName: "evento",
    }
);
module.exports = evento;
