import { ChannelType, ColorResolvable, Colors, CommandInteraction, CommandInteractionOptionResolver, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, TextChannel } from "discord.js";

import { ln } from "../locales";
import en from "../locales/language/en";
import fr from "../locales/language/fr";
import { createEmbed } from "../tickets/modals";
import { downloadJSONTemplate } from "../tickets/template";

function toTitle(str : string) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

export const embedCommands = {
	data : new SlashCommandBuilder()
		.setName(en.embed.name)
		.setNameLocalizations({ fr: fr.embed.name })
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
		.setDescription(en.embed.description)
		.setDescriptionLocalizations({ fr: fr.embed.description })
		.addSubcommand(subcommand =>
			subcommand
				.setName(en.embed.edit.name)
				.setDescription(en.embed.edit.description)
				.setDescriptionLocalizations({ fr: fr.embed.edit.description })
				.setNameLocalizations({ fr: fr.embed.edit.name })
				.addStringOption(option =>
					option
						.setName(en.embed.edit.message_id.name)
						.setDescription(en.embed.edit.message_id.description)
						.setDescriptionLocalizations({ fr: fr.embed.edit.message_id.description })
						.setNameLocalizations({ fr: fr.embed.edit.message_id.name })
						.setRequired(true)
				)
				.addChannelOption(option =>
					option
						.setName(en.embed.edit.channel.name)
						.setDescription(en.embed.edit.channel.description)
						.setDescriptionLocalizations({ fr: fr.embed.edit.channel.description })
						.setNameLocalizations({ fr: fr.embed.edit.channel.name })
						.setRequired(false)
						.addChannelTypes(ChannelType.GuildText)
				)
				.addStringOption(option =>
					option
						.setName(en.embed.edit.content.name)
						.setDescription(en.embed.edit.content.description)
						.setDescriptionLocalizations({ fr: fr.embed.edit.content.description })
						.setNameLocalizations({ fr: fr.embed.edit.content.name })
						.setRequired(false)
				)
				.addStringOption(option =>
					option
						.setName(en.embed.edit.title.name)
						.setDescription(en.embed.edit.title.description)
						.setDescriptionLocalizations({ fr: fr.embed.edit.title.description })
						.setNameLocalizations({ fr: fr.embed.edit.title.name })
						.setRequired(false)
				)
				.addStringOption(option =>
					option
						.setName(en.embed.edit.color.name)
						.setDescription(en.embed.edit.color.description)
						.setDescriptionLocalizations({ fr: fr.embed.edit.color.description })
						.setNameLocalizations({ fr: fr.embed.edit.color.name })
						.setRequired(false)
				)
				.addAttachmentOption(option =>
					option
						.setName(en.embed.edit.thumbnail.name)
						.setDescription(en.embed.edit.thumbnail.description)
						.setRequired(false)
				)
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName(en.embed.resend.name)
				.setDescription(en.embed.resend.description)
				.addChannelOption(option =>
					option
						.setName(en.embed.edit.channel.name)
						.setDescription(en.embed.resend.description)
						.setRequired(true)
						.addChannelTypes(ChannelType.GuildText)
				)
				.addStringOption(option =>
					option
						.setName(en.message_id.name)
						.setDescription(en.message_id.description)
						.setDescriptionLocalizations({ fr: fr.message_id.description })
						.setNameLocalizations({ fr: fr.message_id.name })
						.setRequired(true)
				)
		),

	async execute(interaction: CommandInteraction) {
		if (!interaction.guildId) return;
		const options = interaction.options as CommandInteractionOptionResolver;
		const subcommand = options.getSubcommand();
		if (subcommand === "edit") await editEmbed(options, interaction);
		else resend(options, interaction);

	}
};

async function editEmbed(options: CommandInteractionOptionResolver, interaction: CommandInteraction) {
	const messageId = options.getString("message_id", true);
	//get the embed
	const lang = ln(interaction);
	const channel = interaction.channel;
	if (!channel || !(channel instanceof TextChannel)) {
		await interaction.reply({ content: lang.embed.edit.error.textChannel, ephemeral: true });
		return;
	}
	//force refresh cache
	await channel.messages.fetch();
	const message = await channel.messages.fetch(messageId);
	if (!message) {
		await interaction.reply({ content: lang.embed.edit.error.notFound, ephemeral: true });
		return;
	}
	const embeds = message.embeds?.[0];
	if (!embeds) {
		await interaction.reply({ content: lang.embed.edit.error.noEmbed, ephemeral: true });
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
			color = [parseInt(colorMatch[1]), parseInt(colorMatch[2]), parseInt(colorMatch[3])];
			validColor = true;
		} else if (!Number.isNaN(parseInt(newColor, 16))) validColor = true;
	}
	if (!validColor && newColor) {
		await interaction.reply({ content: lang.embed.edit.error.invalidColor, ephemeral: true });
		return;
	}
	const newEmbed = EmbedBuilder.from(embeds);
	newEmbed
		.setColor(color as ColorResolvable ?? embeds.color)
		.setTitle(options.getString("title", false) ?? embeds.title)
		.setDescription(options.getString("content", false) ?? embeds.description);
	if (options.getAttachment("thumbnail", false)) {
		newEmbed.setThumbnail(options.getAttachment("thumbnail", false)!.url);
	}
	if (options.getChannel("channel", false)) {
		const newChannel = options.getChannel("channel", false) as TextChannel;
		const newMessage = await newChannel.send({ embeds: [newEmbed] });
		await interaction.reply({ content: lang.embed.edit.success.jump.replace("{{url}}", newMessage.url), ephemeral: true });
		return;
	}
	await message.edit({ embeds: [newEmbed] });
	await interaction.reply({ content: lang.embed.edit.success.simple, ephemeral: true });
	return;
}

async function resend(options: CommandInteractionOptionResolver, interaction: CommandInteraction) {
	const templateID = options.getString("message_id", true);
	const channel = interaction.channel;
	if (!channel || !(channel instanceof TextChannel)) {
		await interaction.reply({ content: ln(interaction).embed.resend.error.textChannel, ephemeral: true });
		return;
	}
	//force refresh cache
	await channel.messages.fetch();
	if (!await channel.messages.fetch(templateID)) {
		await interaction.reply({ content: ln(interaction).embed.resend.error.notFound, ephemeral: true });
		return;
	}

	const newChannel = options.getChannel("channel", true) as TextChannel;
	const template = await downloadJSONTemplate(templateID, interaction);
	if (!template) return;
	const { ticket, message } = template;
	ticket.channel = newChannel.id;
	const msg = await createEmbed(interaction, ticket, message.id, channel.id);
	if (!msg) {
		await interaction.reply({ content: ln(interaction).embed.resend.error.notSend, ephemeral: true });
		return;
	}
	await interaction.reply({ content: ln(interaction).embed.edit.success.jump.replace("{{url}}", msg.url), ephemeral: true });
	return;

}