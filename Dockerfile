# Usar una imagen base oficial de Node.js
FROM node:18

# Establecer el directorio de trabajo en el contenedor
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto de la aplicación
COPY . .

# Exponer el puerto en el que tu aplicación va a correr
EXPOSE 3000

# Comando por defecto para ejecutar tu aplicación
CMD ["node", "src/app.js"]
