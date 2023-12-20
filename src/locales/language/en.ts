export default {
	common: {
		role: "role",
		field: "field",
	},
	created: "Ticket created !",
	reason: "Ticket created by {{nickname}}",
	error: {
		channel: "Error while editing the template: message not found.You need to use the command in the same channel the template JSON was saved.",
		attachment: "Error while editing the template: the message has no attachment.",
		administrator: "Please, contact an administrator to edit the template.",
		footer: "Error while editing the template: the embed footer is not in the good format.",
		field: {
			"notfound": "Error while editing the template: the field was not found.",
			"exist": "Error while editing the template: the field already exist.",
			"tooMuch" : "Error while editing the template: the template has too much fields. You can't have more than 5 fields.",
		},
		role: {
			left: "Can't remove the role {{role}} because it's the only one left.",
			notInTemplate: "The role {{role}} is not in the template."
		}
	},
	modal: {
		ticket: "New ticket",
		button: "Create a new ticket",
		description: "{{user}} created a new ticket !\n Here are the informations provided by the user:",
	},
	new: {
		success: "Template created successfully",
		name: "new",
		description: "Create a new template",
		embed: {
			name: "name",
			description: "The title of the embed",
		},
		thread_name: {
			name: "thread_name",
			description: "The name of the thread. Variables can be transformed with {{value}}",
		},
		role: {
			description: "The role of people who need to be added to the template",
		},
		embed_content: {
			name: "description",
			description: "The message in the embed for creating ticket",
		},
		channel: {
			name: "channel",
			description: "The channel where the ticket will be created",
		},
	},
	edit: {
		role: {
			add: "Role {{role}} added successfully",
			remove: "Role {{role}} removed successfully",
		},
		field: {
			deleted : "The template is deleted because there is no more fields",
			edited : "Field {{field}} edited successfully",
			removed : "Field {{field}} removed successfully",
			added: "Field {{field}} added successfully",
		}
	},

	field: {
		name: "The field name",
		description: "The field description",
		type: "The field type, paragraph or short",
		required: "Is the field required ?",
		short: "Short",
		paragraph: "Paragraph",
		id: "The id of the field, keep it short and simple. Use the field in the thread name with {{value}}",
	},
	message_id: {
		name: "message_id",
		description: "The message ID of the template",
	},
	role: {
		description: "Edit the role of the template",
		choice: {
			name: "choice",
			description: "If you want to add or remove roles",
			add: "Add",
			remove: "Remove",
		},
		role: {
			description: "The role to add or remove",
		}
	},
	rename: {
		title: "rename",
		description: "Edit the template of the ticket name",
	},
	fields: {
		title: "fields",
		description: "Edit the fields of the template",
		name: {
			name: "field_id",
			description: "The id of the field, keep it short and simple. Use the field in the thread name with {{value}}",
		},
		remove: {
			name: "remove",
			description: "Remove a field from the template",

		},
		add: {
			name: "add",
			description: "Add a field to the template",
		},
		edit: {
			name: "edit",
			description: "Edit a field of the template",
		},
	},
	embed: {
		name: "embed",
		description: "Edit or resend the embed for the ticket creation",
		edit: {
			name: "edit",
			description: "Edit the embed for the ticket creation",
			message_id: {
				name: "message_id",
				description: "The message ID of the embed. You need to use the command in the channel of the embed.",
			},
			channel: {
				name: "channel",
				description: "The channel where the embed can be resend",
			},
			content: {
				name: "content",
				description: "The content of the embed",
			},
			title: {
				name: "title",
				description: "The title of the embed",
			},
			color: {
				name: "color",
				description: "Allow to changing the color. Hexadecimal value, rgb value, or via a color name",
			},
			thumbnail: {
				name: "thumbnail",
				description: "The image to add to the embed",
			},
			error: {
				textChannel: "This command can only be used in a text channel",
				notFound: "The message was not found: you need to use the command in the embed's channel.",
				noEmbed: "The message has no embed",
				invalidColor: "The color is not valid. You must use a hexadecimal value, a rgb value (in the format `(1, 2, 3)` or `[1,2,3]`) or [a color name from this list](https://old.discordjs.dev/#/docs/discord.js/main/typedef/Colors)",
			},
			success: {
				jump: "Embed edited.\n[Jump to message]({{url}})",
				simple: "Embed edited"
			}
		},
		resend: {
			name: "recreate",
			description: "Resend the embed from the template",
			channel: "the channel to recreate the embed",
			error: {
				textChannel: "This command can only be used in a text channel",
				notFound: "The message was not found: you need to use the command in the template's channel.",
				notSend: "The message was not send for an unknown reason."
			}
		},
	}

};