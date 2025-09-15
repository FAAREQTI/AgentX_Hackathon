from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):

    # Database
    TIDB_HOST: str = Field(..., env="TIDB_HOST")
    TIDB_PORT: int = Field(4000, env="TIDB_PORT")
    TIDB_USER: str = Field(..., env="TIDB_USER")
    TIDB_PASSWORD: str = Field(..., env="TIDB_PASSWORD")
    TIDB_DATABASE: str = Field(..., env="TIDB_DATABASE")
    TIDB_SSL_CA: str = Field("", env="TIDB_SSL_CA")

    # OpenAI
    OPENAI_API_KEY: str = Field(..., env="OPENAI_API_KEY")

    # JWT
    SECRET_KEY: str = Field(..., env="SECRET_KEY")
    ALGORITHM: str = Field("HS256", env="ALGORITHM")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(30, env="ACCESS_TOKEN_EXPIRE_MINUTES")

    # Redis
    REDIS_URL: str = Field("redis://localhost:6379", env="REDIS_URL")

    # Telemetry
    JAEGER_ENDPOINT: str = Field(
        "http://localhost:14268/api/traces", env="JAEGER_ENDPOINT"
    )

    # Application
    ENVIRONMENT: str = Field("development", env="ENVIRONMENT")
    LOG_LEVEL: str = Field("INFO", env="LOG_LEVEL")
    ALLOWED_ORIGINS: List[str] = Field(
        ["http://localhost:3000", "https://localhost:3000"], env="ALLOWED_ORIGINS"
    )

    @property
    def database_url(self) -> str:
        ssl_params = f"?ssl_ca={self.TIDB_SSL_CA}" if self.TIDB_SSL_CA else ""
        return f"mysql+asyncmy://{self.TIDB_USER}:{self.TIDB_PASSWORD}@{self.TIDB_HOST}:{self.TIDB_PORT}/{self.TIDB_DATABASE}{ssl_params}"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
