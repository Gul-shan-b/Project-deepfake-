from fastapi import FastAPI
from pydantic import BaseModel
from predict import predict

app = FastAPI()
@app.get("/")
def home():
    return {"message": "API is working 🚀"}

class Input(BaseModel):
    text: str

@app.post("/analyze")
def analyze(data: Input):
    return predict(data.text)