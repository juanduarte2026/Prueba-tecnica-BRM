# Prueba Tecnica para desarrollador Backend en BRM

##  Instalación

 1. En la raiz del proyecto el archivo ".env.txt", debe renombrarlo y dejarlo en ".env"

 2. Abrir la aplicacion de docker en su computadora

 3. Ejecutar los siguientes comandos:

    - docker-compose up --build -d
    - docker-compose exec app npx sequelize-cli db:migrate 
    - docker-compose exec app npx sequelize-cli db:seed:all   
