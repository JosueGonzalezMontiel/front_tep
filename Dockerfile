# Usamos Nginx ligero
FROM nginx:alpine

# Borramos la config por defecto de Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copiamos nuestra propia config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiamos TODO el proyecto a la carpeta pública de Nginx
# (ajusta si tu index.html está en otra ruta)
COPY . /usr/share/nginx/html

# Exponemos el puerto 80 (dentro del contenedor)
EXPOSE 80

# Nginx se arranca solo con esta base image

