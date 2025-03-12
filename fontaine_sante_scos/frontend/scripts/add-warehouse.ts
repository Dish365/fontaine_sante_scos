import { Warehouse } from "../lib/data-collection-utils";
import * as jsonStorage from "../lib/json-storage";
import { PrismaClient } from "@prisma/client";
import { Prisma } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Adding a single warehouse to the database...");

  // Define a single warehouse
  const warehouse: Warehouse = {
    id: "wh-001",
    name: "Central Distribution Center",
    type: "distribution",
    location: {
      lat: 45.5017,
      lng: -73.5673,
      address: "123 Distribution Ave, Montreal, QC H2X 1Y6, Canada",
    },
    capacity: {
      maxCapacity: 10000,
      currentUtilization: 6500,
      unit: "kg",
    },
    suppliers: ["sup-001", "sup-002"], // IDs of connected suppliers
    materials: ["mat-001", "mat-002"], // Materials stored in this warehouse
    transitTimes: {
      inbound: 2.5, // Average inbound transit time in days
      outbound: 1.8, // Average outbound transit time in days
    },
    operationalCost: 12500, // Monthly operational cost in dollars
  };

  try {
    // First, check if the warehouse already exists in Prisma
    const existingWarehouse = await prisma.warehouse.findUnique({
      where: { id: warehouse.id },
    });

    if (existingWarehouse) {
      console.log(
        `Warehouse with ID ${warehouse.id} already exists in the database.`
      );
      console.log("Deleting existing warehouse before creating a new one...");

      // Delete the existing warehouse
      await prisma.warehouse.delete({
        where: { id: warehouse.id },
      });
    }

    // Add to Prisma database
    console.log("Adding warehouse to Prisma database...");
    await prisma.warehouse.create({
      data: {
        id: warehouse.id,
        name: warehouse.name,
        type: warehouse.type,
        location: warehouse.location as unknown as Prisma.InputJsonValue,
        capacity: warehouse.capacity as unknown as Prisma.InputJsonValue,
        suppliers: warehouse.suppliers,
        materials: warehouse.materials,
        transitTimes:
          warehouse.transitTimes as unknown as Prisma.InputJsonValue,
        operationalCost: warehouse.operationalCost,
      },
    });
    console.log("Successfully added warehouse to Prisma database");

    // Also update the JSON file for consistency
    const existingWarehouses = await jsonStorage.loadWarehouses();
    const updatedWarehouses = existingWarehouses.filter(
      (w) => w.id !== warehouse.id
    );
    updatedWarehouses.push(warehouse);

    await jsonStorage.saveWarehouses(updatedWarehouses);
    console.log(
      `Successfully updated JSON file. Total warehouses: ${updatedWarehouses.length}`
    );
  } catch (error) {
    console.error("Error adding warehouse:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error("Error in main function:", e);
  process.exit(1);
});
