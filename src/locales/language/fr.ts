export default {
	error: {
		channel: "Erreur lors de l'édition du template : message non trouvé. Vous devez utiliser la commande dans le même channel que le JSON du template.",
		attachment: "Erreur lors de l'édition du template : le message n'a pas de fichier joint.",
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
	}

}