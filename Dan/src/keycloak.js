import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: "",        // empty = same origin; Kong routes /realms -> Keycloak
  realm: "skylander_shop",
  clientId: "react-frontend",
});

export default keycloak;