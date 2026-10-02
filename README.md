Contains git paths to all repositories and instructions to create images


# basic cmds


`docker-compose` build
docker-compose build --no-cache: force full rebuild


# bring up application
docker-compose up

combine
docker-compose up --build 

`docker-compose down`: bring down application

# iamge and container-related cmds

`docker images`: list all images
`docker rmi [image_id]`: remove image with id

To delete all containers including its volumes use,

`docker rm -vf $(docker ps -aq)`

To delete all the images,
`docker rmi -f $(docker images -aq)`


