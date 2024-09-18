# zkAuth

## In order to implement this flow you need to:

1. Ask us to add your domain to the list of allowed domains on Google Cloud Console
2. Integrate the following code to your project:

##### React Example:

### 1. Install

```bash
bun install @risc0/zkauth
```

### 2. For local development, make sure you are using port 3000

### 3. Usage

```tsx
import "@risc0/zkauth/index.css"; // load the zkAuth stylesheet
import { ZkAuth } from "@risc0/zkauth/react";

function App() {
  return (
    <>
      <h1>My App</h1>
      
      <ZkAuth 
        address={address} 
        onStarkComplete={(starkResults) => {
          console.info("Stark completed:", starkResults);
        }}
        onSnarkComplete={(snarkResults) => {
          console.info("Snark completed:", snarkResults);
        }}
      />
    </>
  );
}
```
