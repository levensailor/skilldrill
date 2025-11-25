# Technical Interview Application

A Next.js web application for managing technical interviews, questions, and tests. This application allows you to create question categories, build tests from questions, and conduct interviews with scoring capabilities.

## Features

- **Questions Management**: Create and organize interview questions by categories
- **Test Creation**: Build tests by selecting questions from different categories
- **Interview Management**: Conduct interviews with multiple interviewers and score candidate responses (1-5 scale)
- **Real-time Updates**: All changes are automatically saved without manual reloading

## Tech Stack

- **Frontend**: Next.js 14+ with App Router, TypeScript, React Server Components
- **Backend**: Next.js API Routes (serverless functions)
- **Database**: Vercel Postgres (PostgreSQL)
- **Styling**: Tailwind CSS
- **Icons**: React Icons

## Prerequisites

- Node.js 18+ installed
- A Vercel account
- Vercel Postgres database (created through Vercel dashboard)

## Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd skilldrill
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env.local`
   - Get your database connection details from Vercel dashboard:
     - Go to your Vercel project
     - Navigate to Storage → Postgres
     - Copy the connection environment variables
   - Add them to `.env.local`

4. **Set up the database**
   - Connect to your Vercel Postgres database using a PostgreSQL client or the Vercel dashboard SQL editor
   - Run the SQL script from `schema.sql` to create all necessary tables:
     ```bash
     # Option 1: Using psql
     psql $POSTGRES_URL < schema.sql
     
     # Option 2: Copy and paste the contents of schema.sql into Vercel dashboard SQL editor
     ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   - Navigate to `http://localhost:3000`

## Deployment to Vercel

### Step 1: Create a Vercel Postgres Database

1. Log in to your [Vercel dashboard](https://vercel.com/dashboard)
2. Go to your project (or create a new one)
3. Navigate to the **Storage** tab
4. Click **Create Database** → Select **Postgres**
5. Choose a name for your database and region
6. Click **Create**

### Step 2: Set Up Environment Variables

Vercel Postgres automatically provides environment variables. They should be available in your project settings:

1. Go to your project settings in Vercel dashboard
2. Navigate to **Environment Variables**
3. Verify that the following variables are set (they should be auto-populated):
   - `POSTGRES_URL`
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`
   - `POSTGRES_USER`
   - `POSTGRES_HOST`
   - `POSTGRES_PASSWORD`
   - `POSTGRES_DATABASE`

### Step 3: Initialize the Database Schema

1. In your Vercel project dashboard, go to **Storage** → **Postgres**
2. Click on your database
3. Navigate to the **Data** tab
4. Click on **SQL Editor** or use the **Query** tab
5. Copy the entire contents of `schema.sql` from this repository
6. Paste it into the SQL editor and execute it
7. Verify that all tables are created successfully

### Step 4: Deploy the Application

1. **Connect your repository to Vercel** (if not already connected):
   - Go to Vercel dashboard
   - Click **Add New Project**
   - Import your Git repository
   - Configure the project settings

2. **Deploy**:
   - Vercel will automatically detect Next.js and deploy
   - Or manually trigger a deployment:
     ```bash
     vercel --prod
     ```

3. **Verify deployment**:
   - Once deployed, visit your application URL
   - Test creating a category, question, test, and interview

## Database Schema

The application uses the following main tables:

- `categories` - Question categories
- `questions` - Interview questions
- `tests` - Test definitions
- `test_questions` - Many-to-many relationship between tests and questions
- `interviews` - Interview sessions
- `interviewers` - Interviewer information per interview
- `interview_scores` - Scores (1-5) for each question by each interviewer

See `schema.sql` for the complete schema definition.

## Project Structure

```
skilldrill/
├── app/
│   ├── api/              # API routes
│   ├── questions/         # Questions page
│   ├── tests/             # Tests page
│   ├── interviews/        # Interviews pages
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # React components
├── lib/
│   ├── db.ts             # Database utilities
│   └── types.ts          # TypeScript types
├── schema.sql            # Database schema
└── README.md             # This file
```

## Usage

### Creating Questions

1. Navigate to **Questions** from the homepage
2. Click **Create New Category** to add a category
3. Within each category, click **Add New Question** at the bottom
4. Questions can be edited or deleted inline

### Creating Tests

1. Navigate to **Tests** from the homepage
2. Click **Create New Test**
3. Enter a test name
4. Select questions from the available categories
5. Click **Create Test**

### Conducting Interviews

1. Navigate to **Interviews** from the homepage
2. Click **Create New Interview**
3. Enter the candidate name and select a test
4. Click on an interview to open the detail page
5. Add interviewers using the **Add Interviewer** button
6. Score each question (1-5) for each interviewer
7. Scores are automatically saved

## Environment Variables

The following environment variables are required (automatically provided by Vercel Postgres):

- `POSTGRES_URL` - Connection URL for the database
- `POSTGRES_PRISMA_URL` - Prisma-compatible connection URL
- `POSTGRES_URL_NON_POOLING` - Direct connection URL (for migrations)
- `POSTGRES_USER` - Database user
- `POSTGRES_HOST` - Database host
- `POSTGRES_PASSWORD` - Database password
- `POSTGRES_DATABASE` - Database name

## Troubleshooting

### Database Connection Issues

- Verify all environment variables are set correctly in Vercel dashboard
- Check that the database schema has been initialized (run `schema.sql`)
- Ensure your Vercel Postgres database is active and not paused

### Deployment Issues

- Check Vercel build logs for errors
- Verify Node.js version compatibility (18+)
- Ensure all dependencies are listed in `package.json`

## License

This project is private and proprietary.

## Author

Created for technical interview management.
