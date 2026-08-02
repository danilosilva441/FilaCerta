# Estágio de build
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build

WORKDIR /app

# Copiar pom.xml e baixar dependências
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copiar código fonte e compilar
COPY src ./src
RUN mvn clean package -DskipTests

# Estágio de execução
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copiar o JAR gerado
COPY --from=build /app/target/*.jar app.jar

# Criar usuário não-root
RUN addgroup -S spring && adduser -S spring -G spring
USER spring

# Expor porta
EXPOSE 8080

# Comando de entrada
ENTRYPOINT ["java", "-jar", "app.jar"]