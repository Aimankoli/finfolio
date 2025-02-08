import os
import time
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
import requests
import json
from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import extract
from dotenv import load_dotenv
from collections import Counter
from sqlalchemy import func

# Import database and models
from app.database import engine, get_db
from app.models.user import User  
from app.models.transaction import Transaction
from app.schemas.user import LoginRequest, ExchangePublicTokenRequest

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
# from app.models.user import Base  
# Base.metadata.create_all(bind=engine)

from app.models import user, transaction

user.Base.metadata.create_all(bind=engine)
transaction.Base.metadata.create_all(bind=engine)

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

from app.schemas.user import SetGoalRequest

@app.post("/set_goal")
def set_goal(data: SetGoalRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == data.username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    
    user.amount = data.amount
    user.time_months = data.time_months
    saving_per_month = data.amount / data.time_months
    user.saving_goal = saving_per_month
    db.commit()


    return {"message": "Goal set successfully", "saving_goal": user.saving_goal}

@app.post("/top_spenders")
def get_top_spender(username: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get all transactions with categories
    transactions = db.query(Transaction).filter(
        Transaction.category.isnot(None)
    ).all()

    if not transactions:
        return {"message": "No transactions found"}

    # Flatten categories and count them
    all_categories = []
    for transaction in transactions:
        # Handle string representation of list
        if isinstance(transaction.category, str):
            # Remove brackets and quotes, split by comma
            categories = transaction.category.strip('[]').replace('"', '').split(',')
            # Clean up whitespace
            categories = [cat.strip() for cat in categories]
            all_categories.extend(categories)
        elif isinstance(transaction.category, list):
            all_categories.extend(transaction.category)

    # Count categories
    category_counts = Counter(all_categories)
    
    # Get top 2 most common categories
    top_categories = category_counts.most_common(2)
    
    if len(top_categories) < 2:
        return {"message": "Not enough categories found"}

    # Update user's top spender fields
    user.top_spender = top_categories[0][0]  # First most common category
    user.top2_spender = top_categories[1][0]  # Second most common category
    db.commit()

    return {
        "message": "Top spenders updated",
        "top_spender": user.top_spender,
        "top2_spender": user.top2_spender,
        "top_spender_count": top_categories[0][1],
        "top2_spender_count": top_categories[1][1]
    }

@app.post("/day_paid")
def get_day_paid(username: str, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    #get current time
    now = datetime.now()
    prev_month = now - relativedelta(months=1)
    current_year = prev_month.year
    current_month = prev_month.month

    #debug
    all_transactions = db.query(Transaction).filter(
        Transaction.amount<0
    ).all()
    print(f"Found {len(all_transactions)} total negative transactions")

    #query
    incoming_transaction = db.query(Transaction).filter(
        Transaction.amount<0,
        extract('year', Transaction.date) == current_year,
        extract('month', Transaction.date) == current_month
    ).order_by(Transaction.date).first()

    if not incoming_transaction:
        return {"message": "No transaction found"}
    
    day = incoming_transaction.date.day

    user.day_paid = day

    db.commit()

    return {"message": "Day Paid", "day_paid": user.day_paid}

@app.post("/alert")
def get_alert():
    return {"message": "Alert"}

@app.get("/transactions")
def get_transactions(db: Session = Depends(get_db)):
    # Calculate date 30 days ago
    thirty_days_ago = datetime.now() - timedelta(days=30)
    
    # Query transactions
    transactions = db.query(Transaction).filter(
        Transaction.date >= thirty_days_ago
    ).order_by(Transaction.date.desc()).all()
    
    if not transactions:
        return {"message": "No transactions found"}
    
    # Format transactions for response
    transactions_list = []
    for tx in transactions:
        transactions_list.append({
            "date": tx.date.strftime("%Y-%m-%d"),
            "amount": tx.amount,
            "category": tx.category,
        })
    
    return {
        "message": "Transactions retrieved successfully",
        "transactions": transactions_list,
        "total_count": len(transactions_list)
    }

@app.get("graph_data")
def get_graph_data(db: Session = Depends(get_db)):
    pass

