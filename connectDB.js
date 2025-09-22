import Express from "express";
import cors from "cors";

/**
 * Classe qui permet d'initialiser le serveur API, la documentation pour les users et les sports
 */
export class Connect_DB {
	static instance;
	#express;
	constructor() {
		this.singleton();
		this.init_connexion();
	}
	/**
	 * Le principe est d'avoir une seule instance de notre objet express
	 */
	singleton() {
		//Si notre instance est vide, alors on lui attribut l'instance de la classe
		if (!this.instance) {
			this.instance = this;
		}
		//On retourne l'instance
		return this.instance;
	}
	/**
	 * Initialise la connexion à la BDD
	 */
	init_connexion() {
		//Configuration de l'api
		this.#express = Express();

		try {
			this.#express.use(
				cors({
					origin: "*",
					methods: ["GET", "POST", "PUT", "DELETE"],
					allowedHeaders: ["Content-Type", "Authorization"],
				})
			);
			console.log("Instance connectDB create ✅");
		} catch (error) {
			console.log(error);
		}
	}

	getExpress() {
		return this.#express;
	}
}
