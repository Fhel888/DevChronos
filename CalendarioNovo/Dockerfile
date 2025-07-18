# Use uma imagem base do Nginx para servir arquivos estáticos
FROM nginx:alpine

# Remover a configuração padrão do Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copiar nossa configuração personalizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/

# Copiar os arquivos da aplicação para o diretório do Nginx
COPY . /usr/share/nginx/html/

# Expor a porta 80
EXPOSE 80

# Comando para iniciar o Nginx
CMD ["nginx", "-g", "daemon off;"]
