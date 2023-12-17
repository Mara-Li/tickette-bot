import { BaseInteraction } from "discord.js";

import en from "./language/en";
import fr from "./language/fr";

export function ln(interaction: BaseInteraction) {
	const lang = interaction.locale ?? "en";
	switch (lang) {
	case "fr":
		return fr;
	default:
		return en;
	}
}

