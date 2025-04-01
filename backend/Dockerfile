FROM openjdk:22-jdk-slim
WORKDIR /app
# Copy the built JAR file from your target folder
COPY target/backend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
