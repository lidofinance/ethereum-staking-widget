# Staking widget tests

## Run tests

- Install deps

```
yarn install
```

- Run tests

```
export STAND_URL=<deployed widget url> && yarn test
```

- Run tests (against stand with basic auth)

```
export STAND_URL=<deployed widget url> && export STAND_USER=<stand user> && export STAND_PASSWORD=<stand password> && yarn test
```
