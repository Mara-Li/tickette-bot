import i18next from "i18next";
import * as EnglishUS from "./language/en.json";
import * as French from "./language/fr.json";

export const resources = {
	en: { translation: EnglishUS },
	fr: { translation: French },
};

i18next.init({
	lng: "en",
	fallbackLng: "en",
	resources,
	returnNull: false,
});

export default i18next;
