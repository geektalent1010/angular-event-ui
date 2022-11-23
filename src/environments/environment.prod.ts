import { env } from "./env";

export const environment = {
  production: true,
  baseUrl: env.eventInterface_prod,
  baseURL: env.eventInterface_prod,
  proxyBaseURL: "https://reports.csi-event.com:8443",
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
  serviceAPI: env.eventInterface_prod,
  PAPERBITS_URL: env.paperbits_prod,
  PUBLISHED_PAPERBITS: env.publish_prod,
  recaptcha: {
    siteKey: '6LdsNdEeAAAAAHxA9M_C4rt8w0PShFJChH4SCIMw',
  },
  postmark: {
    email: '/email',
    serverToken: '0a23a828-0b28-403e-bf2f-5c27adb26232'
  } 
};
