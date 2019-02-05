#!/bin/bash -e
set -a
LOG=${LOG:-/home/vagrant/comlog/vagrant/tmp/log/boot.log}
set +a

NODE_VER=${NODE_VER:-10.x}

PGVERSION=${PGVERSION:-10}
PGDATABASE=${PGDATABASE:-comlogdb}
PGPORT=${PGPORT:-5433}
PGUSER=${PGUSER:-postgres}
PGPASSWORD=${PGPASSWORD:-devved}
NGINX_AVAILABLE_VHOSTS=${NGINX_AVAILABLE_VHOSTS:-/etc/nginx/sites-available}
NGINX_ENABLED_VHOSTS=${NGINX_ENABLED_VHOSTS:-/etc/nginx/sites-enabled}
WHITE_LIST=${WHITE_LIST:-/etc/nginx/includes}
WEB_DIR=${WEB_DIR:-/var/www}

DB_DIR=${DB_DIR:-/home/vagrant/comlog/migrations/}

echo "starting provisioning..."
echo "NODE_VER: ${NODE_VER}"
echo "PGVERSION: ${PGVERSION}"
echo "PGDATABASE: ${PGDATABASE}"
echo "PGPORT: ${PGPORT}"
echo "PGUSER: ${PGUSER}"
echo "PGPASSWORD: ${PGPASSWORD}"

ETH0IP=$(ifconfig -a eth0 | grep "inet addr:")

mkdir -p /vagrant/tmp/log

print_db_usage () {
	echo "Your Postgres environment has been setup"
	echo "Networking: [ $ETH0IP ]"
	echo ""
	echo "  Port: $PGPORT"
	echo "  Database: $PGDATABASE"
	echo "  Username: $PGUSER"
	echo "  Password: $PGPASSWORD"
	echo ""
	echo "psql access to app database user via VM:"
	echo "  vagrant ssh"
	echo "  sudo su - postgres"
	echo "  PGUSER=$PGUSER PGPASSWORD=$PGPASSWORD psql -h localhost $PGDATABASE"
	echo ""
	echo "Env variable for application development:"
	echo "  DATABASE_URL=postgresql://$PGUSER:$PGPASSWORD@*:$PGPORT/$PGDATABASE"
	echo ""
	echo "Local command to access the database via psql:"
	echo "  PGUSER=$PGUSER PGPASSWORD=$PGPASSWORD psql -h localhost -p $PGPORT $PGDATABASE"
	echo ""
	echo "  Getting into the box (terminal):"
	echo "  vagrant ssh"
	echo "  sudo su - postgres"
	echo ""
}

export DEBIAN_FRONTEND=noninteractive


display() {
	echo -e "\n-----> "$0": "$*
}


PROVISIONED_ON=/etc/vm_provision_on_timestamp
if [ -f "$PROVISIONED_ON" ]
then
	echo "VM was already provisioned at: $(cat $PROVISIONED_ON)"
	echo "To run system updates manually login via 'vagrant ssh' and run 'apt-get update && apt-get upgrade'"
	echo ""
	print_db_usage
	exit
fi

display add postgresql apt sources

# Add PostgreSQL Apt repository to get latest stable
PG_REPO_APT_SOURCE=/etc/apt/sources.list.d/pgdg.list
if [ ! -f "$PG_REPO_APT_SOURCE" ]
then
	echo "deb http://apt.postgresql.org/pub/repos/apt/ $(lsb_release -cs)-pgdg main" > "$PG_REPO_APT_SOURCE"
	#echo "deb http://security.ubuntu.com/ubuntu xenial-security main" > "$PG_REPO_APT_SOURCE"
	wget --quiet -O - http://apt.postgresql.org/pub/repos/apt/ACCC4CF8.asc | sudo apt-key add -
fi


display update apt packages

# nginx packages
sudo wget http://nginx.org/keys/nginx_signing.key
sudo apt-key add nginx_signing.key
sudo rm nginx_signing.key
sudo echo "deb http://nginx.org/packages/ubuntu/ xenial nginx" | sudo tee -a /etc/apt/sources.list
sudo echo "deb-src http://nginx.org/packages/ubuntu/ xenial nginx" | sudo tee -a /etc/apt/sources.list


apt-get update


#display install postgresql dependency with version 10.3
#sudo apt-get install libicu55


display install node
#apt-get -y install curl
apt-get -y install build-essential
curl -sL "https://deb.nodesource.com/setup_$NODE_VER" | sudo -E bash -


display "install node version ${NODE_VER}"
sudo apt-get install -y nodejs

sudo apt-get install -y nginx

display Install jq
apt-get -y install jq


display install openssl dependency
apt-get -y install libssl-dev


# Install PostgreSQL
echo "install postgresql version ${PGVERSION}"
# -qq implies -y --force-yes
#sudo apt-get install -qq "postgresql-$PGVERSION" "postgresql-contrib-$PGVERSION"
# Install dev version of postgresql to support debugging
apt-get -qq install "postgresql-server-dev-$PGVERSION" "postgresql-contrib-$PGVERSION" "postgresql-plpython-$PGVERSION" "postgresql-plperl-$PGVERSION"


# Configure PostgreSQL
# Listen for localhost connections
PG_CONF="/etc/postgresql/$PGVERSION/main/postgresql.conf"
PG_HBA="/etc/postgresql/$PGVERSION/main/pg_hba.conf"


# update postgres user password
cat << EOF | su - postgres -c psql
ALTER ROLE postgres WITH SUPERUSER INHERIT CREATEROLE CREATEDB LOGIN REPLICATION PASSWORD '$PGPASSWORD';
EOF


# add expressif user
cat << EOF | su - postgres -c psql
CREATE ROLE expressif WITH PASSWORD 'expressif_dev';
EOF

# Edit postgresql.conf to change listen address to '*':
sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" "$PG_CONF"


# Edit postgresql.conf to change port:
if [ ! -z "$PGPORT" ]
then
	sed -i "/port = /c\port = $PGPORT" "$PG_CONF"
fi


# Append to pg_hba.conf to add password auth:
echo "host    all             all             all                     md5" >> "$PG_HBA"


# Restart PostgreSQL for good measure
service postgresql restart


# create test db
cat << EOF | su - postgres -c psql
-- Create extensions:
CREATE EXTENSION plpythonu schema pg_catalog;
CREATE EXTENSION plperlu schema pg_catalog;
CREATE EXTENSION pgcrypto schema extensions;
-- Create the database:
CREATE DATABASE $PGDATABASE WITH OWNER $PGUSER;
-- auto explain for analyse all queries and inside functions
LOAD 'auto_explain';
SET auto_explain.log_min_duration = 0;
SET auto_explain.log_analyze = true;
EOF

# Restart PostgreSQL for good measure
service postgresql restart


# install expressif
echo "install expressif"
cd /home/vagrant/expressif

npm install

# Tag the provision time:
date > "$PROVISIONED_ON"

echo "Successfully created postgres dev virtual machine with Postgres"
echo ""
print_db_usage
