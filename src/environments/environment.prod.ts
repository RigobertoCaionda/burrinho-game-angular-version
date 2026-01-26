import { stages } from './stages-environment';

export const environment = {
  production: true,
  ...stages.production
};