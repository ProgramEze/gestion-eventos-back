const express = require("express");
const router = express.Router();
const authorize = require("../config/authorize");
const { asistenteController } = require("../controllers/indexController");

// Definir las rutas para Asistente
router.get("/", authorize(["Organizador"]), async (req, res) => {
	try {
	  await asistenteController.obtenerAsistentes(req, res);
	} catch (error) {
	  res.status(500).json({ error: "Error en la ruta de asistentes" });
	}
  });

router.get("/:idAsistente", authorize(["Organizador", "Asistente"]), asistenteController.obtenerAsistentePorId);
router.put("/:idAsistente", authorize(["Organizador", "Asistente"]), asistenteController.actualizarAsistente);
router.delete("/:idAsistente", authorize(["Organizador"]), asistenteController.eliminarAsistente);

module.exports = router;
