# ═════════════════════════════════════════════════════════════
# Claimora Backend — Production Multi-Stage Dockerfile
# ═════════════════════════════════════════════════════════════

# ── Stage 1: Build JAR ──
FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /build

# Cache Maven dependencies layer
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Build application
COPY src ./src
RUN mvn clean package -DskipTests -B

# ── Stage 2: Minimal Runtime Image ──
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Install native Tesseract OCR engine & language models for Tess4J
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    tesseract-ocr-eng \
    libtesseract-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Default container environment
ENV PORT=8080 \
    STORAGE_PATH=/app/storage/uploads \
    TESSDATA_PREFIX=/usr/share/tesseract-ocr/4.00/tessdata/ \
    JAVA_OPTS="-Xmx512m -XX:+UseG1GC -Djava.security.egd=file:/dev/./urandom"

# Create directories for persistent storage and logs
RUN mkdir -p /app/storage/uploads /app/logs

# Copy built artifact from builder
COPY --from=builder /build/target/*.jar app.jar

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 \
  CMD curl -f http://localhost:8080/api/health || exit 1

# Start Spring Boot application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Dserver.port=${PORT} -jar app.jar"]
