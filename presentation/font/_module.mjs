export const font = {
  init: () => {
    // Register custom fonts.
    CONFIG.fontDefinitions["StriveRegular"] = {
      editor: true,
      fonts: [
        { urls: ["systems/strive/presentation/font/STRIVE-Regular.ttf"] },
      ]
    };
  },
};
