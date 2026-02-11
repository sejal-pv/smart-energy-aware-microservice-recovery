# Use Java 17 base image
FROM eclipse-temurin:17-jdk

# Set working directory
WORKDIR /app

# Create SQLite data folder
RUN mkdir -p /app/data

# Copy built Spring Boot JAR
COPY target/backend-0.0.1-SNAPSHOT.jar app.jar

# Expose backend port
EXPOSE 8080

# Run application
ENTRYPOINT ["java", "-jar", "app.jar"]
