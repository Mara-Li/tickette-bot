import process from "node:process";
import type { Client } from "discord.js";
import dotenv from "dotenv";

import { commandsList } from "../commands";
import { VERSION } from "../index";

if (process.env.ENV === "production") {
	dotenv.config({ path: ".env.prod" });
} else {
	dotenv.config({ path: ".env" });
}

export default (client: Client): void => {
	client.on("clientReady", async () => {
		if (!client.user || !client.application) {
			return;
		}
		console.info(`${client.user.username} is online; v.${VERSION}`);
		const serializedCommands = commandsList.map((command) => command.data.toJSON());

		// Enregistrer les commandes pour tous les serveurs en parallèle
		const registrationPromises = client.guilds.cache.map(async (guild) => {
			console.log(`Registering commands for ${guild.name}`);
			try {
				await guild.commands.set(serializedCommands);
				console.log(`Commands registered for ${guild.name}`);
			} catch (error) {
				console.error(`Failed to register commands for ${guild.name}:`, error);
			}
		});

		await Promise.all(registrationPromises);
		console.log("All commands registered successfully!");
	});
};
