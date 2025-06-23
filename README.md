# Data-To-Design Canva Agent

Welcome to your Canva App! 🎉

This is a starting point for your app using your chosen template. The complete documentation for the platform is at [canva.dev/docs/apps](https://www.canva.dev/docs/apps/).


## Requirements

- Node.js `v18` or `v20.10.0`
- npm `v9` or `v10`

**Note:** To make sure you're running the correct version of Node.js, we recommend using a version manager, such as [nvm](https://github.com/nvm-sh/nvm#intro). The [.nvmrc](/.nvmrc) file in the root directory of this repo will ensure the correct version is used once you run `nvm install`.

## Quick start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Setup environment variables:**
   ```bash
   # Create .env file
   touch .env
   # Add your API keys (see Environment Setup section below)
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

## Environment Setup

Before running the app, you need to create a `.env` file in the root directory with the following required environment variables:

### Create .env file

1. Create a `.env` file in the root directory of the project
2. Add the following environment variables:

```env
# OpenAI Configuration (Required for AI features)
OPENAI_API_KEY=your_openai_api_key_here

# Canva App Configuration
CANVA_APP_ID=your_canva_app_id
CANVA_BACKEND_HOST=localhost
CANVA_BACKEND_PORT=3001
```

### Environment Variables Explained

- **`OPENAI_API_KEY`** (Required): Your OpenAI API key for generating chart suggestions and insights
  - Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
  - Example: `sk-...` (starts with "sk-")

- **`CANVA_APP_ID`** (Required): Your Canva App ID from the Developer Portal
  - Get this from your [Canva Developer Portal](https://www.canva.com/developers/apps)

- **`CANVA_BACKEND_HOST`** (Optional): Backend host (default: localhost)
- **`CANVA_BACKEND_PORT`** (Optional): Backend port (default: 3001)

### ⚠️ Important Notes

- **Never commit your `.env` file** - it's already in `.gitignore`
- **Keep your API keys secure** - don't share them publicly
- **OpenAI API usage costs money** - monitor your usage at [OpenAI Usage](https://platform.openai.com/usage)

## Running your Canva App

### Step 1: Start the local development server

To start the boilerplate's development server, run the following command:

```bash
npm start
```

The server becomes available at <http://localhost:8080>.

The app's source code is in the `src/app.tsx` file.

### Step 2: Preview the app

The local development server only exposes a JavaScript bundle, so you can't preview an app by visiting <http://localhost:8080>. You can only preview an app via the Canva editor.

To preview an app:

1. Create an app via the [Developer Portal](https://www.canva.com/developers/apps).
2. Select **App source > Development URL**.
3. In the **Development URL** field, enter the URL of the development server.
4. Click **Preview**. This opens the Canva editor (and the app) in a new tab.
5. Click **Open**. (This screen only appears when using an app for the first time.)

The app will appear in the side panel.

<details>
  <summary>Previewing apps in Safari</summary>

By default, the development server is not HTTPS-enabled. This is convenient, as there's no need for a security certificate, but it prevents apps from being previewed in Safari.

**Why Safari requires the development server to be HTTPS-enabled?**

Canva itself is served via HTTPS and most browsers prevent HTTPS pages from loading scripts via non-HTTPS connections. Chrome and Firefox make exceptions for local servers, such as `localhost`, but Safari does not, so if you're using Safari, the development server must be HTTPS-enabled.

To learn more, see [Loading mixed-content resources](https://developer.mozilla.org/en-US/docs/Web/Security/Mixed_content#loading_mixed-content_resources).

To preview apps in Safari:

1. Start the development server with HTTPS enabled:

```bash
npm start --use-https
```

2. Navigate to <https://localhost:8080>.
3. Bypass the invalid security certificate warning:
   1. Click **Show details**.
   2. Click **Visit website**.
4. In the Developer Portal, set the app's **Development URL** to <https://localhost:8080>.
5. Click preview (or refresh your app if it's already open).

You need to bypass the invalid security certificate warning every time you start the local server. A similar warning will appear in other browsers (and will need to be bypassed) whenever HTTPS is enabled.

</details>