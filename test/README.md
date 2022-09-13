# Staking widget tests

## Run tests

- Install deps

```
cd test
yarn install
```

- Run tests

```
cd test
export STAND_URL=<deployed widget url> && yarn test:api
```

- Run tests (against stand with basic auth)

```
cd test
export STAND_URL=<deployed widget url> && export STAND_USER=<stand user> && export STAND_PASSWORD=<stand password> && yarn test:api
```
