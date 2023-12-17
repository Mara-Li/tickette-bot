export default {
	common: {
		role: "role",
		field: "champs",
	},
	created: "Ticket créé !",
	reason: "Ticket créé par {{nickname}}",
	error: {
		channel: "Erreur lors de l'édition du template : message non trouvé. Vous devez utiliser la commande dans le même channel que le JSON du template.",
		attachment: "Erreur lors de l'édition du template : le message n'a pas de fichier joint.",
		footer: "Erreur lors de l'édition du template : le footer de l'embed n'a pas le bon format.",
		administrator: "Merci de contacter un administrateur pour éditer le template.",
		field: {
			"notfound": "Erreur lors de l'édition du template : le champ n'a pas été trouvé.",
			"exist": "Erreur lors de l'édition du template : le champ existe déjà.",
			"tooMuch" : "Erreur lors de l'édition du template : le template a trop de champs. Vous ne pouvez pas avoir plus de 5 champs.",
		},
		role: {
			left: "Impossible de supprimer le rôle {{role}} car c'est le seul restant.",
			notInTemplate: "Le rôle {{role}} n'est pas dans le template."
		}
	},
	modal: {
		ticket: "Nouveau ticket",
		button: "Créer un nouveau ticket",
	},
	new: {
		success: "Template créé avec succès",
	},
	edit: {
		role: {
			add: "Rôle {{role}} ajouté avec succès",
			remove: "Rôle {{role}} supprimé avec succès",
		},
		field: {
			deleted : "Le template est supprimé car il n'y a plus de champs",
			edited : "Champ {{field}} édité avec succès",
			removed : "Champ {{field}} supprimé avec succès",
			added: "Champ {{field}} ajouté avec succès",
		}
	},
	config: {
		title: "config",
		description: "Configuration des tickets",
		field: {
			name: "Le nom du champ",
			description: "La description du champ",
			type: "Le type du champ, paragraphe ou court",
			required: "Le champ est-il obligatoire ?",
			short: "Court",
			paragraph: "Paragraphe",
			id: "L'ID du champ, gardez-le court et simple. Utiliser le champ dans le nom du thread avec {{nom}}.",
		},
		new: {
			name: "nouveau",
			description: "Créer une nouvelle template",
			embed: {
				name: "name",
				description: "Le titre de l'embed",
			},
			thread_name: {
				name: "thread_name",
				description: "Le nom du thread. Les variables peuvent être transformée avec {{valeur}}",
			},
			role: {
				description: "Le rôle des personnes qui doivent être ajoutées à la template",
			},
			embed_content: {
				name: "description",
				description: "Le message dans l'embed pour créer un ticket",
			},
			channel: {
				name: "channel",
				description: "Le channel où le ticket sera créé",
			}
		},
		edit: {
			message_id: {
				name: "message_id",
				description: "L'ID du message où le JSON de la template est envoyée",
			},
		},
		role: {
			description: "Ajouter ou supprimer un rôle de la template",
			choice: {
				name: "action",
				description: "L'action à effectuer",
				add: "Ajouter",
				remove: "Supprimer",
			},
			role: {
				description: "Le rôle à ajouter ou supprimer",
			}
		},
		rename: {
			title: "renommer",
			description: "Modifier la template du nom du ticket"
		},
		fields: {
			title: "champs",
			description: "Modifier les champs de la template",
			name: {
				name: "field_id",
				description: "L'id du champ, gardez-le court et simple. Utiliser le champ dans le nom du thread avec {{valeur}}",
			},
			remove: {
				name: "supprimer",
				description: "Supprimer un champ de la template",
			},
			add: {
				name: "ajouter",
				description: "Ajouter un champ à la template",
			},
			edit: {
				name: "modifier",
				description: "Modifier un champ de la template",
			},
		}
	}

};