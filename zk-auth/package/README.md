# zkAuth

## In order to implement this flow you need to:

1. Ask us to add your domain to the list of allowed domains on Google Cloud Console
2. Add the following code to your project:

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
