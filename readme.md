# CryptoBot Project

Welcome to the CryptoBot project, an algorithmic trading bot built with JavaScript. This project was initially developed in 2019 and has recently been published in a new repository. The bot uses technical indicators to return trading analysis data and a rule tester to iterate over historical data and test multiple strategies.

## Project Structure

Here's a visual representation of the project's file structure:

```
cryptobot/
├── .dockerignore
├── .gitattributes
├── .gitignore
├── .prettierrc
├── .vscode/
│   └── tasks.json
├── .yarnrc.yml
├── bun.lockb
├── dockerfile
├── ecosystem.config.js
├── jest.config.js
├── nodemon.json
├── package.json
├── src/
│   ├── backtester.ts
│   ├── binance/
│   │   ├── database.ts
│   │   └── utils.ts
│   ├── coinbase/
│   │   ├── database.ts
│   │   ├── types.ts
│   │   └── utils.ts
│   ├── config/
│   │   ├── .env.defaults
│   │   ├── .env.dev
│   │   ├── .env.prod
│   │   ├── .env.schema
│   │   └── config.ts
│   ├── dydx/
│   ├── indicators/
│   ├── kraken/
│   ├── loosing_strats.json
│   ├── mongodb/
│   ├── okx/
│   ├── orderHelper.ts
│   ├── server.ts
│   ├── strategies/
│   ├── test.ts
│   ├── tests/
│   └── utils.ts
└── tsconfig.json
```

## Key Components

- **Technical Indicators ([`src/indicators/`](command:_github.copilot.openRelativePath?%5B%22src%2Findicators%2F%22%5D "src/indicators/"))**: This module returns trading analysis data based on a ticker and timestamp.

- **Rule Tester ([`src/backtester.ts`](command:_github.copilot.openRelativePath?%5B%22src%2Fbacktester.ts%22%5D "src/backtester.ts"))**: This module iterates over historical data and tests multiple strategies.

- **Database ([`src/binance/database.ts`](command:_github.copilot.openRelativePath?%5B%22src%2Fbinance%2Fdatabase.ts%22%5D "src/binance/database.ts"), [`src/coinbase/database.ts`](command:_github.copilot.openRelativePath?%5B%22src%2Fcoinbase%2Fdatabase.ts%22%5D "src/coinbase/database.ts"))**: These modules handle the storage of data in JSON files, as there is no database in this project.

## APIs

The project uses various APIs for different functionalities. Here are some of the key APIs:

- **Sub Account Transfer API**: This API is used to manage the transfers between sub-accounts.

- **Grid Trading API**: This API provides various endpoints for grid trading, including placing, amending, and stopping grid algo orders.

- **Earn/Staking API**: This API provides endpoints for earn offers, staking purchase, and staking redeem.

## Getting Started

To get started with this project, clone the repository and install the dependencies using npm:

```sh
git clone <repository-url>
cd cryptobot
npm install
```

Then, you can start the bot using npm:

```
npm start
```

Please note that you might need to provide your own API keys in the .env files under the src/config/ directory.

## Contributing

Contributions are welcome! Please feel free to submit a pull request.

## License

This project is licensed under the MIT License.
