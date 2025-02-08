from sqlalchemy import Column, Integer, String, Float, Boolean
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)
    saving_goal = Column(Float, nullable=True)
    amount = Column(Float, nullable=True)
    time_months = Column(Integer, nullable=True)
    income = Column(Float, nullable=True)
    top_spender = Column(String, nullable=True)
    top2_spender = Column(String, nullable=True)
    day_paid = Column(String, nullable=True)
    is_alert = Column(Boolean, nullable=True)
    alert_transaction = Column(String, nullable=True)
    access_token = Column(String, nullable=True)

