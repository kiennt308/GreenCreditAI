from kfp import Client
from controllers.model_controller import train_model_esg_overall
from controllers.esg_pipeline import esg_pipeline

client = Client(host="http://localhost:8080")  # Replace with your KFP endpoint


def create_training_pipeline(csv_path: str, model_dir: str) -> None:
    experiment = client.create_experiment(name="esg-experiment")

    run = client.create_run_from_pipeline_package(
        pipeline_file="esg_pipeline.yaml",
        arguments={},
        experiment_id=experiment.id
    )
    print(f"Pipeline run ID: {run.id}")
    print(f"Pipeline run details: {run.to_dict()}")
    

if __name__ == "__main__":
    create_training_pipeline(
        csv_path="/mnt/data/company_esg_financial_dataset.csv",
        model_dir="/mnt/models/esg-model"
    )