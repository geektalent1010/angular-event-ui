// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { env } from "./env";

export const environment = {
  production: false,
  baseUrl: env.eventInterface_test,
  baseURL: env.eventInterface_local,
  proxyBaseURL: "",
  telerkServer: "https://reports.csi-event.com",
  telerikAuth: {
    username: "report_user",
    password: "mP2VtJvVvu"
  },
  keycloak: {
    config: {
      url: 'https://reports.csi-event.com:8443/auth',
      realm: 'eventInterface',
      clientId: 'admin-cli',
    },
    adminCredentials: {
      username: "csiadmin",
      password: "C$!@dm!n"
    }
  },
  serviceAPI: "",
  PAPERBITS_URL: env.paperbits_test,
  PUBLISHED_PAPERBITS: env.publish_test,
  recaptcha: {
    siteKey: '6LdsNdEeAAAAAHxA9M_C4rt8w0PShFJChH4SCIMw',
  },
  postmark: {
    email: '/email/batch',
    serverToken: '0a23a828-0b28-403e-bf2f-5c27adb26232'
  } 
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
