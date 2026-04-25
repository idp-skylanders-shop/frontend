=========================================================
  INFRASTRUCTURA FRONTEND — Mihai
=========================================================

Folder: frontend/Mihai/
Fisier: nginx.conf — Configuratia Nginx pentru containerul React

=========================================================
ROLUL NGINX
=========================================================

Nginx serveste fisierele statice ale build-ului React (HTML, JS, CSS).
Regula `try_files $uri $uri/ /index.html` este necesara
pentru ca rutele client-side (ex: /cart) sa nu returneze 404
la refresh — rutarea este gestionata de React Router, nu de Nginx.

=========================================================
INTEGRAREA CU TRAEFIK (reverse proxy Docker Swarm)
=========================================================

Nginx NU este expus direct. Traefik asculta pe portul 80
si ruteaza traficul intern pe reteaua overlay a swarm-ului:

  /*            -> Frontend (container Nginx)
  /api/*        -> Backend service (3 replici, round-robin)
  /realms/*
  /admin/*      -> Keycloak

Clientul comunica exclusiv cu portul 80, iar frontend-ul
si backend-ul impart acelasi origin — fara probleme de CORS in productie.

=========================================================
BUILD DOCKER
=========================================================

Build multi-stage (Dockerfile in frontend/Dan/):
  Stage 1 — node:18      : instalare dependente si compilare
  Stage 2 — nginx:alpine : copiere doar /app/build (~25MB imagine finala)
=========================================================
