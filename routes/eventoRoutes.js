const express = require("express");
const router = express.Router();
const authorize = require("../config/authorize");
const { eventoController } = require("../controllers/indexController");

// Definir las rutas para Evento
router.post("/", authorize(["Organizador"]), eventoController.crearEvento);
router.get("/", authorize(["Organizador", "Asistente"]), async (req, res) => {
	try {
		await eventoController.obtenerEventos(req, res);
	} catch (error) {
		res.status(500).json({ error: "Error en la ruta de eventos" });
	}
});
router.get(
	"/participo/",
	authorize(["Organizador", "Asistente"]),
	eventoController.obtenerEventosParticipados
);
router.get(
	"/no-participo/",
	authorize(["Organizador", "Asistente"]),
	eventoController.obtenerEventosNoParticipados
);
router.get(
	"/cantidad-hasta-fin-anio",
	authorize(["Organizador", "Asistente"]),
	eventoController.obtenerCantidadEventosHastaFinAnio
);

router.get(
    "/cinco-eventos",
    authorize(["Organizador", "Asistente"]),
    eventoController.obtenerCincoEventos
);

router.get(
	"/:idEvento",
	authorize(["Organizador", "Asistente"]),
	eventoController.obtenerEventoPorId
);
router.put(
	"/:idEvento",
	authorize(["Organizador"]),
	eventoController.actualizarEvento
);
router.delete(
	"/:idEvento",
	authorize(["Organizador"]),
	eventoController.eliminarEvento
);

module.exports = router;
