import os
# import yesg as esg
from src.utils.logger import logger
import yfinance as yf
import pandas as pd


def trigger_yesg_ingestion(tickers: list[str]) -> dict:
    results = {}
    for ticker in tickers:
        try:
            ticker_wrapped = yf.Ticker(ticker)
            logger.info(f"[Ingestion] Processing ticker: {ticker}")
            sustainability = ticker_wrapped.sustainability
            data = pd.DataFrame(sustainability).transpose()
            results[ticker] = data
        except Exception as e:
            print(f"[Ingestion] Error occurred for {ticker}: {e}")
            results[ticker] = {"error": str(e)}

    logger.info(f"[Ingestion] Completed processing {len(tickers)} tickers.")
    logger.info(f"[Ingestion] Results: {results}")
    return results


if __name__ == "__main__":
    popular_tickers = [
        # Expert Picks
        "INTC", "KLAC", "IEX", "FTNT", "LPLA", "LMT", "HCA", "JBHT", "AMAT", "AVGO",

        # Best Performers
        "PLTR", "GEV", "UAL", "TPR", "VST", "RCL", "AXON", "DASH", "JBL", "ORCL",

        # Top S&P 500 Companies
        "NVDA", "MSFT", "AAPL", "GOOGL", "GOOG", "AMZN", "META", "TSLA", "BRK.B", "JPM", "WMT"
    ]
    data = trigger_yesg_ingestion(popular_tickers)
    print(data)
