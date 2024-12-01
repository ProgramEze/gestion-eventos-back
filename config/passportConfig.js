const { passport } = require("../app");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const asistente = require("../models/asistente");

function asistentePorEmail(email) {
	return asistente.findOne({ where: { email: email }, raw: true });
}

function asistentePorId(id) {
	return asistente.findOne({ where: { idAsistente: id }, raw: true });
}

(() => {
	const autenticarAsistente = async (email, password, done) => {
		const user = await asistentePorEmail(email);
		try {
			if (user == null) {
				return done(null, false, {
					message: "no existe asistente con ese email",
				});
			}
			if (await bcrypt.compare(password, user.password)) {
				return done(null, user);
			} else {
				return done(null, false, { message: "contraseña incorrecta" });
			}
		} catch (error) {
			return done(error);
		}
	};
	passport.use(
		new LocalStrategy(
			{ usernameField: "email", passwordField: "password" },
			autenticarAsistente
		)
	);
	passport.serializeUser((user, done) => {
		done(null, user.idAsistente); // Guarda el ID en la sesión
	});

	passport.deserializeUser(async (idAsistente, done) => {
		const user = await asistentePorId(idAsistente);
		done(null, user); // Recupera al usuario de la sesión
	});
})();
