# Import data from Strapi to Meilisearch engine

## Migration guide

All the indexes are deleted and recreated when running the connector. Because of this, migration is not much of a problem. However, one thing needs to be preserved when upgrading: the auth keys (both the master and the ones used by this connector and the actual website).

To do that, here's a guide:

1. Stop the services (both this connector and the docker container)
2. Create a backup of `meili_data`, let's call it `meili_data.bk`
3. Use this command to update to the latest version of Meilisearch `docker compose pull`
4. Start the docker container `docker compose up`
5. Stop it after it successfully initialized
6. Delete the following folder `rm -r meili_data/data.ms/auth`
7. Replace the deleted folder with the one from our backup `cp -r meili_data.bk/data.ms/auth meili_data/data.ms/`
8. Run the docker container, then the connector

Your instance is now updated, the auth keys are preserved and the search data has been populated by the connector.