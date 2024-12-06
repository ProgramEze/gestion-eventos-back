const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const authorize = require("../config/authorize");
const Asistente = require("../models/asistente");
const asistenteRoutes = require("./asistenteRoutes");
const eventoRoutes = require("./eventoRoutes");
const participacionRoutes = require("./participacionRoutes");
const { passport } = require("../app");

// Login route
router.post("/login", (req, res, next) => {
	passport.authenticate("local", (err, user, info) => {
		if (err) {
			// Error interno en la autenticación
			return res.status(500).json({
				message: "Error interno en la autenticación",
				error: err,
			});
		}

		if (!user) {
			// Fallo en la autenticación
			return res
				.status(401)
				.json({ message: "Credenciales incorrectas", info });
		}

		// Si se autentica correctamente, inicia sesión y envía un JSON de éxito
		req.logIn(user, (err) => {
			if (err) {
				return res
					.status(500)
					.json({ message: "Error al iniciar sesión", error: err });
			}
			res.cookie("connect.sid", req.sessionID, {
				httpOnly: true, // Solo accesible desde el servidor
				secure: true, // Solo se envía a través de HTTPS
				sameSite: "strict", // Previene ataques CSRF
			});

			return res.status(200).json({
				message: "Inicio de sesión exitoso, ",
				user: {
					idAsistente: user.idAsistente,
					nombre: user.nombre,
					domicilio: user.domicilio,
					email: user.email,
					rol: user.rol,
				},
				cookie: req.sessionID,
			});
		});
	})(req, res, next);
});

router.get("/logout", (req, res) => {
	req.logout((err) => {
		// Proporciona una función callback para errores
		if (err) {
			console.error("Error durante el cierre de sesión:", err);
			return res.status(404).json({
				message: "Error durante el cierre de sesión:",
				err,
			});
		}
		if (!req.sessionID)
			return res.status(404).json({ error: "No se ha iniciado sesión" });
		req.session.destroy();
		return res.status(200).json({
			message: "Cierre de sesión exitoso",
		});
	});
});

router.get("/perfil", authorize(["Organizador", "Asistente"]), (req, res) => {
	const asistente = req.user;
	delete asistente.password;
	if (!req.sessionID)
		return res.status(404).json({ error: "No se ha iniciado sesión" });
	res.json(asistente);
});

router.get("/rol", authorize(["Organizador", "Asistente"]), (req, res) => {
	if (req.user.rol !== undefined) {
		return res.status(200).json({ rol: req.user.rol });
	} else {
		return res.status(404).json({ error: "No se ha iniciado sesión" });
	}
});

router.post("/registrar", async (req, res) => {
	try {
		const { nombre, domicilio, email, password } = req.body;

		// Expresión regular para validar el formato del email
		const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

		if (!emailRegex.test(email)) {
			return res
				.status(400)
				.json({ error: "El formato del email no es válido" });
		}

		const asistente = await Asistente.findOne({ where: { email } });
		if (asistente) {
			return res.status(400).json({ error: "El asistente ya existe" });
		}

		if (password.length < 6) {
			return res
				.status(400)
				.json({
					error: "La contraseña debe tener al menos 6 caracteres",
				});
		}

		const hashedPassword = await bcrypt.hash(password, 5);

		await Asistente.create({
			nombre,
			domicilio,
			email,
			password: hashedPassword,
			rol: "Asistente",
			estado: 1,
		});

		res.status(201).json({
			message: "¡Asistente dado de alta exitosamente!",
		});
	} catch (error) {
		res.status(500).json({
			error: "Error al crear el asistente. Error: " + error.message,
		});
	}
});

// Conectar las rutas a sus respectivos endpoints
router.use("/asistentes", authorize(["Organizador"]), asistenteRoutes);
router.use("/eventos", authorize(["Organizador", "Asistente"]), eventoRoutes);
router.use(
	"/participaciones",
	authorize(["Organizador", "Asistente"]),
	participacionRoutes
);

module.exports = router;
