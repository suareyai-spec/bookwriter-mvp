#!/bin/bash
# Alpaca Paper Trading Helper
# Usage: ./trade.sh <action> [args]

source "$(dirname "$0")/.env"

HEADERS="-H 'APCA-API-KEY-ID: $ALPACA_API_KEY' -H 'APCA-API-SECRET-KEY: $ALPACA_SECRET_KEY'"
BASE="$ALPACA_BASE_URL/v2"

case "$1" in
  account)
    eval curl -s $HEADERS "$BASE/account" | jq '{buying_power, cash, equity, portfolio_value, pattern_day_trader, daytrade_count}'
    ;;
  positions)
    eval curl -s $HEADERS "$BASE/positions" | jq '.[] | {symbol, qty, avg_entry_price, current_price, unrealized_pl, unrealized_plpc}'
    ;;
  orders)
    eval curl -s $HEADERS "$BASE/orders?status=open" | jq '.[] | {id, symbol, side, type, qty, limit_price, status, submitted_at}'
    ;;
  order-history)
    eval curl -s $HEADERS "$BASE/orders?status=all&limit=20" | jq '.[] | {id, symbol, side, type, qty, filled_avg_price, status, filled_at}'
    ;;
  buy-stock)
    # ./trade.sh buy-stock AAPL 10 [limit_price]
    SYMBOL=$2; QTY=$3; LIMIT=$4
    if [ -z "$LIMIT" ]; then
      eval curl -s -X POST $HEADERS -H "'Content-Type: application/json'" \
        -d "'{\"symbol\":\"$SYMBOL\",\"qty\":\"$QTY\",\"side\":\"buy\",\"type\":\"market\",\"time_in_force\":\"day\"}'" \
        "$BASE/orders"
    else
      eval curl -s -X POST $HEADERS -H "'Content-Type: application/json'" \
        -d "'{\"symbol\":\"$SYMBOL\",\"qty\":\"$QTY\",\"side\":\"buy\",\"type\":\"limit\",\"limit_price\":\"$LIMIT\",\"time_in_force\":\"day\"}'" \
        "$BASE/orders"
    fi | jq '{id, symbol, side, type, qty, limit_price, status}'
    ;;
  sell-stock)
    # ./trade.sh sell-stock AAPL 10 [limit_price]
    SYMBOL=$2; QTY=$3; LIMIT=$4
    if [ -z "$LIMIT" ]; then
      eval curl -s -X POST $HEADERS -H "'Content-Type: application/json'" \
        -d "'{\"symbol\":\"$SYMBOL\",\"qty\":\"$QTY\",\"side\":\"sell\",\"type\":\"market\",\"time_in_force\":\"day\"}'" \
        "$BASE/orders"
    else
      eval curl -s -X POST $HEADERS -H "'Content-Type: application/json'" \
        -d "'{\"symbol\":\"$SYMBOL\",\"qty\":\"$QTY\",\"side\":\"sell\",\"type\":\"limit\",\"limit_price\":\"$LIMIT\",\"time_in_force\":\"day\"}'" \
        "$BASE/orders"
    fi | jq '{id, symbol, side, type, qty, limit_price, status}'
    ;;
  buy-option)
    # ./trade.sh buy-option "AAPL250321C00230000" 1 [limit_price]
    # Option symbol format: AAPL250321C00230000 = AAPL Mar 21 2025 Call $230
    SYMBOL=$2; QTY=$3; LIMIT=$4
    if [ -z "$LIMIT" ]; then
      eval curl -s -X POST $HEADERS -H "'Content-Type: application/json'" \
        -d "'{\"symbol\":\"$SYMBOL\",\"qty\":\"$QTY\",\"side\":\"buy\",\"type\":\"market\",\"time_in_force\":\"day\"}'" \
        "$BASE/orders"
    else
      eval curl -s -X POST $HEADERS -H "'Content-Type: application/json'" \
        -d "'{\"symbol\":\"$SYMBOL\",\"qty\":\"$QTY\",\"side\":\"buy\",\"type\":\"limit\",\"limit_price\":\"$LIMIT\",\"time_in_force\":\"day\"}'" \
        "$BASE/orders"
    fi | jq '.'
    ;;
  sell-option)
    SYMBOL=$2; QTY=$3; LIMIT=$4
    if [ -z "$LIMIT" ]; then
      eval curl -s -X POST $HEADERS -H "'Content-Type: application/json'" \
        -d "'{\"symbol\":\"$SYMBOL\",\"qty\":\"$QTY\",\"side\":\"sell\",\"type\":\"market\",\"time_in_force\":\"day\"}'" \
        "$BASE/orders"
    else
      eval curl -s -X POST $HEADERS -H "'Content-Type: application/json'" \
        -d "'{\"symbol\":\"$SYMBOL\",\"qty\":\"$QTY\",\"side\":\"sell\",\"type\":\"limit\",\"limit_price\":\"$LIMIT\",\"time_in_force\":\"day\"}'" \
        "$BASE/orders"
    fi | jq '.'
    ;;
  cancel)
    # ./trade.sh cancel <order_id>
    eval curl -s -X DELETE $HEADERS "$BASE/orders/$2" 
    ;;
  cancel-all)
    eval curl -s -X DELETE $HEADERS "$BASE/orders"
    ;;
  quote)
    # ./trade.sh quote AAPL
    eval curl -s $HEADERS "https://data.alpaca.markets/v2/stocks/$2/quotes/latest" | jq '{ask_price: .quote.ap, bid_price: .quote.bp, ask_size: .quote.as, bid_size: .quote.bs}'
    ;;
  bars)
    # ./trade.sh bars AAPL
    eval curl -s $HEADERS "https://data.alpaca.markets/v2/stocks/$2/bars/latest?feed=iex" | jq '{open: .bar.o, high: .bar.h, low: .bar.l, close: .bar.c, volume: .bar.v}'
    ;;
  option-chain)
    # ./trade.sh option-chain AAPL 2026-03-07
    eval curl -s $HEADERS "https://paper-api.alpaca.markets/v2/options/contracts?underlying_symbols=$2&expiration_date=$3&limit=50" | jq '.option_contracts[] | {symbol, expiration_date, strike_price, type, status}'
    ;;
  *)
    echo "Usage: ./trade.sh <command>"
    echo "Commands: account, positions, orders, order-history, buy-stock, sell-stock, buy-option, sell-option, cancel, cancel-all, quote, bars, option-chain"
    ;;
esac
