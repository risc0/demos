# zkAuth

## In order to implement this flow you need to:

1. Ask us to add your domain to the list of allowed domains on Google Cloud Console
2. Integrate the following code to your project:

##### HTML Example:

```html
<html>
  <head>
    <!-- Load the zkAuth stylesheet -->
    <link rel="stylesheet" crossorigin href="https://unpkg.com/@risc0/zkauth@latest/dist/index.css">
  </head>
  <body>
    <!-- Pass the user's address as `data-address` to the `zkauth` div -->
    <div id="zkauth" data-address="0x123.....A728">
      <!-- the oboarding UI will be mounted here -->
    </div>

    <!-- Load the zkAuth script -->
    <script type="module" crossorigin src="https://unpkg.com/@risc0/zkauth@latest/dist/index.js"></script>
  </body>
</html>
```

---

##### React Example:

### 1. Install

```bash
npm install @risc0/zkauth
```

### 2. For local development, make sure you are using port 3000

### 3. Usage

```tsx
import "@risc0/zkauth/dist/index.css"; // load the zkAuth stylesheet
import { useZkAuth } from "@risc0/zkauth/react";

function App() {
  useZkAuth();

  return (
    <>
      <h1>My App</h1>
      <div id="zkauth" data-address={address} />
    </>
  );
}
```
