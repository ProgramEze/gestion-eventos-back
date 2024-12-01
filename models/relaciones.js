const sequelize = require("../config/db");
const Asistente = require("./asistente");
const Evento = require("./evento");
const Participacion = require("./participacion");

Asistente.hasMany(Participacion, { foreignKey: "idAsistente" });
Evento.hasMany(Participacion, { foreignKey: "idEvento" });
Participacion.belongsTo(Asistente, { foreignKey: "idAsistente" });
Participacion.belongsTo(Evento, { foreignKey: "idEvento" });

async function sincronizarModelos() {
    try {
        await sequelize.sync({
            //force: true,
        }); // La opción force: true creará las tablas borrando los datos existentes
        console.log("Modelos sincronizados con la base de datos.");
    } catch (error) {
        console.error(
            "Error al sincronizar los modelos con la base de datos:",
            error
        );
    }
}

sincronizarModelos();

module.exports = { Asistente, Evento, Participacion, sequelize };
