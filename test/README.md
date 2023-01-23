# Staking widget tests

Both API and UI tests are written using Playwright.
UI tests are run in a headless browser using Chrome, Firefox and Webkit.

## Run tests

At first, install deps:
```
cd test
yarn install
```

The following env variables are used:

- `STAND_URL` - deployed widget url (_required_)
- `STAND_TYPE` - **testnet** or **staging** choice (**testnet** is default)
- `STAND_USER` - username if basic auth is required
- `STAND_PASSWORD` - password if basic auth is required

Now, set needed env variables and run tests:
```
cd test
export STAND_URL=<deployed widget url> && yarn test
```

and against stand with basic auth:

```
cd test
export STAND_URL=<deployed widget url> && export STAND_USER=<stand user> && export STAND_PASSWORD=<stand password> && yarn test
```
