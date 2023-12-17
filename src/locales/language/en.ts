export default {
	error: {
		channel: "Error while editing the template: message not found.You need to use the command in the same channel the template JSON was saved.",
		attachment: "Error while editing the template: the message has no attachment.",
		field: "Error while editing the template: the field was not found.",
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
		}
	}

}