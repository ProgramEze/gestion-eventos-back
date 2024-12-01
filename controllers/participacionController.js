const { Participacion, Asistente, Evento } = require("../models/relaciones");
const PDFDocument = require("pdfkit");
const { format } = require("date-fns");
const { es } = require("date-fns/locale");
const { Op, fn } = require("sequelize");

// Función para generar el PDF del certificado
function generarCertificadoPdf(nombre, evento, fecha) {
	const fechaFormateada = format(
		new Date(fecha),
		"EEEE d 'de' MMMM 'de' yyyy",
		{ locale: es }
	);
	const doc = new PDFDocument({ size: "A4", margin: 50 });
	doc.fontSize(25).text(`Certificado de Participación`, { align: "center" });
	doc.moveDown();
	doc.fontSize(18).text(`Nombre: ${nombre}`, { align: "left" });
	doc.fontSize(18).text(`Evento: ${evento}`, { align: "left" });
	doc.fontSize(18).text(`Fecha: ${fechaFormateada}`, { align: "left" });
	return doc;
}

const participacionController = {
	crearParticipacion: async (req, res) => {
		try {
			const { idAsistente, idEvento } = req.body;
			await Participacion.create({
				idAsistente,
				idEvento,
				confirmacion: false,
			});
			res.status(201).json({
				message: "¡Participación registrada exitosamente!",
			});
		} catch (error) {
			res.status(500).json({
				error: "Error al registrar la participación",
			});
		}
	},

	obtenerParticipacionesPorEvento: async (req, res) => {
		try {
			console.log(
				"obtenerParticipacionesPorEvento",
				req.params,
				req.query
			);
			const { idEvento } = req.params;
			let { pagina = 1, tamanoPagina = 10, filtro = "" } = req.query;

			// Validar que 'pagina' y 'tamanoPagina' sean números válidos
			pagina = parseInt(pagina, 10);
			tamanoPagina = parseInt(tamanoPagina, 10);

			if (isNaN(pagina) || pagina < 1) pagina = 1;
			if (isNaN(tamanoPagina) || tamanoPagina < 1) tamanoPagina = 10;

			const offset = (pagina - 1) * tamanoPagina;
			const maxTamanoPagina = 100;
			const size = Math.min(tamanoPagina, maxTamanoPagina);

			// Verificar si el evento existe
			const evento = await Evento.findOne({
				where: { idEvento },
			});

			if (!evento) {
				return res.status(404).json({ error: "Evento no encontrado" });
			}

			// Crear el filtro de búsqueda
			const where = {
				idEvento,
				[Op.and]: [
					filtro
						? {
								[Op.or]: [
									{
										"$Asistente.nombre$": {
											[Op.like]: `%${filtro}%`,
										},
									},
									{
										"$Asistente.email$": {
											[Op.like]: `%${filtro}%`,
										},
									},
									{
										"$Asistente.rol$": {
											[Op.like]: `%${filtro}%`,
										},
									},
								],
						  }
						: {},
				],
			};

			// Obtener las participaciones
			const { rows: participaciones, count: totalParticipaciones } =
				await Participacion.findAndCountAll({
					where,
					limit: size,
					offset,
					include: [
						{
							model: Asistente,
						},
					],
					order: [["Asistente", "nombre", "ASC"]], // Ordenar por nombre de asistente
				});

			const totalPaginas = Math.ceil(totalParticipaciones / size);

			// Responder con la paginación y resultados
			res.status(200).json({
				pagina,
				tamanoPagina: size,
				totalParticipaciones,
				totalPaginas,
				evento,
				participaciones,
				prev:
					pagina > 1
						? `/api/participaciones/evento/${idEvento}?pagina=${
								pagina - 1
						  }&tamanoPagina=${size}&filtro=${filtro}`
						: null,
				next:
					pagina < totalPaginas
						? `/api/participaciones/evento/${idEvento}?pagina=${
								pagina + 1
						  }&tamanoPagina=${size}&filtro=${filtro}`
						: null,
			});
		} catch (error) {
			res.status(500).json({
				error: "Error al obtener las participaciones",
				detalles: error.message,
			});
		}
	},

	obtenerParticipacionesPorAsistente: async (req, res) => {
		try {
			const { idAsistente } = req.params;
			const participaciones = await Participacion.findAll({
				where: { idAsistente },
				include: [Asistente, Evento],
			});
			res.status(200).json(participaciones);
		} catch (error) {
			res.status(500).json({
				error: "Error al obtener las participaciones",
				detalles: error.message,
			});
		}
	},

	obtenerParticipacionPorId: async (req, res) => {
		try {
			const { idParticipacion } = req.params;
			const participacion = await Participacion.findByPk(
				idParticipacion,
				{ include: [Asistente, Evento] }
			);
			if (!participacion) {
				return res
					.status(404)
					.json({ error: "Participación no encontrada" });
			}
			res.status(200).json(participacion);
		} catch (error) {
			res.status(500).json({
				error: "Error al obtener la participación",
			});
		}
	},

	bajaConfirmacion: async (req, res) => {
		try {
			const { idParticipacion } = req.params;
			const participacion = await Participacion.findByPk(idParticipacion);
			if (!participacion) {
				return res
					.status(404)
					.json({ error: "Participación no encontrada" });
			}
			const [updated] = await Participacion.update(
				{ confirmacion: false },
				{ where: { idParticipacion } }
			);
			if (!updated) {
				return res
					.status(404)
					.json({ error: "Participación no encontrada" });
			}
			res.status(200).json({ message: "¡Baja exitosa!" });
		} catch (error) {
			res.status(500).json({
				error: "Error al actualizar la confirmación",
			});
		}
	},

	eliminarParticipacion: async (req, res) => {
		try {
			const { idParticipacion } = req.params;
			const deleted = await Participacion.destroy({
				where: { idParticipacion },
			});
			if (!deleted) {
				return res
					.status(404)
					.json({ error: "Participación no encontrada" });
			}
			res.status(200).json({
				message: "¡Participación eliminada exitosamente!",
			});
		} catch (error) {
			res.status(500).json({
				error: "Error al eliminar la participación",
			});
		}
	},

	generarCertificado: async (req, res) => {
		try {
			const { idParticipacion } = req.params;
			const participacion = await Participacion.findByPk(
				idParticipacion,
				{ include: [Asistente, Evento] }
			);
			if (!participacion) {
				return res
					.status(404)
					.json({ error: "Participación no encontrada" });
			}
			const { nombre } = participacion.Asistente;
			const { nombre: evento, fecha } = participacion.Evento;
			const doc = generarCertificadoPdf(nombre, evento, fecha);

			res.setHeader("Content-Type", "application/pdf");
			res.setHeader(
				"Content-Disposition",
				`attachment; filename=certificado_${nombre}_${evento}.pdf`
			);
			doc.pipe(res);
			doc.end();
		} catch (error) {
			res.status(500).json({ error: "Error al generar el certificado" });
		}
	},

	confirmarParticipacion: async (req, res) => {
		try {
			const { idParticipacion } = req.params;
			const [updated] = await Participacion.update(
				{ confirmacion: true },
				{ where: { idParticipacion } }
			);
			if (!updated) {
				return res
					.status(404)
					.json({ error: "Participación no encontrada" });
			}
			res.status(200).json({
				message: "Participación confirmada exitosamente",
			});
		} catch (error) {
			res.status(500).json({
				error: "Error al confirmar la participación",
			});
		}
	},

	obtenerParticipacionesPorConfirmarPorEvento: async (req, res) => {
		try {
			const participaciones = await Participacion.findAll({
				where: { confirmacion: false, idEvento: req.params.idEvento },
				include: [Asistente, Evento],
			});
			res.status(200).json(participaciones);
		} catch (error) {
			res.status(500).json({
				error: "Error al obtener las participaciones por confirmar",
			});
		}
	},

	obtenerParticipacionesConfirmadasPorEvento: async (req, res) => {
		try {
			const participaciones = await Participacion.findAll({
				where: { confirmacion: true, idEvento: req.params.idEvento },
				include: [Asistente, Evento],
			});
			res.status(200).json(participaciones);
		} catch (error) {
			res.status(500).json({
				error: "Error al obtener las participaciones confirmadas",
			});
		}
	},

	obtenerParticipacionesPorConfirmarPorAsistente: async (req, res) => {
		try {
			const participaciones = await Participacion.findAll({
				where: {
					confirmacion: false,
					idAsistente: req.params.idAsistente,
				},
				include: [Asistente, Evento],
			});
			res.status(200).json(participaciones);
		} catch (error) {
			res.status(500).json({
				error: "Error al obtener las participaciones por confirmar",
			});
		}
	},

	obtenerParticipacionesConfirmadasPorAsistente: async (req, res) => {
		try {
			const participaciones = await Participacion.findAll({
				where: {
					confirmacion: true,
					idAsistente: req.params.idAsistente,
				},
				include: [Asistente, Evento],
			});
			res.status(200).json(participaciones);
		} catch (error) {
			res.status(500).json({
				error: "Error al obtener las participaciones confirmadas",
			});
		}
	},
};

module.exports = participacionController;
