# ⚡ Netlify Supabase Proxy (Bypass Jio / Airtel ISP Blocks in India)

This proxy redirects all API requests from your UriBridge React Native app to your Supabase backend using Netlify's CDN & Edge Functions.

### Why is this needed?
In India, major internet service providers (ISPs) like **Jio** and **Airtel** frequently block `*.supabase.co` domains or disrupt DNS lookups to Supabase IP ranges. Routing your API traffic through a custom Netlify domain bypasses ISP restrictions completely.

---

## 🚀 How to Deploy to Netlify (Choose Option 1 or Option 2)

### Option 1: Drag-and-Drop (Instant 1-Minute Deployment)
1. Go to [app.netlify.com](https://app.netlify.com) and log in.
2. Go to **Sites** $\rightarrow$ **Add new site** $\rightarrow$ **Deploy manually**.
3. Drag and drop the `netlify-proxy` folder into Netlify.
4. Netlify will instantly build and publish your proxy!
5. Netlify will give you a live URL (e.g., `https://uribridge-supabase-proxy.netlify.app`).

---

### Option 2: Deploy via Netlify CLI
Run the following commands inside the `netlify-proxy` directory:

```bash
cd netlify-proxy
npx netlify-cli deploy --prod
```

Follow the prompt to log in and select your Netlify workspace.

---

## 📱 How to update your React Native App

Once your Netlify proxy is deployed and you get your Netlify URL (e.g. `https://your-app-name.netlify.app`), update your `.env` file in your root project:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-app-name.netlify.app
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

That's it! All database requests, authentication, and progress updates will now route through your Netlify proxy smoothly without being blocked by Jio or Airtel.
