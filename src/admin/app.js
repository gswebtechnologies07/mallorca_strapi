// import logo from "./extensions/new-favicon.png";

const config = {
  // head: {
  //   favicon: logo,
  //  },
   translations: {
    en: {
      "app.components.LeftMenu.navbrand.title": "Mallorca Dashboard",

      "app.components.LeftMenu.navbrand.workplace": "Testing",

      "Auth.form.welcome.title": "Welcome to Mallorca",

      "Auth.form.welcome.subtitle": "Login to your account",

      "Settings.profile.form.section.experience.interfaceLanguageHelp":
        "Preference changes will apply only to you.",
    },
  },
  tutorials: false,
  notifications: { releases: false },
};

const bootstrap = (app) => {
  console.log(app);
};

export default {
  config,
  bootstrap,
};
