FROM nginx:latest
COPY docker/dist.conf /etc/nginx/conf.d/dist.conf
RUN rm  /etc/nginx/conf.d/default.conf -rf
COPY dist/  /usr/share/nginx/html/