# Mutual Fund Analyzer

## Running with Docker Compose

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) installed
- [Docker Compose](https://docs.docker.com/compose/install/) (if not included with Docker)

### Steps
1. Open a terminal in the project root directory (where `docker-compose.yaml` is located).
2. Build and start the services:
   
   ```sh
   docker compose up --build -d
   ```
   
   This will start:
   - **Postgres** database (port 5432)
   - **App** backend (FastAPI, port 8000)
   - **UI** frontend (React,port 3000)

3. Access the API at [http://localhost:8000](http://localhost:8000)

4.Access the UI at [http://localhost:3000](http://localhost:3000)

### Stopping the services
To stop and remove containers, networks, and volumes:

```sh
docker compose down -v
```
