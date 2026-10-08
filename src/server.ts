import app from "./app";
import { PORT } from "./config/env";

const port = PORT ?? 5000;

app.listen(port, () => {
  console.log(`Vaultly-api is running on ${port}`);
});
