# Feature Ideas Platform

A dynamic web application for submitting, voting on, and managing feature ideas.

## 🚀 Features

- User authentication
- Idea submission with categories
- Voting system
- Idea filtering and sorting
- Responsive design
- Kanban board or List view
- Drag and Drop in Kanban board to change status

# Screenshots
![Main Page](/public/mainInterface.png)
![Admin Dashboard](/public/admindashboard.png)
![Kanban](/public/kanban.png)


## 🛠 Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js

## 🏁 Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- PostgreSQL database

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/storminator89/feature-ideas-platform.git
   ```

2. Install dependencies:
   ```
   cd feature-ideas-platform
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add the following:
   ```
   DATABASE_URL="your_postgresql_connection_string"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your_nextauth_secret"
   ```

4. Set up the database:
   ```
   npx prisma migrate dev
   ```

5. Run the development server:
   ```
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Docker Usage

This application can be containerized and deployed using Docker. Follow these steps to start the application with Docker:

### Prerequisites

- Docker and Docker Compose must be installed on your system.
- A Docker Hub account (if you want to push the image).

### Deployment Steps

1. Clone the repository:

    ```bash
    git clone https://github.com/storminator89/feature-ideas-platform.git
    cd feature-ideas-platform
    ```

2. Create a `.env` file in the root directory and add the necessary environment variables:

    ```bash
    DB_USER=youruser
    DB_PASSWORD=yourpassword
    DB_NAME=featureideas
    DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@postgres_db:5432/${DB_NAME}
    NEXTAUTH_URL=http://localhost:3004
    NEXTAUTH_SECRET=your_nextauth_secret
    ```

3. Build and start the Docker containers:

    ```bash
    docker-compose up --build
    ```

    This will start the application and the database. On first run, it will automatically execute database migrations and insert seed data.

4. The application is now available at `http://localhost:3004`.

5. Example admin and normal user credentials:

    - **Admin User:** 
        - Email: `john@example.com`
        - Password: `password123`
    - **Normal User:** 
        - Email: `jane@example.com`
        - Password: `password123`

### Troubleshooting

- If you're having issues with the database connection, ensure that the `DATABASE_URL` is correct and the Postgres container is running.
- Check the logs of both containers for error messages.
- Make sure all required ports are free (3000 for the app, 5432 for the database).

For further issues, please consult the Docker documentation or open an issue in this repository.

## 📝 Usage

- Sign up or log in to submit new ideas
- Browse existing ideas
- Vote on ideas you like
- Filter ideas by category or search term
- Sort ideas by newest or most votes

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check [issues page](https://github.com/storminator89/feature-ideas-platform/issues).


## 👏 Acknowledgements

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Prisma](https://www.prisma.io/)
- [NextAuth.js](https://next-auth.js.org/)