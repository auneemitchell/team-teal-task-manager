# Team Teal Task Manager

## Migrating the Repo to a New GitHub Repo and CloudFlare Account

Note, these steps have not been fully tested yet. Work in progress.

### Initial CloudFlare Pages Setup (New Repo)

If you are forking this repo to a different GitHub repo, you will need to connect the application to a different CloudFlare account.
1. Set up the Pages project
* Create a free CloudFlare account
* Go to https://dash.cloudflare.com
* In CloudFlare, navigate to your Pages application by going to Build --> Compute & AI --> Workers & Pages
* Click Create Application
* At the bottom of the screen, you should see "Looking to deploy Pages? Get started" -- click on Get started
* Click on Import an Existing Git repository
* Connect your GitHub account and select the repository
* Click Begin setup

### Initial CloudFlare D1 Database Setup (New Repo)

If you are using a different CloudFlare account, you need to follow these steps to get the database working with the database within your account.

1. Create the D1 database and update the database_id in `/task-manager/wrangler.jsonc` with your database ID.
* Go to https://dash.cloudflare.com
* On the left-hand panel, navigate to Build --> Storage & databases --> D1 SQL database
* Click Create Database and choose prod-db as the name
* Copy the database UUID (listed to the right of the database name)
* Replace the database_id in `/task-manager/wrangler.jsonc` with the new database ID

2. Create an API token and add it to your repo secrets.
* Go to https://dash.cloudflare.com
* On the left-hand panel, navigate to Manage account --> Account API tokens --> Create Token
* Under Custom Token, next to Create Custom Token, click Get Started
* Give your token a name (i.e. d1-edit-access), and then under Permissions, in the farthest dropdown to the left, select Account
* In the dropdown to the right of Account, search for and select D1
* In the dropdown to the right of D1, search for and select Edit
* Optionally select client IP filtering and TTL, if you want to restrict IP address ranges and set an expiration date for the token
* Click Continue to summary
* Click Create Token
* Make sure to copy the token to a secure location, as it will not be shown again
* In CloudFlare, navigate to your Pages application by going to Build --> Compute & AI --> Workers & Pages
* Click on your Pages application
* Click on Settings, then click on Variables and Secrets, and click Add
* Under Type, choose Secret
* Under Variable name, choose CLOUDFLARE_API_TOKEN
* Under Value, paste the API token you previously saved
* Click Save

3. Update your Build command to apply the schema
* In CloudFlare, navigate to your Pages application by going to Build --> Compute & AI --> Workers & Pages
* Click on your Pages application
* Click on Settings, then click on Build, and click on the edit icon next to Build configuration
* Framework preset should be set as None and the build output directory should be set as dist
* Update the Build command to `wrangler d1 migrations apply prod-db --persist-to=.wrangler-cache && npm run build`
* Click Save

4. Add the D1 Binding in your Pages settings
* In CloudFlare, navigate to your Pages application by going to Build --> Compute & AI --> Workers & Pages
* Click on your Pages application
* Click on Settings, then click on Bindings
* Click Add --> D1 database
* Under name, use prod_db
* Under D1 Database, select the prod-db database you created
