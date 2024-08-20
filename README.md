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

## 📝 Usage

- Sign up or log in to submit new ideas
- Browse existing ideas
- Vote on ideas you like
- Filter ideas by category or search term
- Sort ideas by newest or most votes

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check [issues page](https://github.com/yourusername/feature-ideas-platform/issues).


## 👏 Acknowledgements

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Prisma](https://www.prisma.io/)
- [NextAuth.js](https://next-auth.js.org/)