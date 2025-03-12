// Node.js script to add a mockup warehouse to both database and JSON storage
const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

// Initialize Prisma client
const prisma = new PrismaClient();

// Define paths
const DATA_DIR = path.join(__dirname, "..", "data");
const WAREHOUSES_FILE = path.join(DATA_DIR, "warehouses.json");

// Ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    console.log("Creating data directory...");
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Read warehouses from JSON file
function readWarehouses() {
  try {
    if (!fs.existsSync(WAREHOUSES_FILE)) {
      return [];
    }
    const data = fs.readFileSync(WAREHOUSES_FILE, "utf-8");
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error reading warehouses file:", error);
    return [];
  }
}

// Save warehouses to JSON file
function saveWarehouses(warehouses) {
  fs.writeFileSync(WAREHOUSES_FILE, JSON.stringify(warehouses, null, 2));
}

// Generate a unique ID
function generateId() {
  return `wh-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Main function to add a warehouse
async function addMockupWarehouse() {
  try {
    console.log("Starting mockup warehouse creation...");

    // Ensure data directory exists
    ensureDataDir();

    // Generate a unique ID
    const warehouseId = generateId();

    // Create warehouse data
    const warehouseData = {
      id: warehouseId,
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
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log("Warehouse data prepared:", warehouseData);

    // Step 1: Add to database
    console.log("Adding warehouse to database...");
    const dbWarehouse = await prisma.warehouse.create({
      data: {
        id: warehouseData.id,
        name: warehouseData.name,
        type: warehouseData.type,
        location: warehouseData.location,
        capacity: warehouseData.capacity,
        suppliers: warehouseData.suppliers,
        materials: warehouseData.materials,
        transitTimes: warehouseData.transitTimes,
        operationalCost: warehouseData.operationalCost,
      },
    });

    console.log("Warehouse added to database:", dbWarehouse);

    // Step 2: Add to JSON storage
    console.log("Adding warehouse to JSON storage...");
    const warehouses = readWarehouses();
    warehouses.push(warehouseData);
    saveWarehouses(warehouses);

    console.log("Warehouse added to JSON storage");
    console.log("Mockup warehouse added successfully with ID:", warehouseId);

    return warehouseData;
  } catch (error) {
    console.error("Failed to add mockup warehouse:", error);

    // Fallback: If database operation fails, still try to add to JSON
    if (error.message.includes("database") || error.code) {
      console.log(
        "Database operation failed, falling back to JSON-only storage..."
      );
      try {
        const warehouseId = generateId();
        const warehouseData = {
          id: warehouseId,
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
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const warehouses = readWarehouses();
        warehouses.push(warehouseData);
        saveWarehouses(warehouses);

        console.log("Warehouse added to JSON storage as fallback");
        console.log(
          "Mockup warehouse added to JSON only with ID:",
          warehouseId
        );

        return warehouseData;
      } catch (jsonError) {
        console.error("Failed to add warehouse to JSON storage:", jsonError);
        throw jsonError;
      }
    }

    throw error;
  } finally {
    // Close Prisma client
    await prisma.$disconnect();
  }
}

// Run the function
addMockupWarehouse()
  .then(() => {
    console.log("Script execution completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script execution failed:", error);
    process.exit(1);
  });
