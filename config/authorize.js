function authorize(roles = []) {
	if (typeof roles === "string") {
		roles = [roles];
	}

	return (req, res, next) => {
		// Verifica si el usuario está autenticado y tiene un rol válido
		if (!req.isAuthenticated() || !roles.includes(req.user.rol)) {
			console.log(req.user);
			return res.status(401).json({ error: "Usuario no autorizado" });
		}
		// Si pasa la autorización, continúa con el flujo
		next();
	};
}

module.exports = authorize;
