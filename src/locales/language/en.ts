export default {
	error: {
		channel: "Error while editing the template: message not found.You need to use the command in the same channel the template JSON was saved.",
		attachment: "Error while editing the template: the message has no attachment.",
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
	}

}