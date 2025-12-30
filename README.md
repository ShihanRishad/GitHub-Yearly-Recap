<h1 align="center"> GitHub Yearly Recap </h1>

![Project Banner](/public/og-image.png)

A cinematic journey through your year in code.

GitHub Yearly Recap processes your GitHub timeline to create an interactive, personalized presentation. Inspired by the "Wrapped" format, it combines detailed activity analysis with fluid animations and AI-generated insights to tell the story of your open-source contributions.

## Features

- **Activity Analysis:** Deep dives into your contribution history, identifying patterns, peak productivity day, and language preferences.

- **Cinematic Visualization:** Data is presented through a series of auto-playing slides, utilizing Framer Motion for smooth transitions and immersive interactions.

- **AI Insights:** Powered by Google Gemini, the application generates personalized commentary on your coding habits, achievements, and unique style.

- **Interactive Heatmap:** A fully responsive, explorative view of your contribution graph, providing an immersive experience for analyzing your best months, weeks, days, and streaks.

## Tech Stack

**Frontend**
- React 19
- TypeScript
- Tailwind CSS v4
- Framer Motion
- Shadcn UI

**Backend**
- Vercel Serverless Functions
- GitHub GraphQL API
- Google Gemini API

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated!

### Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Vercel CLI](https://vercel.com/docs/cli) (`npm i -g vercel`)
- A GitHub Personal Access Token (PAT)
- A Google Gemini API Key
- A Firebase Project

### Development Workflow

1. **Fork the Project**
   Create your own fork of the repository by clicking the "Fork" button at the top of the page.

2. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/github-yearly-recap.git
   cd github-yearly-recap
   ```

3. **Install Dependencies**
   ```bash
   cd github-yearly-recap/
   npm install
   cd api
   npm install
   cd ..
   ```

4. **Configure Environment Variables**
   Create a `.env.local` file in the root directory. Use `.env.example` as a template to add your `GITHUB_TOKEN` and `GEMINI_API_KEY`.

5. **Create a Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

6. **Start Local Development**
   Launch the development environment using the Vercel CLI to ensure serverless functions are active:
   ```bash
   vercel dev
   ```
   The app will be available at `http://localhost:3000`.

7. **Commit Your Changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```

8. **Push to the Branch**
   ```bash
   git push origin feature/amazing-feature
   ```

9. **Open a Pull Request**
   Navigate to the original repository and open a pull request from your feature branch.

## Deployment

This project is built to run on Vercel. Connect your repository, add the required environment variables in the dashboard, and deploy.

## License

This project is open source and available under the MIT License.
