import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: "/admin", // MERGE LA CONTAINER DOCKER
  realm: "skylander_shop", // REALM-UL CREAT PE KEYCLOACK
  clientId: "react-frontend",
});

export default keycloak;