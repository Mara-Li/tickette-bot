import { CommandInteraction } from "discord.js";

import en from "./language/en";
import fr from "./language/fr";

export function ln(interaction: CommandInteraction) {
	const lang = interaction.locale ?? "en";
	switch (lang) {
	case "fr":
		return fr;
	default:
		return en;
	}
}

