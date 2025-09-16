# Complaint Compass 
Complaint Compass is a multi-tenant complaint analysis platform with AI-powered risk assessment and solution generation. This project is a full-stack application with a backend API built with FastAPI and a modern frontend using Next.js, shadcn/ui, and Tailwind CSS.

## Features

- **Multi-Agent AI Workflow**: 6-stage complaint processing pipeline
- **Multi-Tenant Architecture**: Secure tenant isolation with RBAC
- **Vector Search**: Semantic complaint similarity using embeddings
- **Risk Assessment**: XGBoost-based risk prediction model
- **Real-time Analytics**: HTAP queries with TiDB Cloud Serverless
- **Enterprise Security**: JWT authentication, audit logging, compliance
- **Observability**: OpenTelemetry tracing with Jaeger integration
- **Modern Frontend**: A responsive, accessible dashboard built with Next.js, shadcn/ui, and Tailwind CSS.

## Architecture

### Multi-Agent Workflow

1. **Complaint Reader**: Entity extraction + PII redaction + embeddings
2. **Complaint Sorter**: Classification using LLM + historical validation
3. **Stats Finder**: Vector similarity search + OLAP benchmarking
4. **Risk Checker**: XGBoost risk prediction + explainable factors
5. **Solution Helper**: Context-aware response generation
6. **Feedback Logger**: Continuous learning from user feedback

### Technology Stack

- **Framework**: FastAPI with async/await
- **Frontend**: Next.js with React.
- **UI Library**: shadcn/ui.
- **Styling**: Tailwind CSS.
- **Database**: TiDB Cloud Serverless (MySQL-compatible)
- **AI/ML**: OpenAI GPT-4, XGBoost, scikit-learn
- **Vector Store**: TiDB VECTOR columns with HNSW indexing
- **Caching**: Redis for session management
- **Observability**: OpenTelemetry + Jaeger
- **Authentication**: JWT with RBAC

## Quick Start

### Prerequisites

- Python 3.11+
- TiDB Cloud Serverless account
- OpenAI API key
- Redis (optional, for caching)

### Installation

```bash
# Clone and setup
git clone <repository>
cd backend

# Install dependencies
make install

# Copy environment file
cp .env.example .env
# Edit .env with your credentials

# Initialize database
make init-db

# Run development server
make dev
```

### Frontend Installation (/frontend)
# Navigate to the frontend directory.

```Bash

cd ../frontend
Install dependencies.
```
```Bash

npm install
Configure your environment variables to point to the backend API.
```
```Bash

cp .env.example .env.local
# Configure the API URL in .env.local
# NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
Run the development server.
```
```Bash

npm run dev
The frontend application will be available at http://localhost:3000.
```

### Docker Setup

```bash
# Build and run with Docker Compose
make compose-up

# Or build manually
make docker-build
make docker-run
```

## API Documentation

### Authentication

```bash
# Register user
POST /api/v1/auth/register
{
  "email": "user@company.com",
  "password": "secure_password",
  "first_name": "John",
  "last_name": "Doe",
  "tenant_id": "bank-a",
  "role": "analyst"
}

# Login
POST /api/v1/auth/login
{
  "email": "user@company.com",
  "password": "secure_password",
  "tenant_id": "bank-a"
}
```

### Complaint Processing

```bash
# Submit complaint (triggers AI workflow)
POST /api/v1/complaints/
{
  "narrative": "I was charged $50 for a service I never used...",
  "product": "credit_card",
  "issue": "unauthorized_charges",
  "company": "Bank ABC"
}

# Get AI analysis
GET /api/v1/complaints/{id}/analysis
```

### Analytics & Stats

```bash
# Get tenant statistics
GET /api/v1/stats/
?start_date=2024-01-01&end_date=2024-12-31&product=credit_card

# Get benchmarks
GET /api/v1/stats/benchmarks
?tenant_id=bank-a
```

## Database Schema

### Core Tables

```sql
-- Multi-tenant complaint storage with vector embeddings
CREATE TABLE complaints_raw (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36),
    narrative TEXT NOT NULL,
    product VARCHAR(255),
    issue VARCHAR(255), 
    company VARCHAR(255),
    embedding VECTOR(1536),  -- OpenAI ada-002 embeddings
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_tenant_created (tenant_id, created_at),
    INDEX idx_embedding (embedding) USING HNSW
);

-- AI classification results
CREATE TABLE complaints_labels (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    complaint_id BIGINT,
    tenant_id VARCHAR(36),
    product VARCHAR(255),
    issue VARCHAR(255),
    company VARCHAR(255),
    confidence FLOAT,
    FOREIGN KEY (complaint_id) REFERENCES complaints_raw(id)
);

-- XGBoost risk predictions
CREATE TABLE risk_scores (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    complaint_id BIGINT,
    tenant_id VARCHAR(36),
    risk FLOAT,
    category VARCHAR(50),
    factors JSON,
    model_version VARCHAR(50),
    confidence FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Multi-Tenant Security

### Tenant Isolation

- All queries filtered by `tenant_id`
- JWT tokens include tenant context
- Row-level security enforcement
- Audit logging for compliance

### RBAC Roles

- **Consumer**: File complaints, view own data
- **Analyst**: Access dashboard, review complaints
- **Admin**: Manage tenant users, system config
- **Regulator**: Cross-tenant analytics (limited)

## AI/ML Pipeline

### Entity Extraction

```python
# Extract structured data from narrative
entities = await llm_service.extract_entities(narrative)
# Returns: {product, issue, company, amount, date}
```

### Vector Similarity

```python
# Find similar complaints using embeddings
similar = await embedding_service.find_similar_complaints(
    db, query_text, tenant_id, limit=10
)
```

### Risk Prediction

```python
# XGBoost-based risk assessment
risk = await risk_model.predict_risk(
    db, narrative, entities, classification, sentiment, tenant_id
)
# Returns: {risk_score, category, factors, confidence}
```

## Performance & Scaling

### TiDB HTAP Optimization

- **OLTP**: Real-time complaint ingestion
- **OLAP**: Analytics queries via TiFlash replicas
- **Vector Search**: HNSW indexing for embeddings
- **Horizontal Scaling**: Auto-scaling with TiDB Cloud

### Caching Strategy

- Redis for session management
- Query result caching for analytics
- Embedding cache for similar complaints

## Monitoring & Observability

### OpenTelemetry Tracing

```python
@trace_endpoint
async def create_complaint(...):
    # Automatic tracing for all endpoints
    pass
```

### Health Checks

```bash
# Application health
GET /health

# Database connectivity
GET /health/db

# AI services status
GET /health/ai
```

## Deployment

### Production Checklist

- [ ] Environment variables configured
- [ ] TiDB Cloud connection secured
- [ ] Redis cluster setup
- [ ] Jaeger tracing configured
- [ ] SSL certificates installed
- [ ] Rate limiting enabled
- [ ] Monitoring alerts configured

### Docker Production

```dockerfile
# Multi-stage build for optimization
FROM python:3.11-slim as builder
# ... build dependencies

FROM python:3.11-slim as runtime
# ... runtime setup
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
