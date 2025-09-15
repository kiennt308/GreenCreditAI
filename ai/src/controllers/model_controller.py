import os
import pandas as pd
from sklearn import preprocessing
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score, mean_squared_error, root_mean_squared_error
from sklearn.model_selection import RandomizedSearchCV
# from src.utils.logger import logger
import joblib


def train_model_esg_overall(df: pd.DataFrame, model_dir: str = "./trained_models") -> str:
    # Placeholder for model training logic
    print(df.head())

    df['GrowthRate'] = df['GrowthRate'].fillna(df['GrowthRate'].mean())

    le = preprocessing.LabelEncoder()
    df['NewCompanyName'] = le.fit_transform(df.CompanyName)

    col = ['Industry', 'Region', 'Year', 'Revenue', 'ProfitMargin', 'MarketCap',
       'GrowthRate', 'CarbonEmissions', 'WaterUsage', 'EnergyConsumption']

    df_X = df[col]
    le = LabelEncoder()
    df_X['Industry'] = le.fit_transform(df_X['Industry'])
    df_X['Region'] = le.fit_transform(df_X['Region'])

    df_Y = df['ESG_Overall']
    x_train, x_test, y_train, y_test = train_test_split(
        df_X, df_Y, test_size=0.22, random_state=42)

    print("Model training started.")
    # Random Forest Regression
    rf = RandomForestRegressor()
    # Hyperparameter grid
    param_dist = {
        'n_estimators': [100, 200, 500],
        'max_depth': [None, 10, 20, 30],
        'min_samples_split': [2, 5, 10],
        'min_samples_leaf': [1, 2, 4],
        'max_features': ['auto', 'sqrt'],
        'bootstrap': [True, False]
    }

    random_search = RandomizedSearchCV(
        estimator=rf,
        param_distributions=param_dist,
        n_iter=50,
        cv=5,
        verbose=2,
        scoring='r2',
        random_state=42,
        n_jobs=-1
    )
    
    random_search.fit(x_train, y_train)
    best_rf = random_search.best_estimator_

    # Evaluate
    y_pred = best_rf.predict(x_test)
    r2 = r2_score(y_test, y_pred)
    mse = mean_squared_error(y_test, y_pred)
    rmse = root_mean_squared_error(y_test, y_pred)
    mae = mean_absolute_error(y_test, y_pred)

    print("Best Parameters:", random_search.best_params_)
    print(f"R² Score: {r2:.2f}")
    print(f"MSE: {mse:.2f}")
    print(f"MAE: {mae:.2f}")
    print(f"RMSE: {rmse:.2f}")

    final_rf = RandomForestRegressor(**random_search.best_params_, random_state=42)
    final_rf.fit(df_X, df_Y)

    print("Saving the trained model...")
    os.makedirs(model_dir, exist_ok=True)
    model_path = os.path.join(model_dir, "model.joblib")
    joblib.dump(final_rf, model_path)
    print(f"[INFO] Saved model to {model_path}")

    print("Model training completed.")
    return model_path

def train_model_market_cap(df: pd.DataFrame, model_dir: str = "./trained_models") -> None:
    # Placeholder for model training logic
    print(df.head())
    col = ['Industry', 'Region', 'Year', 'Revenue', 'ProfitMargin', 'GrowthRate',
           'ESG_Overall', 'CarbonEmissions',  'WaterUsage', 'EnergyConsumption']
    df['GrowthRate'] = df['GrowthRate'].fillna(df['GrowthRate'].mean())
    
    df_X = df[col]
    df_Y = df['MarketCap']

    le = LabelEncoder()
    df_X['Industry'] = le.fit_transform(df_X['Industry'])
    df_X['Region'] = le.fit_transform(df_X['Region'])


    x_train, x_test, y_train, y_test = train_test_split(
        df_X, df_Y, test_size=.25, random_state=100)
    x_train.shape, x_test.shape, y_train.shape, y_test.shape

    param_dist = {
        'n_estimators': [100, 200, 300],
        'learning_rate': [0.01, 0.05, 0.1, 0.2],
        'max_depth': [3, 5, 7],
        'subsample': [0.8, 1.0],
        'min_samples_split': [2, 5, 10],
        'min_samples_leaf': [1, 2, 4]
    }

    gbr = GradientBoostingRegressor(random_state=42)

    random_search = RandomizedSearchCV(
        gbr, param_distributions=param_dist,
        n_iter=50, cv=5, scoring='r2', n_jobs=-1, verbose=2, random_state=42
    )

    random_search.fit(x_train, y_train)
    best_gbr = random_search.best_estimator_
    
    y_pred = best_gbr.predict(x_test)  # or gbr.predict(X_test)

    r2 = r2_score(y_test, y_pred)
    mse = mean_squared_error(y_test, y_pred)
    rmse = root_mean_squared_error(y_test, y_pred)
    mae = mean_absolute_error(y_test, y_pred)
    
    print(f"R² Score: {r2:.4f}")
    print(f"MSE: {mse:.4f}")
    print(f"RMSE: {rmse:.4f}")
    print(f"MAE: {mae:.4f}")


def predict_esg_overall(model_path: str, input_data: dict) -> dict:
    # Load the trained model
    model = joblib.load(model_path)
    # Make predictions
    predictions = model.predict(input_data)
    return pd.Series(predictions)

# https://www.kaggle.com/code/nayanspatil/esg-financial-performance#Predicting-ESG_Overall
if __name__ == "__main__":
    df = pd.read_csv(
        f'D:/projects/GreenCreditAI/ai/data/company_esg_financial_dataset.csv')
    train_model_esg_overall(df)
