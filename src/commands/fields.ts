import {
	CommandInteraction,
	CommandInteractionOptionResolver,
	PermissionFlagsBits,
	SlashCommandBuilder,
} from "discord.js";

import { ln } from "../locales";
import en from "../locales/language/en";
import fr from "../locales/language/fr";
import { addFieldToTemplate, editFieldToTemplate, removeFieldToTemplate } from "../tickets/fields";
import { downloadJSONTemplate } from "../tickets/template";
/**
 * Tickets commands :
 * /config new <template name for thread name> <@role> (optional field) // The template is saved as an json in the channel used for ticket creation ; template is pinned
 * /config role <ID_message_template> [choice: Add | remove | clean] <@role> // edit the role of the template
 * /config field <ID_message_template> [choice: Add | remove | edit] <field name> <field description> <field type> <required> // edit the field of the template
 * /create <ID_Message_Template> //create a ticket menu in the channel used for the command
 * /close
 */


export const fields = {
	data: new SlashCommandBuilder()
		.setName(en.fields.title)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
		.setDescription(en.fields.description)
		.setNameLocalizations({
			fr: fr.fields.title
		})
		.setDescriptionLocalizations({
			fr: fr.fields.description
		})
		.addSubcommand(sub =>
			sub
				.setName(en.fields.remove.name)
				.setDescription(en.fields.remove.description)
				.addStringOption(option =>
					option
						.setName(en.message_id.name)
						.setDescription(en.message_id.description)
						.setDescriptionLocalizations({
							fr: fr.message_id.description
						})
						.setNameLocalizations({
							fr: fr.message_id.name
						})
						.setRequired(true)
				)
				.addStringOption(option =>
					option
						.setName(en.fields.name.name)
						.setNameLocalizations({
							fr: fr.fields.name.name
						})
						.setDescription(en.fields.name.description)
						.setDescriptionLocalizations({
							fr: fr.fields.name.description
						})
						.setRequired(true)
				)
		)
		.addSubcommand(sub =>
			sub
				.setName(en.fields.add.name)
				.setDescription(en.fields.add.description)
				.setDescriptionLocalizations({
					fr: fr.fields.add.description
				})
				.setNameLocalizations({
					fr: fr.fields.add.name
				})
				.addStringOption(option =>
					option
						.setName(en.message_id.name)
						.setDescription(en.message_id.description)
						.setDescriptionLocalizations({
							fr: fr.message_id.description
						})
						.setNameLocalizations({
							fr: fr.message_id.name
						})
						.setRequired(true)
				)
				.addStringOption(option =>
					option
						.setName(en.fields.name.name)
						.setNameLocalizations({
							fr: fr.fields.name.name
						})
						.setDescription(en.fields.name.description)
						.setDescriptionLocalizations({
							fr: fr.fields.name.description
						})
						.setRequired(true)
				)
				.addStringOption(option =>
					option
						.setName("field_name")
						.setDescription(en.field.name)
						.setDescriptionLocalizations({
							fr: fr.field.name
						})
						.setMaxLength(45)
						.setRequired(false))
				.addStringOption(option =>
					option
						.setName("field_description")
						.setDescription(en.field.description)
						.setDescriptionLocalizations({
							fr: fr.field.description
						})
						.setRequired(false)
				)
				.addStringOption(option =>
					option
						.setName("field_type")
						.setDescription(en.field.type)
						.setDescriptionLocalizations({
							fr: fr.field.type
						})
						.setRequired(false)
						.addChoices(
							{name: en.field.short, value: "short", name_localizations: {fr: fr.field.short}},
							{name: en.field.paragraph, value: "paragraph", name_localizations: {fr: fr.field.paragraph}}
						))
				.addBooleanOption(option =>
					option
						.setName("field_required")
						.setDescription(en.field.required)
						.setDescriptionLocalizations({
							fr: fr.field.required
						})
						.setRequired(false)
				)
		)
		.addSubcommand(sub =>
			sub
				.setName(en.fields.edit.name)
				.setDescription(en.fields.edit.description)
				.setDescriptionLocalizations({
					fr: fr.fields.edit.description
				})
				.addStringOption(option =>
					option
						.setName(en.message_id.name)
						.setDescription(en.message_id.description)
						.setDescriptionLocalizations({
							fr: fr.message_id.description
						})
						.setNameLocalizations({
							fr: fr.message_id.name
						})
						.setRequired(true)
				)
				.addStringOption(option =>
					option
						.setName(en.fields.name.name)
						.setNameLocalizations({
							fr: fr.fields.name.name
						})
						.setDescription(en.fields.name.description)
						.setDescriptionLocalizations({
							fr: fr.fields.name.description
						})
						.setRequired(true)
				)
				.addStringOption(option =>
					option
						.setName("field_name")
						.setDescription(en.field.name)
						.setDescriptionLocalizations({
							fr: fr.field.name
						})
						.setMaxLength(45)
						.setRequired(false))
				.addStringOption(option =>
					option
						.setName("field_description")
						.setDescription(en.field.description)
						.setDescriptionLocalizations({
							fr: fr.field.description
						})
						.setRequired(false)
				)
				.addStringOption(option =>
					option
						.setName("field_type")
						.setDescription(en.field.type)
						.setDescriptionLocalizations({
							fr: fr.field.type
						})
						.setRequired(false)
						.addChoices(
							{ name: en.field.short, value: "short", name_localizations: { fr: fr.field.short } },
							{ name: en.field.paragraph, value: "paragraph", name_localizations: { fr: fr.field.paragraph } }
						))
				.addBooleanOption(option =>
					option
						.setName("field_required")
						.setDescription(en.field.required)
						.setDescriptionLocalizations({
							fr: fr.field.required
						})
						.setRequired(false)
				)
		),
	async execute(interaction: CommandInteraction) {
		if (!interaction.guildId) return;
		const options = interaction.options as CommandInteractionOptionResolver;
		const addSubcommand = options.getSubcommand(false);
		if (!addSubcommand) return;
		const field = options.getString("field_id", true);
		const message_id = options.getString("message_id", true);
		//download the previous template
		const template = await downloadJSONTemplate(message_id, interaction);
		if (!template) return;
		const {ticket, message} = template;
		switch (addSubcommand) {
		case "remove":
			if (template.ticket.fields.filter(f => f.name === field).length === 0) {
				await interaction.reply({
					content: ln(interaction).error.field.notfound.replace("{{field}}", field),
					ephemeral: true
				});
				return;
			}
			await removeFieldToTemplate(field, ticket, message);
			await interaction.reply({
				content: ln(interaction).edit.field.removed.replace("{{field}}", field),
				ephemeral: true
			});

			break;
		case "add":
			const fieldName = options.getString("field_name") ?? field;
			const fieldDescription = options.getString("field_description") ?? "";
			const fieldType: "short" | "paragraph" = options.getString("field_type") as "short" | "paragraph" ?? "short";
			const fieldRequired = options.getBoolean("field_required") ?? false;
			if (template.ticket.fields.filter(f => f.name === field).length !== 0) {
				await interaction.reply({
					content: ln(interaction).error.field.exist.replace("{{field}}", field),
					ephemeral: true
				});
				return;
			}
			const repAdd = await addFieldToTemplate({
				id: field,
				name: fieldName,
				description: fieldDescription,
				type: fieldType,
				required: fieldRequired
			},
			ticket, message);
			if (repAdd) {
				await interaction.reply({
					content: ln(interaction).edit.field.added.replace("{{field}}", field),
					ephemeral: true
				});
			} else {
				await interaction.reply({
					content: ln(interaction).error.field.tooMuch,
					ephemeral: true
				});
			}
			break;
		case "edit":
			const field_name = options.getString("field_name") ?? field;
			const field_description_edit = options.getString("field_description") ?? "";
			const field_type_edit = options.getString("field_type") ?? "short";
			const field_required_edit = options.getBoolean("field_required") ?? false;
			const fieldToEdit = ticket.fields.find(f => f.id === field);
			if (!fieldToEdit) {
				await interaction.reply({
					content: ln(interaction).error.field.notfound.replace("{{field}}", field),
					ephemeral: true
				});
				return;
			}
			const reply = await editFieldToTemplate({
				name: field_name,
				id: field,
				description: field_description_edit,
				type: field_type_edit as "short" | "paragraph",
				required: field_required_edit
			},
			ticket, message, fieldToEdit);
			if (reply) {
				await interaction.reply({
					content: ln(interaction).edit.field.edited.replace("{{field}}", field),
					ephemeral: true
				});
				return;
			}
			break;
		}
		return;
	}
};


