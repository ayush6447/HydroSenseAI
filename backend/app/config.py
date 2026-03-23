from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    secret_key: str
    access_token_expire_minutes: int = 30
    model_dir: str = "./saved_models"
    aws_s3_bucket: str = ""

    class Config:
        env_file = ".env"

settings = Settings()
