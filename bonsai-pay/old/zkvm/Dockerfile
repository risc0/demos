# Use an official Rust runtime as a parent image
FROM rust:latest as builder

# Set the working directory in the container
WORKDIR /app

# Copy the current directory contents into the container
COPY . .

RUN apt update && apt install -y cmake curl build-essential libssl-dev pkgconf 


RUN cargo install cargo-risczero

# Install the Risc0 toolchain
RUN cargo risczero install

# Build the Rust project focusing on the host crate
RUN cargo build --release -p host

# Start a new build stage
FROM debian:buster-slim

# Copy the binary from the builder stage
COPY --from=builder /app/target/release/host /usr/local/bin/host

# Expose port 8080 for the web server to listen on
EXPOSE 8181

# Command to run the application
ENTRYPOINT ["host"]
