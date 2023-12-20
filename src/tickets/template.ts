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
import { CommandInteraction, GuildBasedChannel, TextBasedChannel, TextChannel } from "discord.js";
import fs from "fs";

import { ParseLink, Ticket } from "../interface";
import { ln } from "../locales";

export function createFile(template: Ticket, serverID: string, channelID: string) {
	const cloneTemplate = JSON.parse(JSON.stringify(template));
	delete cloneTemplate.channel;
	delete cloneTemplate.name;
	delete cloneTemplate.description;
	const tmpFileContent = JSON.stringify(cloneTemplate, null, 2);
	if (fs.existsSync(`tickets/${serverID}/${channelID}.json`)) {
		fs.rmSync(`tickets/${serverID}/${channelID}.json`);
	}
	fs.mkdirSync(`tickets/${serverID}`, { recursive: true });
	fs.writeFile(`tickets/${serverID}/${channelID}.json`, tmpFileContent, (err) => {
		if (err) {
			console.error(err);
		}
	}
	);
}

export function deleteFile(serverID: string, channelID: string) {
	fs.rmSync(`tickets/${serverID}/${channelID}.json`);
	if (fs.readdirSync(`tickets/${serverID}`).length === 0) {
		fs.rmdirSync(`tickets/${serverID}`);
	}
}

export async function createJSONTemplate(
	template: Ticket,
	serverID: string,
	channelID: string,
	interaction: CommandInteraction
) {
	createFile(template, serverID, channelID);
	const message_id = await interaction.reply({
		content: `__Template__ : ${template.name}`,
		files: [`tickets/${serverID}/${channelID}.json`]
	});
	deleteFile(serverID, channelID);
	return message_id.id;
}

async function fetchMessage(messageID: string, interaction: CommandInteraction, channelID: string | undefined) {
	await interaction.guild?.channels.fetch();
	if (!channelID)
		return {
			channel: undefined,
			message: undefined
		};
	let channel: GuildBasedChannel | null | undefined | TextBasedChannel = await interaction.guild?.channels.fetch(channelID) as TextChannel;
	//force fetch message cache
	if (!channel)
		channel = interaction.channel;
	if (!channel || !(channel instanceof TextChannel)) {
		return {
			channel: undefined,
			message: undefined
		};
	}
	await channel.messages.fetch();
	return {
		message: await channel.messages.fetch(messageID),
		channel
	};

}

export async function parseLinkFromDiscord(link: string, interaction: CommandInteraction):Promise<ParseLink> {
	const regex = /https:\/\/(.*)discord.com\/channels\/(\d+)\/(\d+)\/(\d+)/;
	const match = regex.exec(link);
	if (!match) {
		return {
			guild: interaction.guild?.id as string,
			channel: interaction.channel as TextChannel,
			message: (await fetchMessage(link, interaction, interaction.channel?.id)).message
		} as ParseLink;
	}
	console.log(match);
	//force fetch cache
	const { message, channel } = await fetchMessage(match[4], interaction, match[3]);
	if (!message) {
		await interaction.reply({
			content: ln(interaction).error.channel,
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
	const {message} = await parseLinkFromDiscord(messageID, interaction);
	if (!message) {
		await interaction.reply({
			content: ln(interaction).error.channel,
		});
		return;
	}
	//fetch the message
	const attachment = message.attachments.first();
	if (!attachment) {
		await interaction.reply({
			content: ln(interaction).error.attachment,
		});
		return;
	}
	const response = await fetch(attachment.url);
	return {
		ticket : await response.json() as Ticket,
		message
	};
}



