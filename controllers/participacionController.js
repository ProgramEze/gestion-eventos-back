const { Participacion, Asistente, Evento } = require("../models/relaciones");
const PDFDocument = require("pdfkit");
const { format, parseISO } = require("date-fns");
const { es } = require("date-fns/locale");
const { Op, fn } = require("sequelize");

function generarCertificadoPdf(nombre, evento, fecha) {
  const fechaFormateada = format(
    new Date(fecha),
    "EEEE d 'de' MMMM 'de' yyyy",
    { locale: es }
  );
  // Crear el documento PDF con tamaño A4 y márgenes
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  // Borde alrededor del certificado
  doc.rect(20, 20, 555, 770).stroke();

  // Encabezado del certificado
  doc
    .fontSize(32)
    .font('Helvetica-Bold')
    .fillColor('#1a237e') // Azul oscuro
    .text('CERTIFICADO DE PARTICIPACIÓN', { align: 'center' })
    .moveDown(2);

  // Cuerpo principal
  doc
    .fontSize(18)
    .font('Helvetica')
    .fillColor('black')
    .text(`Por la presente se certifica que`, {
      align: 'center',
    })
    .moveDown();

  // Nombre del asistente
  doc
    .fontSize(28)
    .font('Helvetica-Bold')
    .fillColor('#d32f2f') // Rojo oscuro
    .text(`${nombre}`, { align: 'center' })
    .moveDown(1.5);

  // Detalles del evento
  doc
    .fontSize(18)
    .font('Helvetica')
    .fillColor('black')
    .text(`Ha participado satisfactoriamente en el evento`, {
      align: 'center',
    })
    .moveDown();

  // Nombre del evento
  doc
    .fontSize(24)
    .font('Helvetica-Bold')
    .fillColor('#1976d2') // Azul
    .text(`${evento}`, { align: 'center' })
    .moveDown();

  // Fecha del evento
  doc
    .fontSize(18)
    .font('Helvetica')
    .fillColor('black')
    .text(`Llevado a cabo el día ${fechaFormateada}.`, {
      align: 'center',
    })
    .moveDown(3);

  // Firma y pie de página
  doc
    .fontSize(16)
    .text('___________________________', { align: 'center' })
    .text('Organizador del Evento', { align: 'center' })
    .moveDown(2);

  doc
    .fontSize(12)
    .fillColor('gray')
    .text(
      'Este certificado ha sido generado automáticamente y es válido sin necesidad de firma física.',
      {
        align: 'center',
      }
    );

  return doc;
}

module.exports = { generarCertificadoPdf };


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
				error:
					"Error al registrar la participación. Error: " +
					error.message,
			});
		}
	},

	obtenerParticipacionesPorEvento: async (req, res) => {
		try {
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
		  const { idAsistente, idEvento } = req.query; // Cambiar req.body por req.query
		  const participacion = await Participacion.findOne({
			where: { idAsistente, idEvento },
			include: [Asistente, Evento],
		  });
		  if (!participacion) {
			return res.status(404).json({ error: "Participación no encontrada" });
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
		  const participacion = await Participacion.findByPk(idParticipacion, {
			include: [Asistente, Evento],
		  });
		  if (!participacion) {
			return res.status(404).json({ error: "Participación no encontrada" });
		  }

		  const { nombre } = participacion.Asistente;
		  const { nombre: evento, fecha } = participacion.Evento;

		  console.log(fecha);
		  const doc = generarCertificadoPdf(nombre, evento, parseISO(fecha));

		  res.setHeader("Content-Type", "application/pdf");
		  res.setHeader(
			"Content-Disposition",
			`attachment; filename=certificado_${nombre}_${evento}.pdf`
		  );

		  doc.pipe(res);
		  doc.on('end', () => res.end()); // Importante para cerrar la respuesta correctamente
		  doc.end();
		} catch (error) {
		  console.error("Error al generar el certificado:", error);
		  res.status(500).json({ error: "Error al generar el certificado" });
		}
	  },

	confirmarParticipacion: async (req, res) => {
		try {
			if(res.statusCode === 401){
				return res.status(401).json({ error: "No autorizado" });
			}
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
};

module.exports = participacionController;
