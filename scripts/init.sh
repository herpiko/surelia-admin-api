DB=${DB:-pnsmail}
HOST=${HOST:-localhost}
USERNAME=${USERNAME}
PASSWORD=${PASSWORD}
echo "Setting up initial data"
mongoimport -h $HOST -d $DB -c domains -u $USERNAME --password $PASSWORD --jsonArray --upsert < scripts/initJSON/domains.json
mongoimport -h $HOST -d $DB -c servers -u $USERNAME --password $PASSWORD --jsonArray --upsert < scripts/initJSON/servers.json
mongoimport -h $HOST -d $DB -c groups -u $USERNAME --password $PASSWORD --jsonArray --upsert < scripts/initJSON/groups.json
mongoimport -h $HOST -d $DB -c users -u $USERNAME --password $PASSWORD --jsonArray --upsert < scripts/initJSON/users.json
