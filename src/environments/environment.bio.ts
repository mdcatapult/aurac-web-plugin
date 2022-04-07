import { environment as PROD_ENV } from './environment.prod'
export const environment = {
  ...PROD_ENV,
  bio: true
}
