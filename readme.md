# CryptoBot Project

Welcome to the CryptoBot project, an algorithmic trading bot built with JavaScript. This project was initially developed in 2019 and has recently been published in a new repository. The bot uses technical indicators to return trading analysis data and a rule tester to iterate over historical data and test multiple strategies.

_As of 2020, the code in this repository has not been updated. The project transitioned into a maintenance phase and has undergone multiple refactorings in separate repositories to enhance its modularity, making it easier to incorporate new exchanges or custom-built strategies. These updates include the utilization of TypeScript, integration of MongoDB for database management, and employment of workers for various tasks. These changes are not reflected in this repository, but it has been published to showcase the original version of the project._

## Key Components

- **Technical Indicators ([`src/indicators/`](command:_github.copilot.openRelativePath?%5B%22src%2Findicators%2F%22%5D "src/indicators/"))**: This module returns trading analysis data based on a ticker and timestamp.

- **Rule Tester ([`src/backtester.ts`](command:_github.copilot.openRelativePath?%5B%22src%2Fbacktester.ts%22%5D "src/backtester.ts"))**: This module iterates over historical data and tests multiple strategies.

- **Database ([`src/binance/database.ts`](command:_github.copilot.openRelativePath?%5B%22src%2Fbinance%2Fdatabase.ts%22%5D "src/binance/database.ts"), [`src/coinbase/database.ts`](command:_github.copilot.openRelativePath?%5B%22src%2Fcoinbase%2Fdatabase.ts%22%5D "src/coinbase/database.ts"))**: These modules handle the storage of data in JSON files, as there is no database in this project.

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
