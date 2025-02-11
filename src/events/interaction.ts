import type { BaseInteraction, Client } from "discord.js";

import { commandsList } from "../commands";
import { ln } from "../locales";
import en from "../locales/language/en.json";
import fr from "../locales/language/fr.json";
import { createModal, createThread, getTemplateByIds } from "../tickets/modals";

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
				const ticket = await getTemplateByIds(
					messageInfo[1],
					messageInfo[0],
					interaction.guild!
				);
				const lg = ln(interaction);

				if (!ticket) {
					//delete embed
					await interaction.message.delete();
					await interaction.reply({
						content: `${lg.error.attachment}\n${lg.error.administrator}`,
						ephemeral: true,
					});
					return;
				}
				if (!interaction.guild || !interaction.channel) return;
				// create modal !
				if (ticket.fields.length === 0) {
					await createThread(embed, interaction);
					return;
				}
				await createModal(interaction, ticket);
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
