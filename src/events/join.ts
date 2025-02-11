import type { Client } from "discord.js";

import { commandsList } from "../commands";
import en from "../locales/language/en.json";
import fr from "../locales/language/fr.json";

export default (client: Client): void => {
	client.on("guildCreate", async (guild) => {
		try {
			for (const command of commandsList) {
				await guild.commands.create(command.data);
				console.log(`Command ${command.data.name} created in ${guild.name}`);
			}
		} catch (error) {
			console.error(error);
		}
	});
};
