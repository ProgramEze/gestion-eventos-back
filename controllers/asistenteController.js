const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
const { Asistente } = require("../models/relaciones");

const asistenteController = {
	// Obtener todos los asistentes
	obtenerAsistentes: async (req, res) => {
		try {
		  let { pagina = 1, tamanoPagina = 5, filtro = "" } = req.query;

		  // Asegúrate de que 'pagina' y 'tamanoPagina' sean números válidos
		  pagina = parseInt(pagina, 10);
		  tamanoPagina = parseInt(tamanoPagina, 10);

		  // Si los valores no son números válidos, usa valores predeterminados
		  if (isNaN(pagina) || pagina < 1) pagina = 1;
		  if (isNaN(tamanoPagina) || tamanoPagina < 1) tamanoPagina = 5;

		  const offset = (pagina - 1) * tamanoPagina;
		  const maxTamanoPagina = 100;
		  const size = Math.min(tamanoPagina, maxTamanoPagina);

		  const { rows: asistentes, count: totalAsistentes } =
			await Asistente.findAndCountAll({
			  where: filtro ? { nombre: { [Op.like]: `%${filtro}%` } } : {},
			  limit: size,
			  offset: offset,
			});

		  // Calcular el total de páginas
		  const totalPaginas = Math.ceil(totalAsistentes / size);

		  // Responder con los datos paginados
		  res.status(200).json({
			pagina,
			tamanoPagina: size,
			totalAsistentes,
			totalPaginas,
			asistentes,
			prev: pagina > 1 ? `/api/asistentes?pagina=${pagina - 1}&tamanoPagina=${size}` : null,
			next: pagina < totalPaginas ? `/api/asistentes?pagina=${pagina + 1}&tamanoPagina=${size}` : null,
		  });
		} catch (error) {
		  console.error(error);
		  res.status(500).json({ error: "Error al obtener los asistentes" });
		}
	  },

	// Obtener un asistente por ID
	obtenerAsistentePorId: async (req, res) => {
		try {
			const { idAsistente } = req.params;
			const asistente = await Asistente.findByPk(idAsistente);
			if (!asistente) {
				return res
					.status(404)
					.json({ error: "Asistente no encontrado" });
			}
			res.status(200).json(asistente);
		} catch (error) {
			res.status(500).json({ error: "Error al obtener el asistente" });
		}
	},

	// Actualizar un asistente
	// no permitir actualizar si se ingresa un email ya cargado.
	actualizarAsistente: async (req, res) => {
		try {
			const { idAsistente } = req.params;
			const { nombre, domicilio, email, rol, estado } = req.body;
			const asistente = await Asistente.findAndCountAll({
				where: { email },
			});
			console.log(idAsistente);
			console.log(asistente);
			if (asistente > 1) {
				return res
					.status(400)
					.json({ error: "El email ya está en uso." });
			}
			const [updated] = await Asistente.update(
				{ nombre, domicilio, email, rol, estado },
				{ where: { idAsistente } }
			);
			console.log(updated);
			if (!updated) {
				return res.status(404).json({
					error: "No se ha realizado ninguna actualización",
				});
			}
			res.status(200).json({
				message: "¡Asistente actualizado exitosamente!",
			});
		} catch (error) {
			res.status(500).json({ error: "Error al actualizar el asistente" });
		}
	},

	// Eliminar un asistente
	eliminarAsistente: async (req, res) => {
		try {
			const { idAsistente } = req.params;
			const deleted = await Asistente.destroy({ where: { idAsistente } });
			if (!deleted) {
				return res
					.status(404)
					.json({ error: "Asistente no encontrado" });
			}
			res.status(200).json({
				message: "¡Asistente eliminado exitosamente!",
			});
		} catch (error) {
			res.status(500).json({ error: "Error al eliminar el asistente" });
		}
	},
};

module.exports = asistenteController;
