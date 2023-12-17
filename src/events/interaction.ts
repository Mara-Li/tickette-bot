import { BaseInteraction, Client } from "discord.js";

import { commandsList } from "../commands/index";
import { createModal, createThread, getTemplateByIds } from "../tickets/embeds";

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
				const embed = interaction.message.embeds[0];
				//footer is Ticket ID: <messageId>
				const messageInfo = embed.footer?.text?.split(" : ");
				//download the template
				if (!messageInfo || messageInfo?.length < 2) return;
				const ticket = await getTemplateByIds(messageInfo[1], messageInfo[0], interaction.guild!);
				if (!ticket) return;
				if (!interaction.guild || !interaction.channel) return;
				// create modal !
				if (ticket.fields.length === 0) {
					createThread(embed, interaction);
					return;
				}
				createModal(interaction, ticket);
			} catch (error) {
				console.log(error);
			}
		} else if (interaction.isModalSubmit()) {
			if (!interaction.guild || !interaction.channel) return;
			if (interaction.channel.isDMBased()) return;
			const embed = interaction.message?.embeds[0];
			if (!embed) return;
			await createThread(embed, interaction);
			return;
		}
	});
};