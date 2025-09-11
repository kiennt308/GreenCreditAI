import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error
import joblib  # Để lưu model

# Load dữ liệu từ file CSV
data = pd.read_csv('esg_data.csv')
X = data[['revenue', 'emissions']]
y = data['credit_score']

# Split và train
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Đánh giá
predictions = model.predict(X_test)
mse = mean_squared_error(y_test, predictions)
print(f"Mean Squared Error: {mse}")

# Lưu model
joblib.dump(model, 'esg_model.pkl')