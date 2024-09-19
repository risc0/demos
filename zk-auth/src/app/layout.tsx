export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body className="container mx-auto">
        <div className="flex flex-col items-center justify-center">
          <h1>My App -- this content is rendered by some consumer and is not part of the zkAuth package</h1>
          <h2>
            I am passing down the following address to zkAuth: <b>0xc8915cc592583036e18724b6a7cBE9685f49FC98</b>
          </h2>
          <br />
          <br />
          <br />

          <div>{children}</div>
        </div>
      </body>
    </html>
  );
}
