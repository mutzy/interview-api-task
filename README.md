This project was bootstrapped using Node.js + TypeScript + Express

## Getting Started

In the project directory, you can run:

### `npm run serve`

Runs the app in the development mode at [http://localhost:3000](http://localhost:3000).

The server will reload if you make edits.<br />
You will also see any lint or type errors in the console.


## API End Points actions

POST: /auth/login

Takes in Username and Password as form fields with an additional Role field. If field comply with the database, both refresh and auth token are generated and database updated as well as store the role and refresh token to cookies.Returning a response with auth token.

GET: /auth/refresh

Extracts the refresh token from the cookies as well as role value. We verify the refresh token if available else throw an error, if verified we regenerate both auth and refresh token and use the role value to access and update the database and cookies. Returning the new auth token generated.

GET: /api/whoami

Extract the auth token and verifies the same, if verification fails we throw and error, otherwise we access role from cookies and use the value to access the user username and return the same as an object.

