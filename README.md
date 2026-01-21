# Team Teal Task Manager

## Using CloudFlare Pages

GitHub has been integrated with CloudFlare pages. If you make a draft pull request for your branch, you'll see the build result for CloudFlare pages with every commit and are able to see the URL for accessing the preview build for your branch. Please note we are limited to 500 builds a month, so try to not spam commits.

## Using the D1 SQL Database

The settings automatically use the test-db test database for non-main deployments, and the prod-db production database for the main branch deployments.

I've added example database folows under the `migrations` folder. The SQL files are run in order of their starting numbers (i.e. 001, 002, etc.). Under functions/api, I've added helpers.js to try to make it easier to make CRUD endpoints for tables. I've added `functions/api/customers.js` for the example API customers endpoint and `functions/api/customers/[id].js` for the example API customers/:id endpoint. I've also added Customers.jsx as a component to demonstrate how to use the APIs.

For adding a new table, you'll need to add the schema to the migrations folder. Then you'll want to add the API endpoints. Lastly, you'll want to interact with those API endpoints in the component.
