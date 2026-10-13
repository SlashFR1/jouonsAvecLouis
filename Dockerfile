# ==============================================================================
#  LOUSTIC - DOCKERFILE UNIFIÉ TOUT-EN-UN (React 19 + Spring Boot 3 + Neon)
# ==============================================================================

# ------------------------------------------------------------------------------
# Étape 1 : Compilation du Frontend React 19 (Vite)
# ------------------------------------------------------------------------------
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY loustic-frontend/package*.json ./
RUN npm ci || npm install

COPY loustic-frontend/ ./
RUN npm run build

# ------------------------------------------------------------------------------
# Étape 2 : Compilation du Backend Java Spring Boot 3 avec les assets statiques
# ------------------------------------------------------------------------------
FROM maven:3.9.6-eclipse-temurin-17 AS backend-builder
WORKDIR /app/backend

COPY loustic-backend/pom.xml ./
RUN mvn dependency:go-offline -B

COPY loustic-backend/src ./src

# Intégrer les assets du frontend React compilés dans Spring Boot (/resources/static)
COPY --from=frontend-builder /app/frontend/dist ./src/main/resources/static

RUN mvn clean package -DskipTests -B

# ------------------------------------------------------------------------------
# Étape 3 : Image d'exécution finale légère (Alpine JRE 17)
# ------------------------------------------------------------------------------
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copie du jar unifié contenant l'API, les WebSockets et l'IHM React
COPY --from=backend-builder /app/backend/target/loustic-backend-*.jar app.jar

ENV PORT=8080
EXPOSE 8080

# Démarrage de l'application orchestrée
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
