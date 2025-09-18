import kfp
from kfp import dsl
from kfp.dsl import component

@component(
    base_image="python:3.10",
    packages_to_install=["pandas", "scikit-learn", "joblib", "boto3"]
)
def train_component(bucket: str, csv_key: str, model_bucket: str, model_key: str) -> str:
    import os
    import boto3
    import pandas as pd
    from sklearn import preprocessing
    from sklearn.preprocessing import LabelEncoder
    from sklearn.model_selection import train_test_split
    from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
    from sklearn.metrics import mean_absolute_error, r2_score, mean_squared_error, root_mean_squared_error
    from sklearn.model_selection import RandomizedSearchCV
    import joblib

    # MinIO client
    s3 = boto3.client(
        "s3",
        endpoint_url="http://minio-service.kubeflow:9000",
        aws_access_key_id="minio",
        aws_secret_access_key="minio123"
    )

    # Download dataset
    local_csv = "/tmp/data.csv"
    s3.download_file(bucket, csv_key, local_csv)
    df = pd.read_csv(local_csv)

    # Train
    model_dir = "/tmp/model"
    
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
        model_path = os.path.join(model_dir, "model_esg_overall.joblib")
        joblib.dump(final_rf, model_path)
        print(f"[INFO] Saved model to {model_path}")

        print("Model training completed.")
        return model_path
    
    model_path = train_model_esg_overall(df, model_dir=model_dir)

    # Upload model back
    s3.upload_file(model_path, model_bucket, model_key)
    print(f"[INFO] Model uploaded to s3://{model_bucket}/{model_key}")

    return f"s3://{model_bucket}/{model_key}"


@dsl.pipeline(
    name="ESG Training Pipeline",
    description="Train and export ESG RandomForest model"
)
def esg_pipeline(
    bucket: str = "datasets",
    csv_key: str = "company_esg_financial_dataset.csv",
    model_bucket: str = "models",
    model_key: str = "esg/model_esg_overall.joblib"
):
    train_component(
        bucket=bucket,
        csv_key=csv_key,
        model_bucket=model_bucket,
        model_key=model_key
    )
