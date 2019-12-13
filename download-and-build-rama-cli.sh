##############################################
# Downloads and compiles the RAMA CLI
##############################################

# switch one directory upwards
cd ..

# download the repository
git clone https://github.com/restful-ma/rama-cli.git

# switch into the repo and run maven
cd ./rama-cli
mvn clean install
