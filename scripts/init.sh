DB=${DB:-pnsmail}
HOST=${HOST:-localhost}
USERNAME=${USERNAME}
PASSWORD=${PASSWORD}
echo "Setting up initial data"
mongoimport -h $HOST -d $DB -c domains --username $USERNAME --password $PASSWORD --upsert < scripts/initJSON/domains.json
mongoimport -h $HOST -d $DB -c servers --username $USERNAME --password $PASSWORD --upsert < scripts/initJSON/servers.json
mongoimport -h $HOST -d $DB -c groups --username $USERNAME --password $PASSWORD --upsert < scripts/initJSON/groups.json
mongoimport -h $HOST -d $DB -c users --username $USERNAME --password $PASSWORD --upsert < scripts/initJSON/users.json
