import { BaseInteraction, Guild } from "discord.js";
import en from "./language/en.json";
import fr from "./language/fr.json";

export function ln(interaction: BaseInteraction, guild?: Guild) {
	let lang = interaction.locale ?? "en";
	if (guild)
		lang = guild.preferredLocale ?? lang;
	switch (lang) {
	case "fr":
		return fr;
	default:
		return en;
	}
}
