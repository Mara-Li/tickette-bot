import { CommandInteraction, CommandInteractionOptionResolver, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

import { ln } from "../locales";
import en from "../locales/language/en";
import fr from "../locales/language/fr";
import { addRoleToTemplate, removeRoleToTemplate } from "../tickets/editRole";
import { downloadJSONTemplate } from "../tickets/template";

export const role = {
	data: new SlashCommandBuilder()
		.setName(en.common.role)
		.setDescription(en.config.role.description)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
		.setNameLocalizations({
			fr: fr.common.role
		})
		.setDescriptionLocalizations({
			fr: fr.config.role.description
		})
		.addStringOption(option =>
			option
				.setName(en.config.edit.message_id.name)
				.setDescription(en.config.edit.message_id.description)
				.setNameLocalizations({
					fr: fr.config.edit.message_id.name
				})
				.setDescriptionLocalizations({
					fr: fr.config.edit.message_id.description
				})
				.setRequired(true)
		)
		.addStringOption(option =>
			option
				.setName(en.config.role.choice.name)
				.setDescription(en.config.role.choice.description)
				.setNameLocalizations({
					fr: fr.config.role.choice.name
				})
				.setDescriptionLocalizations({
					fr: fr.config.role.choice.description
				})
				.setRequired(true)
				.addChoices(
					{ name: en.config.role.choice.add, value: "add", name_localizations: { fr: fr.config.role.choice.add } },
					{ name: en.config.role.choice.remove, value: "remove", name_localizations: { fr: fr.config.role.choice.remove } },
				)
		)
		.addRoleOption(option =>
			option
				.setName(en.common.role)
				.setDescription(en.config.role.role.description)
				.setNameLocalizations({
					fr: fr.common.role
				})
				.setDescriptionLocalizations({
					fr: fr.config.role.role.description
				})
				.setRequired(true)
		),
	async execute(interaction: CommandInteraction) {
		const options = interaction.options as CommandInteractionOptionResolver;
		const message_id = options.getString("message_id", true);
		const choice = options.getString("choice", true) as "add" | "remove";
		//download the previous template
		const template = await downloadJSONTemplate(message_id, interaction);
		if (!template) return;
		const { ticket, message } = template;
		const role = options.getRole("role", true).id;
		switch (choice) {
		case "add":
			addRoleToTemplate(role, ticket, message);
			await interaction.reply({
				content: ln(interaction).edit.role.add.replace("{{role}}", `<@&${role}>`),
			});
			break;
		case "remove":
			if (ticket.roles.length === 1) {
				await interaction.reply({
					content: ln(interaction).error.role.left,
				});
				return;
			}
			if (!ticket.roles.includes(role)) {
				await interaction.reply({
					content: ln(interaction).error.role.notInTemplate.replace("{{role}}", `<@&${role}>`),
				});
				return;
			}
			removeRoleToTemplate(role, ticket, message);
			await interaction.reply({
				content: ln(interaction).edit.role.remove.replace("{{role}}", `<@&${role}>`),
			});
			break;
		}
		return;
	}
};