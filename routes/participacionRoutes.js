const express = require("express");
const router = express.Router();
const authorize = require("../config/authorize");
const { participacionController } = require("../controllers/indexController");

// Definir las rutas para Participacion
router.post("/", authorize(["Organizador", "Asistente"]), participacionController.crearParticipacion);
router.get("/evento/:idEvento", authorize(["Organizador"]), participacionController.obtenerParticipacionesPorEvento);
router.get("/asistente/:idAsistente", authorize(["Organizador", "Asistente"]), participacionController.obtenerParticipacionesPorAsistente);
router.get("/", authorize(["Organizador", "Asistente"]), participacionController.obtenerParticipacionPorId);
router.put("/baja/:idParticipacion", authorize(["Organizador"]), participacionController.bajaConfirmacion);
router.delete("/eliminar/:idParticipacion", authorize(["Organizador", "Asistente"]), participacionController.eliminarParticipacion);
router.get("/certificado/:idParticipacion", authorize(["Organizador", "Asistente"]), participacionController.generarCertificado);
router.put("/confirmar/:idParticipacion", authorize(["Organizador"]), participacionController.confirmarParticipacion);

module.exports = router;
