# Build the application with Maven
FROM maven:3.9.9-eclipse-temurin-22 as builder
WORKDIR /app
# Copy pom.xml and source code from the backend directory
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Create the runtime image
FROM openjdk:22-jdk-slim
WORKDIR /app
# Copy the built JAR from the builder stage
COPY --from=builder /app/target/backend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
