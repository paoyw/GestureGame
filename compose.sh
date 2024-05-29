#! /bin/bash

network_name="gesture-game"
self_signed_ssl=1
HOST_NAME="localhost"
HTTP_PORT=5080
HTTPS_PORT=5443

network_exist=$(docker network ls -q -f name="$network_name")
if [ -n "$network_exist" ]; then
    echo "Network '$network_name' '$network_exist' exists."
else
    echo "Create network '$network_name'."
    docker network create "$network_name"
fi

# Creates and runs the NGINX server.
if [ $self_signed_ssl == 1 ]; then
    echo "Create the self-signed SSL"
    mkdir -p ssl/
    openssl req \
    -x509 \
    -newkey rsa:4096 \
    -nodes \
    -keyout ssl/nginx.key \
    -out ssl/nginx.crt \
    -days 365 \
    -subj "/C=TW/ST=TW/L=TPE/O=O/CN=$1"
fi


# Creates and run the Redis server
echo "Starts the redis server"
docker run --network "$network_name" --network-alias redis --rm -d redis:7

# Builds and runs the Django
echo "Build the docker image"
docker build -t gesture-game .

echo "Run the game server"
docker run \
--network $network_name \
--network-alias gesture-game \
-e USE_CSRF_TRUSTED=1 \
-e HOST_NAME="$HOST_NAME" \
-e HTTP_PORT="$HTTP_PORT" \
-e HTTPS_PORT="$HTTPS_PORT" \
--rm -d \
gesture-game:latest

echo "Starts the NGINX server"
docker run \
--network "$network_name" \
--network-alias nginx \
-v ./nginx.conf:/etc/nginx/nginx.conf:ro \
-v ./ssl/:/etc/nginx/ssl/ \
--rm \
-d \
-p $HTTP_PORT:80 \
-p $HTTPS_PORT:443 \
nginx:1.25.5
