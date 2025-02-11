/**
 * @module tickets/template
 * @desc Allow to create and save a template for ticket creation
 * The template is created using the command : /ticket config <channelSaved> <thread>
 * The ticket is saved as an embed, so no database is used
 * Limitation:
 * - No more than 5 fields
 * - Only short fields are used
 * Field form: Template[]
 *
 */
import {
	type CommandInteraction,
	type GuildBasedChannel,
	type TextBasedChannel,
	TextChannel,
} from "discord.js";

import type { ParseLink, Ticket } from "../interface";
import { ln } from "../locales";

export function createFile(template: Ticket) {
	const cloneTemplate = JSON.parse(JSON.stringify(template));
	// biome-ignore lint/performance/noDelete: <explanation>
	delete cloneTemplate.channel;
	// biome-ignore lint/performance/noDelete: <explanation>
	delete cloneTemplate.name;
	// biome-ignore lint/performance/noDelete: <explanation>
	delete cloneTemplate.description;
	return [
		{
			attachment: Buffer.from(JSON.stringify(cloneTemplate, null, 2)),
			name: "ticket.json",
		},
	];
}

export async function createJSONTemplate(
	template: Ticket,
	interaction: CommandInteraction
) {
	const messageId = await interaction.reply({
		content: `__Template__ : ${template.name}`,
		files: createFile(template),
	});

	return messageId.id;
}

async function fetchMessage(
	messageID: string,
	interaction: CommandInteraction,
	channelID: string | undefined
) {
	await interaction.guild?.channels.fetch();
	if (!channelID)
		return {
			channel: undefined,
			message: undefined,
		};
	let channel: GuildBasedChannel | null | undefined | TextBasedChannel =
		(await interaction.guild?.channels.fetch(channelID)) as TextChannel;
	//force fetch message cache
	if (!channel) channel = interaction.channel;
	// noinspection SuspiciousTypeOfGuard
	if (!channel || !(channel instanceof TextChannel)) {
		return {
			channel: undefined,
			message: undefined,
		};
	}
	await channel.messages.fetch();
	try {
		const message = await channel.messages.fetch(messageID);
		if (!message) {
			return {
				channel,
				message: undefined,
			};
		}
		return {
			message,
			channel,
		};
	} catch (error) {
		return {
			channel,
			message: undefined,
		};
	}
}

export async function parseLinkFromDiscord(
	link: string,
	interaction: CommandInteraction
): Promise<ParseLink> {
	const regex = /https:\/\/(.*)discord.com\/channels\/(\d+)\/(\d+)\/(\d+)/;
	const match = regex.exec(link);
	if (!match) {
		return {
			guild: interaction.guild?.id as string,
			channel: interaction.channel as TextChannel,
			message: (await fetchMessage(link, interaction, interaction.channel?.id)).message,
		} as ParseLink;
	}
	//force fetch cache
	const { message, channel } = await fetchMessage(match[4], interaction, match[3]);
	const lang = ln(interaction.locale);
	if (!message) {
		await interaction.reply({
			content: lang("error.channel"),
		});
		return {
			guild: match[2],
		};
	}
	return {
		guild: match[2],
		channel,
		message,
	};
}

export async function downloadJSONTemplate(
	messageID: string,
	interaction: CommandInteraction
) {
	//search the message
	const { message } = await parseLinkFromDiscord(messageID, interaction);
	const lg = ln(interaction.locale);
	if (!message) {
		await interaction.reply({
			content: lg("error.channel"),
		});
		return;
	}
	//fetch the message
	const attachment = message.attachments.first();
	if (!attachment) {
		await interaction.reply({
			content: lg("error.attachment"),
		});
		return;
	}
	const response = await fetch(attachment.url);
	return {
		ticket: (await response.json()) as Ticket,
		message,
	};
}
