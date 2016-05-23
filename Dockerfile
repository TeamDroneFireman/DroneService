FROM ubuntu
MAINTAINER thuchede

RUN apt-get update && apt-get -y install curl python-dev python-pip python-opencv python-wxgtk && pip install dronekit-sitl MAVProxy

RUN curl -sL https://deb.nodesource.com/setup_5.x | sudo bash -
RUN apt-get install -y nodejs

WORKDIR /app
ADD . /app
RUN npm install
EXPOSE 3000
# launch should be done using : -e NODE_ENV=XXX
ENTRYPOINT [ "nodejs", "." ]
