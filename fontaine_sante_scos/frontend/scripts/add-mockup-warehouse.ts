import { addWarehouse } from "../lib/data-collection-utils";
import { Warehouse } from "../lib/types";
import fs from "fs/promises";
import path from "path";

async function addMockupWarehouse() {
  try {
    console.log("Starting mockup warehouse creation...");

    const mockWarehouse: Omit<Warehouse, "id" | "createdAt" | "updatedAt"> = {
      name: "Central Distribution Center",
      type: "Distribution",
      location: {
        address: "123 Logistics Way, Chicago, IL 60007",
        lat: 41.8781,
        lng: -87.6298,
      },
      capacity: {
        maxCapacity: 50000,
        currentUtilization: 32000,
        unit: "sq ft",
      },
      suppliers: [],
      materials: [],
      transitTimes: {
        inbound: 3,
        outbound: 2,
      },
      operationalCost: 12500,
    };

    console.log(
      "Mockup warehouse data:",
      JSON.stringify(mockWarehouse, null, 2)
    );

    // Directly add to JSON file if the database operation fails
    try {
      console.log("Adding warehouse to database...");
      const warehouse = await addWarehouse(mockWarehouse);
      console.log("Warehouse added to database successfully:", warehouse);
    } catch (dbError) {
      console.error("Database operation failed:", dbError);
      console.log("Falling back to direct JSON file update...");

      // Ensure the data directory exists
      const dataDir = path.join(process.cwd(), "data");
      try {
        await fs.access(dataDir);
      } catch {
        await fs.mkdir(dataDir, { recursive: true });
      }

      // Read existing warehouses
      const warehousesFile = path.join(dataDir, "warehouses.json");
      let warehouses: Warehouse[] = [];
      try {
        const data = await fs.readFile(warehousesFile, "utf-8");
        warehouses = JSON.parse(data);
      } catch (readError) {
        if ((readError as NodeJS.ErrnoException).code === "ENOENT") {
          console.log("Warehouses file doesn't exist, creating new one...");
        } else {
          console.error("Error reading warehouses file:", readError);
        }
      }

      // Add new warehouse
      const newWarehouse: Warehouse = {
        ...mockWarehouse,
        id: `wh-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      warehouses.push(newWarehouse);

      // Write updated warehouses
      await fs.writeFile(warehousesFile, JSON.stringify(warehouses, null, 2));
      console.log("Warehouse added to JSON file successfully:", newWarehouse);
    }

    console.log("Mockup warehouse creation completed.");
  } catch (error) {
    console.error("Failed to add mockup warehouse:", error);
  }
}

// Run the function
addMockupWarehouse()
  .then(() => {
    console.log("Script execution completed.");
  })
  .catch((error) => {
    console.error("Script execution failed:", error);
  });
