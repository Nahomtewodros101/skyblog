# Full-Stack Blog Application

A modern, full-featured blogging platform built with Next.js 15, Prisma, MongoDB, and Tailwind CSS.

## Features

- 🔐 JWT Authentication (no NextAuth)
- 👥 User management with admin dashboard
- 📝 Full CRUD operations for posts and user profiles
- 💬 Comments and likes system
- 🔍 Debounced search and filtering
- 🌙 Dark mode toggle
- 📱 Responsive design
- 🧪 Unit tests with Jest
- 🐳 Docker containerization
- 🏗️ Clean Architecture principles

## Tech Stack

- **Frontend**: Next.js 15, React 18, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: MongoDB
- **Authentication**: JWT
- **Testing**: Jest, React Testing Library
- **Containerization**: Docker, Docker Compose

## Getting Started

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- MongoDB (or use Docker)

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd fullstack-blog
\`\`\`

2. Copy environment variables:
\`\`\`bash
cp .env.example .env
\`\`\`

3. Update the `.env` file with your configuration:
\`\`\`env
DATABASE_URL="mongodb://admin:password123@localhost:27017/blogdb?authSource=admin"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
\`\`\`

### Running with Docker (Recommended)

1. Build and start the application:
\`\`\`bash
docker-compose up --build
\`\`\`

2. The application will be available at `http://localhost:3000`

3. MongoDB will be available at `localhost:27017`

### Running Locally

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Start MongoDB (if not using Docker):
\`\`\`bash
# Using Docker for MongoDB only
docker run -d -p 27017:27017 --name mongodb -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=password123 mongo:7.0
\`\`\`

3. Generate Prisma client and push schema:
\`\`\`bash
npx prisma generate
npx prisma db push
\`\`\`

4. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

## Project Structure

\`\`\`
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── admin/             # Admin dashboard
│   ├── posts/             # Post pages
│   └── ...
├── components/            # Reusable components
│   ├── ui/               # UI components
│   └── ...
├── contexts/             # React contexts
├── lib/                  # Utilities and configurations
│   ├── auth.ts          # Authentication utilities
│   ├── db.ts            # Database connection
│   ├── validations.ts   # Zod schemas
│   └── utils.ts         # Helper functions
└── __tests__/           # Test files
\`\`\`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Posts
- `GET /api/posts` - Get all posts (with pagination)
- `POST /api/posts` - Create new post
- `GET /api/posts/[slug]` - Get post by slug
- `PUT /api/posts/[id]` - Update post
- `DELETE /api/posts/[id]` - Delete post

### Comments
- `GET /api/posts/[id]/comments` - Get post comments
- `POST /api/posts/[id]/comments` - Add comment
- `DELETE /api/comments/[id]` - Delete comment

### Likes
- `POST /api/posts/[id]/like` - Toggle like
- `GET /api/posts/[id]/likes` - Get post likes

### Users (Admin)
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/[id]` - Update user
- `DELETE /api/admin/users/[id]` - Delete user

## Testing

Run the test suite:
\`\`\`bash
npm test
\`\`\`

Run tests in watch mode:
\`\`\`bash
npm run test:watch
\`\`\`

## Database Schema

The application uses the following main entities:

- **User**: User accounts with authentication
- **Post**: Blog posts with content and metadata
- **Comment**: Comments on posts
- **Like**: Post likes/reactions

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation with Zod
- CORS protection
- SQL injection prevention (Prisma ORM)
- XSS protection

## Performance Optimizations

- Server-side rendering with Next.js
- Image optimization
- Code splitting
- Debounced search
- Pagination
- Database indexing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the MIT License.
