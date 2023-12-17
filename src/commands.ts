import {
	CommandInteraction,
	CommandInteractionOptionResolver,
	SlashCommandBuilder,
	SlashCommandSubcommandBuilder,
	SlashCommandSubcommandGroupBuilder
} from "discord.js";
import { TemplateModals } from "./interface";
import { createJSONTemplate, downloadJSONTemplate } from "./tickets/template";
import { addRoleToTemplate, removeRoleToTemplate } from "./tickets/editRole";
import { ln } from "./locales";

/**
 * Tickets commands :
 * /config new <template name for thread name> <@role> (optional field) // The template is saved as an json in the channel used for ticket creation ; template is pinned
 * /config role <ID_message_template> [choice: Add | remove | clean] <@role> // edit the role of the template
 * /config field <ID_message_template> [choice: Add | remove | clean] <field name> <field description> <field type> <required> // edit the field of the template
 * /create <ID_Message_Template> //create a ticket menu in the channel used for the command
 * /close
 */

const field = (data: SlashCommandSubcommandBuilder, nb: number) => {
	return data
		.addStringOption(option =>
			option
				.setName(`field_${nb}_name`)
				.setDescription("The name of the field")
				.setRequired(false))
		.addStringOption(option =>
			option
				.setName(`field_${nb}_description`)
				.setDescription("The description of the field")
				.setRequired(false))
		.addStringOption(option =>
			option
				.setName(`field_${nb}_type`)
				.setDescription("The type of the field")
				.setRequired(false)
				.addChoices(
					{name: "short", value: "short"},
					{name: "paragraph", value: "paragraph"}
			))
		.addBooleanOption(option =>
			option
				.setName(`field_${nb}_required`)
				.setDescription("The field is required during ticket creation modal")
				.setRequired(false)
		);
}


export const config = {
	data: new SlashCommandBuilder()
		.setName("config")
		.setDescription("Ticket configuration")
		.addSubcommand((group => {
			let grp = group
				.setName("new")
				.setDescription("Create a new template")
				.addStringOption(option =>
					option
						.setName("name")
						.setDescription("The name of the created ticket")
						.setRequired(true)
				)
				.addRoleOption(option =>
					option
						.setName("role")
						.setDescription("The role of people that need to be added to the ticket")
						.setRequired(true)
				)

			//add the five duplicate field using field function
			for (let i = 1; i < 5; i++) {
				grp = field(grp, i);
			}
			return grp;
		})
		)
		.addSubcommand(group =>
			group
				.setName("role")
				.setDescription("Edit the role of the template")
				.addStringOption(option =>
					option
						.setName("message_id")
						.setDescription("The message ID of the template")
						.setRequired(true)
				)
				.addStringOption(option =>
					option
						.setName("choice")
						.setDescription("The choice to edit the role")
						.setRequired(true)
						.addChoices(
							{name: "Add", value: "add"},
							{name: "Remove", value: "remove"},
						)
				)
				.addRoleOption(option =>
					option
						.setName("role")
						.setDescription("The role to add or remove")
						.setRequired(true)
				)
	),
	async execute(interaction: CommandInteraction) {
		if (!interaction.guildId) return;
		const options = interaction.options as CommandInteractionOptionResolver;
		const subcommand = options.getSubcommand();
		if (subcommand === "new") {
			const name = options.getString("name", true);
			const role = [options.getRole("role", true).id];
			const fields = [];
			for (let i = 1; i < 5; i++) {
				const field_name = options.getString(`field_${i}_name`);
				const field_description = options.getString(`field_${i}_description`) ?? "";
				const field_type = options.getString(`field_${i}_type`) ?? "short";
				const field_required = options.getBoolean(`field_${i}_required`) ?? false;
				if (field_name) {
					fields.push({name: field_name, description: field_description, type: field_type, required: field_required} as TemplateModals);
				}
				await createJSONTemplate(name, role, fields, interaction.guildId!, interaction.channelId, interaction);
				return;
			}
		} else if (subcommand === "role") {
			const message_id = options.getString("message_id", true);
			const choice = options.getString("choice", true) as "add" | "remove";
			//download the previous template
			const template = await downloadJSONTemplate(message_id, interaction)
			if (!template) return;
			const {ticket, message} = template;
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
		return;
	}
}


export const commandsList = [config];