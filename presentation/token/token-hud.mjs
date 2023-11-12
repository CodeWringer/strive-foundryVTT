import { TEMPLATES } from "../templatePreloader.mjs";

export default class AmbersteelTokenHud extends TokenHUD {

  constructor(...args) {
    super(...args);
  }

  getData(options) {
    const data = {
      ...super.getData(options),
      localizedChallengeRating: "test",
    };

    return data;
  }
}