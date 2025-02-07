import os
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

app = FastAPI(title="Simple Plaid Login Example")

# Allow CORS from common localhost origins so our frontend (even if served separately) can call our API.
origins = [
    "http://localhost",
    "http://localhost:8000",
    "http://127.0.0.1",
    "http://127.0.0.1:5500",  # adjust if needed
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Plaid configuration
PLAID_CLIENT_ID = os.getenv("PLAID_CLIENT_ID")
PLAID_SECRET = os.getenv("PLAID_SECRET")
PLAID_SANDBOX_URL = "https://sandbox.plaid.com"

# Pydantic model for the login request.
class LoginRequest(BaseModel):
    username: str
    password: str

@app.post("/login")
def login(data: LoginRequest):
    # Check the dummy credentials.
    if data.username != "user_good" or data.password != "pass_good":
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # --- Step 1: Create a Sandbox Public Token ---
    public_token_url = f"{PLAID_SANDBOX_URL}/sandbox/public_token/create"
    public_token_payload = {
        "client_id": PLAID_CLIENT_ID,
        "secret": PLAID_SECRET,
        "institution_id": "ins_109512",  # sample institution id provided by Plaid sandbox
        "initial_products": ["transactions"]
    }
    pt_response = requests.post(public_token_url, json=public_token_payload)
    pt_data = pt_response.json()
    if "public_token" not in pt_data:
        raise HTTPException(status_code=400, detail=f"Error creating public token: {pt_data}")

    public_token = pt_data["public_token"]

    # --- Step 2: Exchange the Public Token for an Access Token ---
    exchange_url = f"{PLAID_SANDBOX_URL}/item/public_token/exchange"
    exchange_payload = {
        "client_id": PLAID_CLIENT_ID,
        "secret": PLAID_SECRET,
        "public_token": public_token
    }
    ex_response = requests.post(exchange_url, json=exchange_payload)
    ex_data = ex_response.json()
    if "access_token" not in ex_data:
        raise HTTPException(status_code=400, detail=f"Error exchanging public token: {ex_data}")

    access_token = ex_data["access_token"]

    # --- Step 3: Fetch Accounts to Get the First Account's Details ---
    accounts_url = f"{PLAID_SANDBOX_URL}/accounts/get"
    accounts_payload = {
        "client_id": PLAID_CLIENT_ID,
        "secret": PLAID_SECRET,
        "access_token": access_token
    }
    acc_response = requests.post(accounts_url, json=accounts_payload)
    acc_data = acc_response.json()
    if "accounts" not in acc_data or not acc_data["accounts"]:
        raise HTTPException(status_code=400, detail=f"Error fetching accounts: {acc_data}")

    # Get the first account details.
    account = acc_data["accounts"][0]
    account_id = account.get("account_id", "N/A")
    account_name = account.get("name", "N/A")
    account_mask = account.get("mask", "N/A")

    # Return a simple JSON response.
    return {
        "message": "Logged in and connected to bank successfully.",
        "account": {
            "account_id": account_id,
            "name": account_name,
            "mask": account_mask,
        }
    }

@app.get("/")
def root():
    return {"message": "Simple Plaid Login API. Use POST /login with your credentials."}
