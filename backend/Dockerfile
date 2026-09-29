# Estágio de build (Alterado de 25 para 21 LTS)
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build

WORKDIR /app

# Copiar pom.xml e baixar dependências
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copiar código fonte
COPY src ./src

# Compilar
RUN mvn clean package -DskipTests

# Estágio de produção (Alterado de 25 para 21 LTS)
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Criar usuário não-root
RUN addgroup -S spring && adduser -S spring -G spring

# Copiar JAR
COPY --from=build /app/target/*.jar app.jar

# Criar diretório para logs
RUN mkdir -p /app/logs && chown spring:spring /app/logs

# Expor porta
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD wget -qO- http://localhost:8080/actuator/health || exit 1

# Executar com usuário não-root
USER spring
ENTRYPOINT ["java", "-jar", "app.jar"]