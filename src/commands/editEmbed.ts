import {
	ChannelType,
	type ColorResolvable,
	Colors,
	type CommandInteraction,
	type CommandInteractionOptionResolver,
	EmbedBuilder,
	MessageFlags,
	PermissionFlagsBits,
	SlashCommandBuilder,
	type TextChannel,
} from "discord.js";

import { cmdLn, ln } from "../locales";
import i18next from "../locales/init";
import { createEmbed } from "../tickets/modals";
import { downloadJSONTemplate, parseLinkFromDiscord } from "../tickets/template";

const t = i18next.getFixedT("en");

function toTitle(str: string) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

export const embedCommands = {
	data: new SlashCommandBuilder()
		.setName(t("embed.name"))
		.setNameLocalizations(cmdLn("embed.name"))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
		.setDescription(t("embed.description"))
		.setDescriptionLocalizations(cmdLn("embed.description"))
		.addSubcommand((subcommand) =>
			subcommand
				.setName(t("common.editLabel"))
				.setDescription(t("embed.edit.description"))
				.setDescriptionLocalizations(cmdLn("embed.edit.description"))
				.setNameLocalizations(cmdLn("common.editLabel"))
				.addStringOption((option) =>
					option
						.setName(t("messageId.title"))
						.setDescription(t("messageId.description"))
						.setDescriptionLocalizations(cmdLn("messageId.description"))
						.setNameLocalizations(cmdLn("messageId.title"))
						.setRequired(true)
				)
				.addChannelOption((option) =>
					option
						.setName(t("common.channel"))
						.setDescription(t("embed.edit.channel.description"))
						.setDescriptionLocalizations(cmdLn("embed.edit.channel.description"))
						.setNameLocalizations(cmdLn("common.channel"))
						.setRequired(false)
						.addChannelTypes(ChannelType.GuildText)
				)
				.addStringOption((option) =>
					option
						.setName(t("embed.title.title"))
						.setDescription(t("embed.title.description"))
						.setDescriptionLocalizations(cmdLn("embed.title.description"))
						.setNameLocalizations(cmdLn("embed.title.title"))
						.setRequired(false)
				)
				.addStringOption((option) =>
					option
						.setName(t("embed.content.title"))
						.setDescription(t("embed.content.description"))
						.setDescriptionLocalizations(cmdLn("embed.content.description"))
						.setNameLocalizations(cmdLn("embed.content.title"))
						.setRequired(false)
				)
				.addStringOption((option) =>
					option
						.setName(t("embed.edit.color.name"))
						.setDescription(t("embed.edit.color.description"))
						.setDescriptionLocalizations(cmdLn("embed.edit.color.description"))
						.setNameLocalizations(cmdLn("embed.edit.color.name"))
						.setRequired(false)
				)
				.addAttachmentOption((option) =>
					option
						.setName(t("embed.edit.thumbnail.name"))
						.setDescription(t("embed.edit.thumbnail.description"))
						.setRequired(false)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName(t("embed.resend.name"))
				.setDescription(t("embed.resend.description"))
				.setDescriptionLocalizations(cmdLn("embed.resend.description"))
				.setNameLocalizations(cmdLn("embed.resend.name"))
				.addChannelOption((option) =>
					option
						.setName(t("common.channel"))
						.setDescription(t("embed.resend.channel"))
						.setDescriptionLocalizations(cmdLn("embed.resend.channel"))
						.setNameLocalizations(cmdLn("common.channel"))
						.setRequired(true)
						.addChannelTypes(ChannelType.GuildText)
				)
				.addStringOption((option) =>
					option
						.setName(t("messageId.title"))
						.setDescription(t("messageId.description"))
						.setDescriptionLocalizations(cmdLn("messageId.description"))
						.setNameLocalizations(cmdLn("messageId.title"))
						.setRequired(true)
				)
				.addStringOption((option) =>
					option
						.setName(t("embed.title.title"))
						.setDescription(t("embed.title.description"))
						.setDescriptionLocalizations(cmdLn("embed.title.description"))
						.setNameLocalizations(cmdLn("embed.title.title"))
						.setRequired(true)
				)
				.addStringOption((option) =>
					option
						.setName(t("embed.content.title"))
						.setDescription(t("embed.content.description"))
						.setDescriptionLocalizations(cmdLn("embed.content.description"))
						.setNameLocalizations(cmdLn("embed.content.title"))
						.setRequired(true)
				)
		),

	async execute(interaction: CommandInteraction) {
		if (!interaction.guildId) return;
		const options = interaction.options as CommandInteractionOptionResolver;
		const subcommand = options.getSubcommand();
		if (subcommand === "edit") await editEmbed(options, interaction);
		else await resend(options, interaction);
	},
};

async function editEmbed(
	options: CommandInteractionOptionResolver,
	interaction: CommandInteraction
) {
	const messageId = options.getString("message_id", true);
	const { message, channel } = await parseLinkFromDiscord(messageId, interaction);

	//get the embed
	const ul = ln(interaction.locale);
	if (!channel || !channel.isTextBased()) {
		await interaction.reply({
			content: ul("error.textChannel"),
			flags: MessageFlags.Ephemeral,
		});
		return;
	}
	if (!message) {
		await interaction.reply({
			content: ul("error.notFound"),
			flags: MessageFlags.Ephemeral,
		});
		return;
	}
	const embeds = message.embeds?.[0];
	if (!embeds) {
		await interaction.reply({
			content: ul("embed.edit.error.noEmbed"),
			flags: MessageFlags.Ephemeral,
		});
		return;
	}
	const newColor = options.getString("color", false);
	let validColor = false;
	let color: string | number | number[] | null = newColor;
	if (newColor) {
		const colorName = Colors[toTitle(newColor) as keyof typeof Colors];
		// eslint-disable-next-line no-useless-escape
		const colorMatch = newColor.match(/[\[\(](\d) ?, ?(\d), ?(\d)[\]\)]/);
		if (newColor.startsWith("#")) {
			validColor = true;
		} else if (colorName) {
			color = colorName;
			validColor = true;
		} else if (colorMatch) {
			color = [
				Number.parseInt(colorMatch[1]),
				Number.parseInt(colorMatch[2]),
				Number.parseInt(colorMatch[3]),
			];
			validColor = true;
		} else if (!Number.isNaN(Number.parseInt(newColor, 16))) validColor = true;
	}
	if (!validColor && newColor) {
		await interaction.reply({
			content: ul("embed.edit.error.invalidColor"),
			flags: MessageFlags.Ephemeral,
		});
		return;
	}
	const newEmbed = EmbedBuilder.from(embeds);
	newEmbed
		.setColor((color as ColorResolvable) ?? embeds.color)
		.setTitle(options.getString("title", false) ?? embeds.title)
		.setDescription(options.getString("content", false) ?? embeds.description);
	if (options.getAttachment("thumbnail", false)) {
		newEmbed.setThumbnail(options.getAttachment("thumbnail", false)!.url);
	}
	if (options.getChannel("channel", false)) {
		const newChannel = options.getChannel("channel", false) as TextChannel;
		const newMessage = await newChannel.send({ embeds: [newEmbed] });
		await interaction.reply({
			content: ul("embed.edit.success.jump", {url: newMessage.url}),
			flags: MessageFlags.Ephemeral,
		});
		return;
	}
	await message.edit({ embeds: [newEmbed] });
	await interaction.reply({
		content: ul("embed.edit.success.simple"),
		flags: MessageFlags.Ephemeral,
	});
	return;
}

async function resend(
	options: CommandInteractionOptionResolver,
	interaction: CommandInteraction
) {
	const id = options.getString("message_id", true);
	const link = await parseLinkFromDiscord(id, interaction);
	const templateID = link.message?.id;
	const channel = link.channel;
	const ul = ln(interaction.locale);
	if (!channel || !channel.isTextBased()) {
		await interaction.reply({
			content: ul("error.textChannel"),
			flags: MessageFlags.Ephemeral,
		});
		return;
	}
	if (!templateID) {
		await interaction.reply({
			content: ul("error.notFound"),
			flags: MessageFlags.Ephemeral,
		});
		return;
	}

	const newChannel = options.getChannel("channel", true) as TextChannel;
	const template = await downloadJSONTemplate(templateID, interaction);
	if (!template) return;
	const { ticket, message } = template;
	const desc = options.getString(t("embed.content.title"), true);
	const title = options.getString(t("embed.title.title"), true);
	ticket.description = desc;
	ticket.name = title;
	ticket.channel = newChannel.id;
	const msg = await createEmbed(interaction, ticket, message.id, channel.id);
	if (!msg) {
		await interaction.reply({
			content: ul("embed.resend.error.notSend"),
			flags: MessageFlags.Ephemeral,
		});
		return;
	}
	await interaction.reply({
		content: ul("embed.edit.success.jump", {url: msg.url}),
		flags: MessageFlags.Ephemeral,
	});
	return;
}
