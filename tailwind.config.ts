import { type Config } from "tailwindcss";
import { withUt } from "uploadthing/tw";

export default withUt({
  //darkMode: ["class"],
  content: ["./src/**/*.tsx"],
}) satisfies Config;
