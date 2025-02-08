import os
import time
import requests
import json
from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from dotenv import load_dotenv

# Import database and models
from app.database import engine, get_db
from app.models.user import User  
from app.schemas.user import LoginRequest, ExchangePublicTokenRequest, TransactionsRequest

# Load environment variables
load_dotenv()

app = FastAPI(title="Plaid Link With Database")

# Allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables if they don't exist
from app.models.user import Base  
Base.metadata.create_all(bind=engine)

# Plaid Credentials
PLAID_CLIENT_ID = os.getenv("PLAID_CLIENT_ID")
PLAID_SECRET = os.getenv("PLAID_SECRET")
PLAID_ENV = "sandbox" 
PLAID_SANDBOX_URL = "https://sandbox.plaid.com"

# Step 1: Validate user login or register user
@app.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):  # ✅ No more attribute errors
    user = db.query(User).filter(User.username == data.username).first()

    if user:
        if user.password != data.password:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        return {"message": "Login successful"}
    else:
        new_user = User(username=data.username, password=data.password)
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return {"message": "User registered successfully"}

# Step 2: Create Plaid Link Token
@app.post("/create_link_token")
def create_link_token():
    if not PLAID_CLIENT_ID or not PLAID_SECRET:
        raise HTTPException(status_code=500, detail="Plaid API credentials not set")

    url = f"{PLAID_SANDBOX_URL}/link/token/create"
    payload = {
        "client_id": PLAID_CLIENT_ID,
        "secret": PLAID_SECRET,
        "user": {"client_user_id": "12345"},
        "client_name": "My Plaid App",
        "products": ["auth", "transactions"],
        "country_codes": ["US"],
        "language": "en",
    }
    response = requests.post(url, json=payload)
    result = response.json()

    if "link_token" not in result:
        raise HTTPException(status_code=400, detail=f"Error creating link token: {result}")

    return {"link_token": result["link_token"]}

# Step 3: Exchange Public Token for Access Token & Store in DB
@app.post("/exchange_public_token")
def exchange_public_token(data: ExchangePublicTokenRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == data.username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    url = f"{PLAID_SANDBOX_URL}/item/public_token/exchange"
    payload = {
        "client_id": PLAID_CLIENT_ID,
        "secret": PLAID_SECRET,
        "public_token": data.public_token,
    }
    response = requests.post(url, json=payload)
    result = response.json()

    if "access_token" not in result:
        raise HTTPException(status_code=400, detail=f"Error exchanging token: {result}")

    # Store the access token in the database
    user.access_token = result["access_token"]
    db.commit()

    return {"message": "Bank linked successfully", "access_token": result["access_token"]}

# # Step 4: Retrieve Transactions Using Stored Access Token
# @app.post("/transactions")
# def get_transactions(data: TransactionsRequest, db: Session = Depends(get_db)):
#     user = db.query(User).filter(User.username == data.username).first()
#     if not user or not user.access_token:
#         raise HTTPException(status_code=404, detail="No access token found. Link a bank account first.")

#     access_token = user.access_token

#     ### Step 1: Fetch Accounts to Get the Correct Account ID ###
#     accounts_url = f"{PLAID_SANDBOX_URL}/accounts/get"
#     accounts_payload = {
#         "client_id": PLAID_CLIENT_ID,
#         "secret": PLAID_SECRET,
#         "access_token": access_token
#     }

#     response = requests.post(accounts_url, json=accounts_payload)
#     accounts_response = response.json()

#     if "accounts" not in accounts_response:
#         raise HTTPException(status_code=400, detail=f"Error fetching accounts: {accounts_response}")

#     # Extract the first valid account_id dynamically
#     account_id = accounts_response["accounts"][0]["account_id"]

#     ### Step 2: Fire Webhook to Simulate Transactions Data Ready ###
#     webhook_url = f"{PLAID_SANDBOX_URL}/sandbox/item/fire_webhook"
#     webhook_payload = {
#         "client_id": PLAID_CLIENT_ID,
#         "secret": PLAID_SECRET,
#         "access_token": access_token,
#         "webhook_code": "DEFAULT_UPDATE"
#     }

#     response = requests.post(webhook_url, json=webhook_payload)
#     webhook_response = response.json()

#     ### Step 3: Retry Fetching Transactions Until Data is Available ###
#     max_retries = 5
#     retry_wait = 5  # Wait time in seconds

#     for attempt in range(max_retries):
#         print(f"🔄 Attempt {attempt + 1}: Fetching transactions...")

#         transactions_url = f"{PLAID_SANDBOX_URL}/transactions/get"
#         transactions_payload = {
#             "client_id": PLAID_CLIENT_ID,
#             "secret": PLAID_SECRET,
#             "access_token": access_token,
#             "start_date": "2025-02-01",
#             "end_date": "2025-02-05",
#             "options": {
#                 "account_ids": [account_id]
#             }
#         }

#         response = requests.post(transactions_url, json=transactions_payload)
#         transactions_response = response.json()

#         if "transactions" in transactions_response and transactions_response["transactions"]:
#             print("✅ Transactions found!")
#             return {"transactions": transactions_response["transactions"]}

#         print("⌛ Waiting for transactions to populate...")
#         time.sleep(retry_wait)

#     # If transactions are still empty after retries
#     raise HTTPException(status_code=400, detail="Error fetching transactions after multiple retries.")