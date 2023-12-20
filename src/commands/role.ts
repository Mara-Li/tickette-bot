import { CommandInteraction, CommandInteractionOptionResolver, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

import { ln } from "../locales";
import en from "../locales/language/en";
import fr from "../locales/language/fr";
import { addRoleToTemplate, removeRoleToTemplate } from "../tickets/editRole";
import { downloadJSONTemplate } from "../tickets/template";

export const role = {
	data: new SlashCommandBuilder()
		.setName(en.common.role)
		.setDescription(en.role.description)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
		.setNameLocalizations({
			fr: fr.common.role
		})
		.setDescriptionLocalizations({
			fr: fr.role.description
		})
		.addStringOption(option =>
			option
				.setName(en.message_id.name)
				.setDescription(en.message_id.description)
				.setNameLocalizations({
					fr: fr.message_id.name
				})
				.setDescriptionLocalizations({
					fr: fr.message_id.description
				})
				.setRequired(true)
		)
		.addStringOption(option =>
			option
				.setName(en.role.choice.name)
				.setDescription(en.role.choice.description)
				.setNameLocalizations({
					fr: fr.role.choice.name
				})
				.setDescriptionLocalizations({
					fr: fr.role.choice.description
				})
				.setRequired(true)
				.addChoices(
					{ name: en.role.choice.add, value: "add", name_localizations: { fr: fr.role.choice.add } },
					{ name: en.role.choice.remove, value: "remove", name_localizations: { fr: fr.role.choice.remove } },
				)
		)
		.addRoleOption(option =>
			option
				.setName(en.common.role)
				.setDescription(en.role.role.description)
				.setNameLocalizations({
					fr: fr.common.role
				})
				.setDescriptionLocalizations({
					fr: fr.role.role.description
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