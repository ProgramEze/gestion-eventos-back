// controllers/eventoController.js
const { Evento, sequelize } = require("../models/relaciones");
const { format, parseISO, isBefore } = require("date-fns");
const { es } = require("date-fns/locale");
const { Op, fn } = require("sequelize");
// obtenerEventosFuturos
const eventoController = {
	crearEvento: async (req, res) => {
		try {
			const { nombre, fecha, ubicacion, descripcion } = req.body;

			// Verificar que todos los campos estén presentes
			if (!nombre || !fecha || !ubicacion || !descripcion) {
				return res
					.status(400)
					.json({ error: "Todos los campos son obligatorios" });
			}

			// Convertir la fecha ingresada desde el input y la fecha actual a objetos Date
			const fechaEvento = parseISO(fecha);
			const fechaActual = new Date(); // Fecha actual con la hora local

			// Imprimir en consola las fechas para depuración
			console.log("Fecha ingresada por input:", fecha);
			console.log(
				"Fecha actual:",
				format(fechaActual, "EEEE d 'de' MMMM 'de' yyyy", {
					locale: es,
				})
			);
			console.log(
				"Fecha del evento:",
				format(fechaEvento, "EEEE d 'de' MMMM 'de' yyyy", {
					locale: es,
				})
			);

			console.log(isBefore(fechaEvento, fechaActual));

			// Comparar si la fecha del evento es anterior a la fecha actual
			if (isBefore(fechaEvento, fechaActual)) {
				return res.status(400).json({
					error: "La fecha del evento no puede ser anterior a la fecha actual",
				});
			}

			// Crear el evento en la base de datos
			await Evento.create({
				nombre,
				fecha: fechaEvento,
				ubicacion,
				descripcion,
			});
			res.status(201).json({
				message: "¡Evento dado de alta exitosamente!",
			});
		} catch (error) {
			res.status(500).json({
				error: "Error al crear el evento. Error: " + error.message,
			});
		}
	},

	obtenerEventos: async (req, res) => {
		try {
			let {
				pagina = 1,
				tamanoPagina = 10,
				filtro = "",
				fechaInicio = "",
				fechaFin = "",
			} = req.query;

			// Asegúrate de que 'pagina' y 'tamanoPagina' sean números válidos
			pagina = parseInt(pagina, 10);
			tamanoPagina = parseInt(tamanoPagina, 10);

			if (isNaN(pagina) || pagina < 1) pagina = 1;
			if (isNaN(tamanoPagina) || tamanoPagina < 1) tamanoPagina = 10;

			const offset = (pagina - 1) * tamanoPagina;
			const maxTamanoPagina = 100; // Limitar el tamaño de la página a 100
			const size = Math.min(tamanoPagina, maxTamanoPagina);

			// Filtro de búsqueda
			const where = {
				[Op.and]: [
					filtro
						? {
								[Op.or]: [
									{ nombre: { [Op.like]: `%${filtro}%` } },
									{ ubicacion: { [Op.like]: `%${filtro}%` } },
									{
										descripcion: {
											[Op.like]: `%${filtro}%`,
										},
									},
								],
						  }
						: {},
					// Filtro por fecha
					fechaInicio && fechaFin
						? {
								fecha: {
									[Op.between]: [fechaInicio, fechaFin], // Filtrar entre las fechas proporcionadas
								},
						  }
						: fechaInicio
						? {
								fecha: {
									[Op.gte]: fechaInicio, // Filtrar eventos desde la fechaInicio
								},
						  }
						: fechaFin
						? {
								fecha: {
									[Op.lte]: fechaFin, // Filtrar eventos hasta la fechaFin
								},
						  }
						: {},
				],
			};

			// Verificar si el usuario es asistente y filtrar solo los eventos futuros
			if (req.user.role === "Asistente") {
				where.fecha = where.fecha || {};
				where.fecha[Op.gte] = fn("CURDATE"); // Filtrar solo eventos futuros
			}

			// Obtener los eventos y contar el total
			const { rows: eventos, count: totalEventos } =
				await Evento.findAndCountAll({
					where,
					limit: size,
					offset: offset,
					order: [["fecha", "ASC"]],
				});

			// Calcular el total de páginas
			const totalPaginas = Math.ceil(totalEventos / size);

			console.log(eventos);

			// Responder con los datos paginados
			res.status(200).json({
				pagina,
				tamanoPagina: size,
				totalEventos,
				totalPaginas,
				eventos,
				prev:
					pagina > 1
						? `/api/eventos?pagina=${
								pagina - 1
						  }&tamanoPagina=${size}&filtro=${filtro}&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
						: null,
				next:
					pagina < totalPaginas
						? `/api/eventos?pagina=${
								pagina + 1
						  }&tamanoPagina=${size}&filtro=${filtro}&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
						: null,
			});
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: "Error al obtener los eventos" });
		}
	},

	// Obtener eventos futuros con paginación y filtro por nombre
	obtenerEventosFuturos: async (req, res) => {
		try {
			// Obtener los parámetros de consulta de la URL (página, límite y búsqueda por nombre)
			const { page = 1, limit = 10, search = "" } = req.query;

			// Calcular el desplazamiento (offset) basado en la página y el límite
			const offset = (page - 1) * limit;

			// Realizar la consulta con paginación y filtrado por nombre (si se proporciona)
			const eventos = await Evento.findAndCountAll({
				where: {
					fecha: {
						[Op.gte]: new Date(), // Solo eventos futuros
					},
					nombre: {
						[Op.iLike]: `%${search}%`, // Filtrado insensible a mayúsculas/minúsculas
					},
				},
				limit: parseInt(limit), // Límite de resultados por página
				offset: parseInt(offset), // Desplazamiento basado en la página actual
				order: [["fecha", "ASC"]], // Ordenar los eventos por fecha ascendente
			});

			// Responder con los eventos y la información de paginación
			res.status(200).json({
				eventos: eventos.rows,
				total: eventos.count,
				page: page,
				totalPages: Math.ceil(eventos.count / limit),
			});
		} catch (error) {
			res.status(500).json({ error: "Error al obtener los eventos" });
		}
	},

	obtenerEventoPorId: async (req, res) => {
		try {
			const { idEvento } = req.params;
			const evento = await Evento.findByPk(idEvento);
			if (!evento) {
				return res.status(404).json({ error: "Evento no encontrado" });
			}
			res.status(200).json(evento);
		} catch (error) {
			res.status(500).json({ error: "Error al obtener el evento" });
		}
	},

	actualizarEvento: async (req, res) => {
		try {
			const { idEvento } = req.params;
			const { nombre, fecha, ubicacion, descripcion } = req.body;
			if (!nombre ||!fecha ||!ubicacion ||!descripcion) {
                return res.status(400).json({ error: "Todos los campos son obligatorios" });
            }
			const evento = await Evento.findByPk(idEvento);
			if (!evento) {
				return res.status(404).json({ error: "Evento no encontrado" });
			}
			console.log(isBefore(new Date(), evento.fecha));
			const [updated] = await Evento.update(
				{ nombre, fecha, ubicacion, descripcion },
				{ where: { idEvento } }
			);
			if (!updated) {
				return res.status(404).json({ error: "Evento no encontrado" });
			}
			res.status(200).json({
				message: "¡Evento actualizado exitosamente!",
			});
		} catch (error) {
			res.status(500).json({ error: "Error al actualizar evento" });
		}
	},

	eliminarEvento: async (req, res) => {
		try {
			const { idEvento } = req.params;
			const deleted = await Evento.destroy({ where: { idEvento } });
			if (!deleted) {
				return res.status(404).json({ error: "Evento no encontrado" }); // Cambiado a 404
			}
			res.status(200).json({
				mensaje: "¡Evento eliminado exitosamente!",
			});
		} catch (error) {
			res.status(500).json({ error: "Error al eliminar evento" });
		}
	},
};

module.exports = eventoController;
