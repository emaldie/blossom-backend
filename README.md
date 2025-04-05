# Blossom Backend

This is the backend service for [**Blossom**](https://github.com/emaldie/blossom-frontend), a flower shop application, built with **NestJS** and **TypeScript**.

## 🚀 Features (work in progress..)
- User authentication & authorization (JWT stored in MongoDB)
- Product management (flowers, bouquets, etc.)
- Order processing & checkout
- PostgreSQL database with Prisma ORM
- Server-side caching strategy for improved performance 

## 📦 Tech Stack
- **NestJS** (Node.js framework)
- **TypeScript**
- **PostgreSQL** (SQL-Database)
- **MongoDB** (No-SQL-Database)
- **Redis** (Server-side caching)
- **Prisma** (ORM)
- **Docker** (Containerization)
- **RabbitMQ** (Message-broker for microservices)
- **Swagger** (API Documentation)

## 🔧 Installation
1. Clone the repository:
   ```sh
   git clone https://github.com/your-username/blossom-backend.git
   cd blossom-backend
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Update `.env` with your database credentials following the example below.
   ```sh
    MONGODB_URI = 
    REDIS_HOST =
    REDIS_PORT =
    DATABASE_URL = 
    POSTGRES_USER =
    POSTGRES_PASSWORD =
    POSTGRES_DB =
    RMQ_USERS_QUEUE =
    RMQ_AUTH_QUEUE =
    RMQ_URI =
    JWT_ACCESS_SECRET =
    JWT_REFRESH_SECRET =
   ```

4. Run database migrations:
   ```sh
   npx prisma migrate dev
   ```

5. Start the development server:
   ```sh
   docker compose up --build
   ```

6. Generate prisma client:
   ```sh
   npx prisma generate
   ```

7. The server should be ready to accept requests :)   

## 📖 API Documentation
Swagger UI is available at:
```
http://localhost:3000/swagger
```
Working on it :)

## 🛠 Available Scripts
- `docker compose up --build` – Start the microservices
- all NestJS core scripts are also available within each microservice

## 📝 License
This project is licensed under the **MIT License**.

---
Made with ❤️ by the emaldie 🌸