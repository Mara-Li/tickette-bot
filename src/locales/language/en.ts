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
	new: {
		success: "Template created successfully",
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
	config: {
		title: "config",
		description: "Ticket configuration",
		field: {
			name: "The field name",
			description: "The field description",
			type: "The field type, paragraph or short",
			required: "Is the field required ?",
			short: "Short",
			paragraph: "Paragraph",
			id: "The field id, keep it short and simple",
		},
		new: {
			name: "new",
			description: "Create a new template",
			embed: {
				name: "name",
				description: "The title of the embed",
			},
			thread_name: {
				name: "thread_name",
				description: "The name of the thread. Use {{value}} to use template value.",
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
			}
		},
		edit: {
			message_id: {
				name: "message_id",
				description: "The message ID of the template",
			}
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
				description: "The id of the field",
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
			}
		}
	}

};