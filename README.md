# Craw Image
## Description
This is a imange craw products from the ecomerge-platforms as tiki, lazada, shopee...
## Build
```
docker build . -t <image-name>
```
## Run
```
docker run --network=host -e PLATFORM=<platform-name> <image-name>
```