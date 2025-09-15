#!/bin/bash

PROJECT_DIR=$1
DOCKERFILE_PATH="$PROJECT_DIR/Dockerfile"
IMAGE_NAME=$2
TAR_FILE="$IMAGE_NAME.tar"

echo -n "Enter remote server login: "
read REMOTE_USER

echo -n "Enter server IP: "
read REMOTE_HOST

REMOTE_PATH="/root/"  

# Шаг 1: Сборка проекта с помощью Bun
cd $PROJECT_DIR
bun build

# Шаг 2: Создание Docker-образа
docker build -t $IMAGE_NAME -f $DOCKERFILE_PATH .

# Шаг 3: Упаковка образа в tar
docker save -o $TAR_FILE $IMAGE_NAME

# Шаг 4: Передача tar-файла на удаленный сервер
scp $TAR_FILE $REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH

# Шаг 5: Подключение к удаленному серверу и выполнение команд
ssh $REMOTE_USER@$REMOTE_HOST << ENDSSH

docker rm -f \$(docker ps -aq)  
docker rmi -f \$(docker images -q)  

docker load -i $REMOTE_PATH/$TAR_FILE

docker run -d --name your_container_name your_image_name
ENDSSH

# Очистка
rm $TAR_FILE  # Удаление локального tar-файла
