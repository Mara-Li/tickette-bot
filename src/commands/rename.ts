import {
	type CommandInteraction,
	type CommandInteractionOptionResolver,
	PermissionFlagsBits,
	SlashCommandBuilder,
} from "discord.js";

import { ln } from "../locales";
import en from "../locales/language/en";
import fr from "../locales/language/fr";
import { renameThread } from "../tickets/editname";
import { downloadJSONTemplate } from "../tickets/template";

export const rename = {
	data: new SlashCommandBuilder()
		.setName(en.rename.title)
		.setDescription(en.rename.description)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
		.setNameLocalizations({
			fr: fr.rename.title,
		})
		.setDescriptionLocalizations({
			fr: fr.rename.description,
		})
		.addStringOption((option) =>
			option
				.setName(en.message_id.name)
				.setDescription(en.message_id.description)
				.setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName(en.new.thread_name.name)
				.setNameLocalizations({
					fr: fr.new.thread_name.name,
				})
				.setDescription(en.new.thread_name.description)
				.setDescriptionLocalizations({
					fr: fr.new.thread_name.description,
				})
				.setRequired(true)
		),
	async execute(interaction: CommandInteraction) {
		const options = interaction.options as CommandInteractionOptionResolver;
		const messageId = options.getString("message_id", true);
		const threadName = options.getString("thread_name", true);
		const template = await downloadJSONTemplate(messageId, interaction);
		if (!template) {
			await interaction.reply({
				content: ln(interaction).error.channel,
			});
			return;
		}
		const { ticket, message } = template;
		await renameThread(threadName, ticket, message);
	},
};
