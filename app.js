const { createApp } = Vue;

createApp({
  data() {
    return {
      config: {
        statements: [],
      },
      selectedStatement: null,
    };
  },
  methods: {
    selectStatement(statement) {
      this.selectedStatement = statement;
    },
    addItem(statement) {
      statement.items.push({
        key: "",
        display_name: "New Item",
        extract_names: [],
        extract_names_text: "",
        force_positive: true,
        expr_str: "",
        forecast: {
          method: "cagr",
          pct_of: null,
          make_forecast: true,
          prophet_kwargs: {},
          plug: false,
          balance_with: null,
        },
      });
    },
    removeItem(statement, index) {
      statement.items.splice(index, 1);
    },
    updateExtractNames(item) {
      item.extract_names = item.extract_names_text
        .split("\n")
        .map((name) => name.trim())
        .filter((name) => name.length > 0);
    },
    loadConfig() {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".yaml,.yml";

      input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = (event) => {
          try {
            this.config = jsyaml.load(event.target.result);
            // Initialize missing forecast configs and extract_names_text for all items
            this.config.statements.forEach((stmt) => {
              stmt.items.forEach((item) => {
                // Set default forecast config if missing
                item.forecast = {
                  method: "cagr",
                  pct_of: null,
                  make_forecast: true,
                  prophet_kwargs: {},
                  plug: false,
                  balance_with: null,
                  ...item.forecast, // Merge with existing forecast config if any
                };

                // Set extract_names_text for UI
                item.extract_names_text = (item.extract_names || []).join("\n");
              });
            });
          } catch (e) {
            alert("Error loading config: " + e.message);
          }
        };

        reader.readAsText(file);
      };

      input.click();
    },
    saveConfig() {
      // Create a clean copy of the config without UI-specific properties
      const cleanConfig = {
        statements: this.config.statements.map((stmt) => ({
          key: stmt.key,
          display_name: stmt.display_name,
          items: stmt.items.map((item) => {
            const cleanItem = {
              key: item.key,
              display_name: item.display_name,
              extract_names: item.extract_names,
              force_positive: item.force_positive,
              forecast: item.forecast,
            };
            if (item.expr_str) cleanItem.expr_str = item.expr_str;
            return cleanItem;
          }),
        })),
      };

      const yaml = jsyaml.dump(cleanConfig);
      const blob = new Blob([yaml], { type: "text/yaml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "statement_config.yaml";
      a.click();
      URL.revokeObjectURL(url);
    },
  },
}).mount("#app");
