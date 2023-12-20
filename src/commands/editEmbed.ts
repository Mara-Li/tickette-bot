import { ChannelType, ColorResolvable, Colors, CommandInteraction, CommandInteractionOptionResolver, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, TextChannel } from "discord.js";

import { ln } from "../locales";
import en from "../locales/language/en";
import fr from "../locales/language/fr";

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
		.addStringOption(option =>
			option
				.setName(en.embed.message_id.name)
				.setDescription(en.embed.message_id.description)
				.setDescriptionLocalizations({ fr: fr.embed.message_id.description })
				.setNameLocalizations({ fr: fr.embed.message_id.name })
				.setRequired(true)
		)
		.addChannelOption(option =>
			option
				.setName(en.embed.channel.name)
				.setDescription(en.embed.channel.description)
				.setDescriptionLocalizations({ fr: fr.embed.channel.description })
				.setNameLocalizations({ fr: fr.embed.channel.name })
				.setRequired(false)
				.addChannelTypes(ChannelType.GuildText)
		)
		.addStringOption(option =>
			option
				.setName(en.embed.content.name)
				.setDescription(en.embed.content.description)
				.setDescriptionLocalizations({ fr: fr.embed.content.description })
				.setNameLocalizations({ fr: fr.embed.content.name })
				.setRequired(false)
		)
		.addStringOption(option =>
			option
				.setName(en.embed.title.name)
				.setDescription(en.embed.title.description)
				.setDescriptionLocalizations({ fr: fr.embed.title.description })
				.setNameLocalizations({ fr: fr.embed.title.name })
				.setRequired(false)
		)
		.addStringOption(option =>
			option
				.setName(en.embed.color.name)
				.setDescription(en.embed.color.description)
				.setDescriptionLocalizations({ fr: fr.embed.color.description })
				.setNameLocalizations({ fr: fr.embed.color.name })
				.setRequired(false)
		)
		.addAttachmentOption(option =>
			option
				.setName(en.embed.thumbnail.name)
				.setDescription(en.embed.thumbnail.description)
				.setRequired(false)
		),

	async execute(interaction: CommandInteraction) {
		if (!interaction.guildId) return;
		const options = interaction.options as CommandInteractionOptionResolver;
		const messageId = options.getString("message_id", true);
		//get the embed
		const lang = ln(interaction);
		const channel = interaction.channel;
		if (!channel || !(channel instanceof TextChannel)) {
			await interaction.reply({ content: lang.embed.error.textChannel, ephemeral: true });
			return;
		}
		//force refresh cache
		await channel.messages.fetch();
		const message = await channel.messages.fetch(messageId);
		if (!message) {
			await interaction.reply({ content: lang.embed.error.notFound, ephemeral: true });
			return;
		}
		const embeds = message.embeds?.[0];
		if (!embeds) {
			await interaction.reply({ content: lang.embed.error.noEmbed, ephemeral: true });
			return;
		}
		const newColor = options.getString("color", false);
		let validColor = false;
		let color : string | number | number[]| null = newColor;
		if (newColor) {
			const colorName = Colors[toTitle(newColor) as keyof typeof Colors];
			// eslint-disable-next-line no-useless-escape
			const colorMatch = newColor.match(/[\[\(](\d) ?, ?(\d), ?(\d)[\]\)]/);
			if (newColor.startsWith("#")) {
				validColor = true;
			} else if (colorName){
				color = colorName;
				validColor = true;
			} else if (colorMatch) {
				color = [parseInt(colorMatch[1]), parseInt(colorMatch[2]), parseInt(colorMatch[3])];
				validColor = true;
			} else if (!Number.isNaN(parseInt(newColor, 16))) validColor = true;
		}
		if (!validColor) {
			await interaction.reply({ content: lang.embed.error.invalidColor, ephemeral: true });
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
			await interaction.reply({ content: lang.embed.success.jump.replace("{{url}}", newMessage.url), ephemeral: true });
			return;
		}
		await message.edit({ embeds: [newEmbed] });
		await interaction.reply({ content: lang.embed.success.simple, ephemeral: true });
		return;

	}
};