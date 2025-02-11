import {
	type CommandInteraction,
	type CommandInteractionOptionResolver,
	MessageFlags,
	PermissionFlagsBits,
	SlashCommandBuilder,
} from "discord.js";

import { cmdLn, ln } from "../locales";
import i18next from "../locales/init";
import {
	addFieldToTemplate,
	editFieldToTemplate,
	removeFieldToTemplate,
} from "../tickets/fields";
import { downloadJSONTemplate } from "../tickets/template";
/**
 * Tickets commands :
 * /config new <template name for thread name> <@role> (optional field) // The template is saved as an json in the channel used for ticket creation ; template is pinned
 * /config role <ID_message_template> [choice: Add | remove | clean] <@role> // edit the role of the template
 * /config field <ID_message_template> [choice: Add | remove | edit] <field name> <field description> <field type> <required> // edit the field of the template
 * /create <ID_Message_Template> //create a ticket menu in the channel used for the command
 * /close
 */

const t = i18next.getFixedT("en");

export const fields = {
	data: new SlashCommandBuilder()
		.setName(t("fields.title"))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
		.setDescription(t("fields.description"))
		.setNameLocalizations(cmdLn("fields.title"))
		.setDescriptionLocalizations(cmdLn("fields.description"))
		.addSubcommand((sub) =>
			sub
				.setName(t("fields.remove.name"))
				.setDescription(t("fields.remove.description"))
				.addStringOption((option) =>
					option
						.setName(t("message_id.name"))
						.setDescription(t("message_id.description"))
						.setDescriptionLocalizations(cmdLn("message_id.description"))
						.setNameLocalizations(cmdLn("message_id.name"))
						.setRequired(true)
				)
				.addStringOption((option) =>
					option
						.setName(t("fields.name.name"))
						.setNameLocalizations(cmdLn("fields.name.name"))
						.setDescription(t("fields.name.description"))
						.setDescriptionLocalizations(cmdLn("fields.name.description"))
						.setRequired(true)
				)
		)
		.addSubcommand((sub) =>
			sub
				.setName(t("fields.add.name"))
				.setDescription(t("fields.add.description"))
				.setDescriptionLocalizations(cmdLn("fields.add.description"))
				.setNameLocalizations(cmdLn("fields.add.name"))
				.addStringOption((option) =>
					option
						.setName(t("message_id.name"))
						.setDescription(t("message_id.description"))
						.setDescriptionLocalizations(cmdLn("message_id.description"))
						.setNameLocalizations(cmdLn("message_id.name"))
						.setRequired(true)
				)
				.addStringOption((option) =>
					option
						.setName(t("fields.name.name"))
						.setNameLocalizations(cmdLn("fields.name.name"))
						.setDescription(t("fields.name.description"))
						.setDescriptionLocalizations(cmdLn("fields.name.description"))
						.setRequired(true)
				)
				.addStringOption((option) =>
					option
						.setName("field_name")
						.setDescription(t("field.name"))
						.setDescriptionLocalizations(cmdLn("field.name"))
						.setMaxLength(45)
						.setRequired(false)
				)
				.addStringOption((option) =>
					option
						.setName("field_description")
						.setDescription(t("field.description"))
						.setDescriptionLocalizations(cmdLn("field.description"))
						.setRequired(false)
				)
				.addStringOption((option) =>
					option
						.setName("field_type")
						.setDescription(t("field.type"))
						.setDescriptionLocalizations(cmdLn("field.type"))
						.setRequired(false)
						.addChoices(
							{
								name: t("field.short"),
								value: "short",
								// biome-ignore lint/style/useNamingConvention: <explanation>
								name_localizations: cmdLn("field.short"),
							},
							{
								name: t("field.paragraph"),
								value: "paragraph",
								// biome-ignore lint/style/useNamingConvention: <explanation>
								name_localizations: cmdLn("field.paragraph"),
							}
						)
				)
				.addBooleanOption((option) =>
					option
						.setName("field_required")
						.setDescription(t("field.required"))
						.setDescriptionLocalizations(cmdLn("field.required"))
						.setRequired(false)
				)
		)
		.addSubcommand((sub) =>
			sub
				.setName(t("fields.edit.name"))
				.setDescription(t("fields.edit.description"))
				.setDescriptionLocalizations(cmdLn("fields.edit.description"))
				.addStringOption((option) =>
					option
						.setName(t("message_id.name"))
						.setDescription(t("message_id.description"))
						.setDescriptionLocalizations(cmdLn("message_id.description"))
						.setNameLocalizations(cmdLn("message_id.name"))
						.setRequired(true)
				)
				.addStringOption((option) =>
					option
						.setName(t("fields.name.name"))
						.setNameLocalizations(cmdLn("fields.name.name"))
						.setDescription(t("fields.name.description"))
						.setDescriptionLocalizations(cmdLn("fields.name.description"))
						.setRequired(true)
				)
				.addStringOption((option) =>
					option
						.setName("field_name")
						.setDescription(t("field.name"))
						.setDescriptionLocalizations(cmdLn("field.name"))
						.setMaxLength(45)
						.setRequired(false)
				)
				.addStringOption((option) =>
					option
						.setName("field_description")
						.setDescription(t("field.description"))
						.setDescriptionLocalizations(cmdLn("field.description"))
						.setRequired(false)
				)
				.addStringOption((option) =>
					option
						.setName("field_type")
						.setDescription(t("field.type"))
						.setDescriptionLocalizations(cmdLn("field.type"))
						.setRequired(false)
						.addChoices(
							{
								name: t("field.short"),
								value: "short",
								name_localizations: cmdLn("field.short"),
							},
							{
								name: t("field.paragraph"),
								value: "paragraph",
								name_localizations: cmdLn("field.paragraph"),
							}
						)
				)
				.addBooleanOption((option) =>
					option
						.setName("field_required")
						.setDescription(t("field.required"))
						.setDescriptionLocalizations(cmdLn("field.required"))
						.setRequired(false)
				)
		),
	async execute(interaction: CommandInteraction) {
		if (!interaction.guildId) return;
		const options = interaction.options as CommandInteractionOptionResolver;
		const addSubcommand = options.getSubcommand(false);
		if (!addSubcommand) return;
		const field = options.getString("field_id", true);
		const messageId = options.getString("message_id", true);
		//download the previous template
		const template = await downloadJSONTemplate(messageId, interaction);
		if (!template) return;
		const { ticket, message } = template;
		const lang = ln(interaction.locale);
		switch (addSubcommand) {
			case "remove":
				if (template.ticket.fields.filter((f) => f.name === field).length === 0) {
					await interaction.reply({
						content: lang("error.field.notfound", { field }),
						flags: MessageFlags.Ephemeral,
					});
					return;
				}
				await removeFieldToTemplate(field, ticket, message);
				await interaction.reply({
					content: lang("edit.field.removed", { field }),
					flags: MessageFlags.Ephemeral,
				});

				break;
			case "add": {
				const fieldName = options.getString("field_name") ?? field;
				const fieldDescription = options.getString("field_description") ?? "";
				const fieldType: "short" | "paragraph" =
					(options.getString("field_type") as "short" | "paragraph") ?? "short";
				const fieldRequired = options.getBoolean("field_required") ?? false;
				if (template.ticket.fields.filter((f) => f.name === field).length !== 0) {
					await interaction.reply({
						content: lang("error.field.exist", { field }),
						flags: MessageFlags.Ephemeral,
					});
					return;
				}
				const repAdd = await addFieldToTemplate(
					{
						id: field,
						name: fieldName,
						description: fieldDescription,
						type: fieldType,
						required: fieldRequired,
					},
					ticket,
					message
				);
				if (repAdd) {
					await interaction.reply({
						content: lang("edit.field.added", { field }),
						flags: MessageFlags.Ephemeral,
					});
				} else {
					await interaction.reply({
						content: lang(".error.field.tooMuch"),
						flags: MessageFlags.Ephemeral,
					});
				}
				break;
			}
			case "edit": {
				const fieldName = options.getString("field_name") ?? field;
				const fieldDescriptionEdit = options.getString("field_description") ?? "";
				const fieldTypeEdit = options.getString("field_type") ?? "short";
				const fieldRequiredEdit = options.getBoolean("field_required") ?? false;
				const fieldToEdit = ticket.fields.find((f) => f.id === field);
				if (!fieldToEdit) {
					await interaction.reply({
						content: lang("error.field.notfound", { field }),
						flags: MessageFlags.Ephemeral,
					});
					return;
				}
				const reply = await editFieldToTemplate(
					{
						name: fieldName,
						id: field,
						description: fieldDescriptionEdit,
						type: fieldTypeEdit as "short" | "paragraph",
						required: fieldRequiredEdit,
					},
					ticket,
					message,
					fieldToEdit
				);
				if (reply) {
					await interaction.reply({
						content: lang("edit.field.edited", { field }),
						flags: MessageFlags.Ephemeral,
					});
					return;
				}
				break;
			}
		}
		return;
	},
};
