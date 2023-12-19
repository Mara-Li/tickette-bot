import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ChannelType, CommandInteraction, Embed, EmbedBuilder, Guild, ModalActionRowComponentBuilder, ModalBuilder, ModalSubmitInteraction, TextChannel, TextInputBuilder, TextInputStyle } from "discord.js";
import moment from "moment";

import { DEFAULT_TEMPLATE_VALUE, Ticket } from "../interface";
import { ln } from "../locales";

export async function createEmbed(interaction: CommandInteraction, ticket: Ticket, messageId: string, channelId: string) {
	const lg = ln(interaction);
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
		.setLabel(`📝 ${lg.modal.button}`)
		.setStyle(ButtonStyle.Primary);

	await channel.send({
		embeds: [embed],
		components: [new ActionRowBuilder<ButtonBuilder>().addComponents(createTicket)],
	});
}

export async function getTemplateByIds(messageId: string, channelId: string, guild: Guild) {
	//download the template
	await guild.channels.fetch();
	const channel = await guild.channels.fetch(channelId);
	if (!channel || !(channel instanceof TextChannel)) return;
	//force refresh cache
	await channel.messages.fetch();
	const message = await channel.messages.fetch(messageId);
	if (!message) return;
	//download the template
	const attachment = message.attachments.first();
	if (!attachment) return;

	const response = await fetch(attachment.url);
	return await response.json() as Ticket;
}

export async function createModal(command: ButtonInteraction, ticket: Ticket) {
	//get the template using the embed message id

	const modal = new ModalBuilder()
		.setCustomId("ticket")
		.setTitle(ln(command).modal.ticket);

	for (const field of ticket.fields) {
		const inputStyle = field.type === "short" ? TextInputStyle.Short : TextInputStyle.Paragraph;
		const input = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
			new TextInputBuilder()
				.setPlaceholder(field.description)
				.setCustomId(field.id)
				.setLabel(field.name)
				.setRequired(field.required)
				.setStyle(inputStyle)
		);
		modal.addComponents(input);
	}
	await command.showModal(modal);

}

export async function createThread(embed: Embed, interaction: ModalSubmitInteraction | ButtonInteraction) {
	const lg = ln(interaction);
	const footer = embed?.footer?.text?.split(" : ");
	if (!footer || footer.length < 2) {
		await interaction.reply({
			content: lg.error.footer,
			ephemeral: true,
		});
		return;
	}
	const template = await getTemplateByIds(footer[1], footer[0], interaction.guild as Guild);
	if (!template) {
		await interaction.reply({
			content: lg.error.attachment,
			ephemeral: true,
		});
		return;
	}
	const threadName = template.threadName || "Ticket";
	let newThreadName = threadName;
	if (interaction.isModalSubmit()) {
		const fields = interaction.fields.fields;
		//replace the threadName {{value}}

		newThreadName = threadName?.replace(
			/{{([^{}]*)}}/g,
			(match, p1 : string) => {
				const field = fields.find((field) => field.customId.toLowerCase() === p1.toLowerCase());
				if (field) {
					//find the type in template
					const type = template.fields.find((f) => f.id === field.customId)?.type;
					if (type === "paragraph") return field.value.slice(0, 11);
					return field.value;
				}
				return match;
			}
		);
	}

	const TEMPLATE_VALUE = DEFAULT_TEMPLATE_VALUE(
		moment().format("DD/MM/YYYY"),
		moment().format("HH:mm"),
		interaction
	);

	newThreadName = newThreadName.replace(
		/{{([^{}]*)}}/g,
		(match, p1: string) => {
			return TEMPLATE_VALUE[p1.toLowerCase() as keyof typeof TEMPLATE_VALUE] || match;
		}
	);
	const channelToCreateThread = interaction.channel as TextChannel;
	//create the thread
	const thread = await channelToCreateThread.threads.create({
		name: newThreadName || "Ticket",
		reason: lg.reason.replace("{{nickname}}", interaction.user.username),
		type: ChannelType.PrivateThread,
		invitable: false,
	});
	await interaction.reply({
		content: lg.created,
		ephemeral: true,
	});
	//add the user to the thread
	await thread.members.add(interaction.user.id);
	//add role to the thread
	const roles = template.roles;
	const msg = await thread.send({
		content: "_ _",
	});
	const allRoleMention = roles.map((role) => `<@&${role}>`).join(" ");
	await msg.edit({
		content: allRoleMention,
	});
	await msg.delete();
	//delete the last message in the channel
	const lastMessage = thread.lastMessage;
	if (lastMessage) {
		await lastMessage.delete();
	}
	if (interaction.isModalSubmit()) {
		//delete the message
		const fields = interaction.fields.fields;
		//embed
		const embed = new EmbedBuilder()
			.setTitle(ln(interaction).modal.ticket)
			.setDescription(ln(interaction).modal.description.replace("{{user}}", interaction.user.displayName))
			.setAuthor({
				name: interaction.user.username,
				iconURL: interaction.user.displayAvatarURL(),
			})
			.setColor(0x2f3136)
			.setTimestamp();
		for (const field of fields.values()) {
			const name = template.fields.find((f) => f.id === field.customId)?.name;
			embed.addFields({
				name: name || field.customId,
				value: field.value,
				inline: true,
			});
		}
		await thread.send({
			embeds: [embed],
		});
	}


}
