import { stages } from "./stages-environment";

export const environment = {
  production: false,
  ...stages.production
};