import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, CommandInteraction, Guild, ModalActionRowComponentBuilder, ModalBuilder, TextChannel, TextInputBuilder, TextInputStyle } from "discord.js";
import { Ticket } from "src/interface";

export async function createEmbed(interaction: CommandInteraction, ticket: Ticket, messageId: string, channelId: string) {
	const channel = interaction.guild?.channels.cache.get(ticket.channel);
	if (!channel || !(channel instanceof TextChannel)) return;
	const embed = {
		title: ticket.name,
		description: ticket.ticketMessage,
		color: 0x2f3136,
		footer: {
			text: `${channelId} : ${messageId}`,
		},
	};
	//add button to create ticket
	const createTicket = new ButtonBuilder()
		.setCustomId("createTicket")
		.setLabel("Create ticket")
		.setStyle(ButtonStyle.Primary);

	await channel.send({
		embeds: [embed],
		components: [new ActionRowBuilder<ButtonBuilder>().addComponents(createTicket)],
	});
}

export async function getTemplateByIds(messageId: string, channelId: string, guild: Guild) {
	//download the template
	const channel = await guild.channels.fetch(channelId);
	if (!channel || !(channel instanceof TextChannel)) return;
	const message = await channel.messages.fetch(messageId);
	if (!message) return;
	//download the template
	const attachment = message.attachments.first();
	if (!attachment) return;

	const response = await fetch(attachment.url);
	return await response.json() as Ticket;
}

export async function createModal(command: ButtonInteraction) {
	//get the template using the embed message id
	const embed = command.message.embeds[0];
	//footer is Ticket ID: <messageId>
	const messageInfo = embed.footer?.text?.split(" : ");
	//download the template
	if (!messageInfo ||messageInfo?.length < 2) return;
	const ticket = await getTemplateByIds(messageInfo[1], messageInfo[0], command.guild!);
	if (!ticket) return;
	// create modal !
	const modal = new ModalBuilder()
		.setCustomId("ticket")
		.setTitle("New ticket");
	for (const field of ticket.fields) {
		const inputStyle = field.type === "short" ? TextInputStyle.Short : TextInputStyle.Paragraph;
		const input = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
			new TextInputBuilder()
				.setPlaceholder(field.description)
				.setCustomId(field.name)
				.setLabel(field.name)
				.setRequired(field.required)
				.setStyle(inputStyle)
		);
		modal.addComponents(input);
	}
	await command.showModal(modal);

}