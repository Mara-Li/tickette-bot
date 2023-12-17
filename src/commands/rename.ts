import { CommandInteraction, CommandInteractionOptionResolver, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

import { ln } from "../locales";
import en from "../locales/language/en";
import fr from "../locales/language/fr";
import { renameThread } from "../tickets/editname";
import { downloadJSONTemplate } from "../tickets/template";

export const rename = {
	data : new SlashCommandBuilder()
		.setName(en.config.rename.title)
		.setDescription(en.config.rename.description)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
		.setNameLocalizations({
			fr: fr.config.rename.title
		})
		.setDescriptionLocalizations({
			fr: fr.config.rename.description
		})
		.addStringOption(option =>
			option
				.setName(en.config.edit.message_id.name)
				.setDescription(en.config.edit.message_id.description)
				.setRequired(true)
		)
		.addStringOption(option =>
			option
				.setName(en.config.new.thread_name.name)
				.setNameLocalizations({
					fr: fr.config.new.thread_name.name
				})
				.setDescription(en.config.new.thread_name.description)
				.setDescriptionLocalizations({
					fr: fr.config.new.thread_name.description
				})
				.setRequired(true)
		),
	async execute(interaction: CommandInteraction) {
		const options = interaction.options as CommandInteractionOptionResolver;
		const message_id = options.getString("message_id", true);
		const thread_name = options.getString("thread_name", true);
		const template = await downloadJSONTemplate(message_id, interaction);
		if (!template) {
			await interaction.reply({
				content: ln(interaction).error.channel,
			});
			return;
		}
		const { ticket, message } = template;
		await renameThread(thread_name, ticket, message);
	}

};