import { defineConfig } from "cypress";
import viteConfig from "./vite.config.js";
import codeCoverageTask from '@cypress/code-coverage/task'


export default defineConfig({
  e2e: {
    // Not used right now; we are focusing on component tests.
  },
  component: {
    devServer: {
      framework: "react",
      bundler: "vite",
      viteConfig,
    },
    setupNodeEvents(on, config) {
      // register code-coverage backend task
      codeCoverageTask(on, config)
      return config
    },
    specPattern: "tests/cypress/component/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: "tests/cypress/support/component.jsx",
    indexHtmlFile: "tests/cypress/support/component-index.html",
  },
});
