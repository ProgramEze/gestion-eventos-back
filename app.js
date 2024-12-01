const express = require("express");
const path = require("path");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const bodyParser = require("body-parser");
const override = require("method-override");
const passport = require("passport");
const db = require("./config/db");
exports.passport = passport;
require("./config/passportConfig");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const sessionStore = new SequelizeStore({ db }); // db es tu conexión Sequelize

const cors = require("cors"); // Import the cors library

const app = express();

// Configuración inicial
app.use(logger("dev"));
app.use(
	cors({
		origin: "http://localhost:4200", // Reemplaza con el dominio de tu aplicación Angular
		credentials: true, // Permitir cookies en las solicitudes
	})
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static("public"));

// Configuración de body-parser y method-override
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(override("_method"));

const routes = require("./routes/indexRoutes");

// Configuración de sesión
app.use(
	session({
		secret: "secreto",
		store: sessionStore,
		resave: false,
		saveUninitialized: false,
	})
);
sessionStore.sync(); // Sincroniza la tabla de sesiones en la base de datos
app.use(passport.initialize());
app.use(passport.session());

// Middleware para pasar datos de usuario a las vistas
app.use((req, res, next) => {
	res.locals.isAuthenticated = req.isAuthenticated();
	res.locals.user = req.user;
	next();
});

// Rutas
app.use("/", routes);

// Verificar la conexión a la base de datos
db.authenticate()
	.then(() => {
		console.log("Conexión a la base de datos establecida correctamente");
		// Iniciar el servidor una vez que la conexión a la base de datos se haya establecido
		const port = 5000;
		app.listen(port, () => {
			console.log(`Servidor escuchando en el puerto ${port}`);
		});
	})
	.catch((error) => {
		console.error("Error al conectar a la base de datos:", error);
	});

// error handler
app.use((err, req, res, next) => {
	res.status(err.status || 500);
	res.render("error", {
		message: err.message,
		error: app.get("env") === "development" ? err : {},
	});
});

require("./models/relaciones");

exports.app = app;
