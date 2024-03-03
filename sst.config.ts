import { SSTConfig } from "sst";
import { API } from "./infrastructure/MyStack";

export default {
  config(_input) {
    return {
      name: "face-me",
      region: "eu-central-1",
    };
  },
  stacks(app) {
    app.stack(API);
  }
} satisfies SSTConfig;
