import sys
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error
import joblib
import os

MODEL_PATH = "esg_model.pkl"
DATA_PATH = "esg_data.csv"


def train_model():
    """Train model từ dữ liệu CSV và lưu vào file pkl"""
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Không tìm thấy file dữ liệu: {DATA_PATH}")

    data = pd.read_csv(DATA_PATH)
    X = data[['revenue', 'emissions']]
    y = data['credit_score']

    # Train model
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    # Đánh giá
    predictions = model.predict(X_test)
    mse = mean_squared_error(y_test, predictions)
    print(f"[INFO] Model trained. MSE = {mse}")

    # Lưu model
    joblib.dump(model, MODEL_PATH)


def predict_esg(revenue: float, emissions: float) -> float:
    """Dự đoán ESG score từ revenue và emissions"""
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError("Model chưa được train. Hãy chạy: python ai_model.py train")

    loaded_model = joblib.load(MODEL_PATH)
    input_data = pd.DataFrame({'revenue': [revenue], 'emissions': [emissions]})
    return float(loaded_model.predict(input_data)[0])


if __name__ == "__main__":
    # python ai_model.py train
    if len(sys.argv) == 2 and sys.argv[1] == "train":
        train_model()

    # python ai_model.py <revenue> <emissions>
    elif len(sys.argv) == 3:
        revenue = float(sys.argv[1])
        emissions = float(sys.argv[2])
        print(predict_esg(revenue, emissions))  # ✅ chỉ in số duy nhất

    else:
        print("Usage:")
        print("  Train model: python ai_model.py train")
        print("  Predict:     python ai_model.py <revenue> <emissions>")
