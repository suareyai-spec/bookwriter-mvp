#!/usr/bin/env python3
"""Kalshi API trading client"""
import json, sys, time, datetime, hashlib, base64
from urllib.request import Request, urlopen
from urllib.error import HTTPError

# Try cryptography library first, fall back to basic JWT
try:
    from cryptography.hazmat.primitives import hashes, serialization
    from cryptography.hazmat.primitives.asymmetric import padding, utils
    HAS_CRYPTO = True
except ImportError:
    HAS_CRYPTO = False

API_KEY = "4a2b2edf-3f37-4e9f-ab1b-399d8d955517"
KEY_FILE = "/home/suareyai/.openclaw/workspace/alpaca-trader/kalshi_key.pem"
HOST = "https://api.elections.kalshi.com"
BASE_PATH = "/trade-api/v2"

def load_key():
    with open(KEY_FILE, 'rb') as f:
        return serialization.load_pem_private_key(f.read(), password=None)

def sign_request(method, path, timestamp):
    """Sign request per Kalshi's API spec"""
    private_key = load_key()
    # Strip query params for signing
    path_without_query = path.split('?')[0]
    message = f"{timestamp}{method}{path_without_query}".encode('utf-8')
    signature = private_key.sign(
        message,
        padding.PSS(
            mgf=padding.MGF1(hashes.SHA256()),
            salt_length=padding.PSS.DIGEST_LENGTH
        ),
        hashes.SHA256()
    )
    return base64.b64encode(signature).decode('utf-8')

def api_call(method, path, data=None):
    full_path = BASE_PATH + path
    timestamp = str(int(time.time() * 1000))
    sig = sign_request(method, full_path, timestamp)
    
    url = HOST + full_path
    headers = {
        "KALSHI-ACCESS-KEY": API_KEY,
        "KALSHI-ACCESS-SIGNATURE": sig,
        "KALSHI-ACCESS-TIMESTAMP": timestamp,
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    
    body = json.dumps(data).encode() if data else None
    req = Request(url, data=body, headers=headers, method=method)
    
    try:
        with urlopen(req) as resp:
            return json.loads(resp.read())
    except HTTPError as e:
        error_body = e.read().decode()
        return {"error": e.code, "message": error_body}

def get_balance():
    return api_call("GET", "/portfolio/balance")

def get_positions():
    return api_call("GET", "/portfolio/positions")

def get_events(query=""):
    path = f"/events?limit=20&status=open"
    if query:
        path += f"&series_ticker={query}"
    return api_call("GET", path)

def get_markets(event_ticker="", query=""):
    path = "/markets?limit=20&status=open"
    if event_ticker:
        path += f"&event_ticker={event_ticker}"
    return api_call("GET", path)

def get_market(ticker):
    return api_call("GET", f"/markets/{ticker}")

def place_order(ticker, side, count, price_cents):
    """Place an order. side='yes' or 'no', price in cents (1-99)"""
    data = {
        "ticker": ticker,
        "action": "buy",
        "side": side,
        "count": count,
        "type": "limit",
        "yes_price": price_cents if side == "yes" else None,
        "no_price": price_cents if side == "no" else None,
    }
    # Remove None values
    data = {k: v for k, v in data.items() if v is not None}
    return api_call("POST", "/portfolio/orders", data)

def get_orders():
    return api_call("GET", "/portfolio/orders?status=resting")

def cancel_order(order_id):
    return api_call("DELETE", f"/portfolio/orders/{order_id}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 kalshi.py <command> [args]")
        print("Commands: balance, positions, events, markets, market <ticker>, buy <ticker> <yes|no> <count> <price_cents>, orders, cancel <order_id>")
        sys.exit(1)
    
    cmd = sys.argv[1]
    
    if cmd == "balance":
        print(json.dumps(get_balance(), indent=2))
    elif cmd == "positions":
        print(json.dumps(get_positions(), indent=2))
    elif cmd == "events":
        query = sys.argv[2] if len(sys.argv) > 2 else ""
        print(json.dumps(get_events(query), indent=2))
    elif cmd == "markets":
        query = sys.argv[2] if len(sys.argv) > 2 else ""
        print(json.dumps(get_markets(query), indent=2))
    elif cmd == "market":
        print(json.dumps(get_market(sys.argv[2]), indent=2))
    elif cmd == "buy":
        ticker, side, count, price = sys.argv[2], sys.argv[3], int(sys.argv[4]), int(sys.argv[5])
        print(json.dumps(place_order(ticker, side, count, price), indent=2))
    elif cmd == "orders":
        print(json.dumps(get_orders(), indent=2))
    elif cmd == "cancel":
        print(json.dumps(cancel_order(sys.argv[2]), indent=2))
    else:
        print(f"Unknown command: {cmd}")
