import { BaseInteraction, Client, TextChannel } from "discord.js";
import moment from "moment";

import { commandsList } from "../commands/index";
import { createModal, getTemplateByIds } from "../tickets/embeds";

export default (client: Client): void => {
	client.on("interactionCreate", async (interaction: BaseInteraction) => {
		if (interaction.isCommand()) {
			const command = commandsList.find(
				(cmd) => cmd.data.name === interaction.commandName
			);
			if (!command) return;
			try {
				await command.execute(interaction);
			} catch (error) {
				console.log(error);
			}
		} else if (interaction.isButton() && interaction.customId === "createTicket") {
			try {
				createModal(interaction);
			} catch (error) {
				console.log(error);
			}
		} else if (interaction.isModalSubmit()) {
			if (!interaction.guild || !interaction.channel) return;
			if (interaction.channel.isDMBased()) return;
			const fields = interaction.fields.fields;
			const channelToCreateThread = interaction.channel;
			//get embed that create the modal
			const embed = interaction.message?.embeds[0];
			const footer = embed?.footer?.text?.split(" : ");
			if (!footer || footer.length < 2) {
				await interaction.reply({
					content: "Error: Footer not found",
					ephemeral: true,
				});
				return;
			}
			const template = await getTemplateByIds(footer[0], footer[1], interaction.guild);
			if (!template) {
				await interaction.reply({
					content: "Error: Template not found",
					ephemeral: true,
				});
				return;
			}
			const threadName = template.threadName || "Ticket";
			//replace the threadName {{value}}
			let newThreadName = threadName?.replace(
				/{{([^{}]*)}}/g,
				(match, p1) => {
					return fields.find((field) => field.customId === p1)?.value || "";
				}
			);
			const DEFAULT_TEMPLATE_VALUE: {
				date: string;
				time: string;
				user_id: string;
				nickname: string;
			} = {
				"date": moment().format("YYYY-MM-DD"),
				"time": moment().format("HH:mm"),
				"user_id": interaction.user.id,
				"nickname": interaction.user.displayName,
			};
			newThreadName = newThreadName?.replace(
				/{{([^{}]*)}}/g,
				(match, p1) => {
					return DEFAULT_TEMPLATE_VALUE[p1 as keyof typeof DEFAULT_TEMPLATE_VALUE] || "";
				}
			);

			//create the thread
			const thread = await (channelToCreateThread as TextChannel).threads.create({
				name: newThreadName || "Ticket",
				autoArchiveDuration: 1440,
				reason: `Ticket created by ${interaction.user.displayName}`,
				invitable: false,
			});
			await interaction.reply({
				content: "Ticket created !",
				ephemeral: true,
			});
			//add the user to the thread
			await thread.members.add(interaction.user.id);
			//add role to the thread


			const roles = template.roles;
			for (const role of roles) {
				await thread.members.add(role);
			}
			return;
		}
	});
};