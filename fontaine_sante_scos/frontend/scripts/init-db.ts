import { PrismaClient } from "@prisma/client";
import { mockSuppliers, mockRawMaterials } from "../lib/data-collection-utils";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database initialization...");

  // Clear existing data
  await prisma.supplier.deleteMany();
  await prisma.rawMaterial.deleteMany();

  console.log("Cleared existing data");

  // Add suppliers
  for (const supplier of mockSuppliers) {
    await prisma.supplier.create({
      data: {
        id: supplier.id,
        name: supplier.name,
        address: supplier.location.address,
        coordinates: supplier.location.coordinates as any,
        materials: supplier.materials,
        transportMode: supplier.transportMode,
        distance: supplier.distance,
        transportationDetails: supplier.transportationDetails,
        productionCapacity: supplier.productionCapacity,
        certifications: supplier.certifications,
        performanceHistory: supplier.performanceHistory,
        environmentalImpact: supplier.environmentalImpact,
        riskScore: supplier.riskScore,
        quality: supplier.quality,
        contactInfo: supplier.contactInfo as any,
        economicData: supplier.economicData as any,
        environmentalData: supplier.environmentalData as any,
      },
    });
  }

  console.log("Added suppliers");

  // Add raw materials
  for (const material of mockRawMaterials) {
    await prisma.rawMaterial.create({
      data: {
        id: material.id,
        name: material.name,
        type: material.type,
        description: material.description,
        quantity: material.quantity,
        unit: material.unit,
        quality: material.quality as any,
        environmentalData: material.environmentalData as any,
        economicData: material.economicData as any,
        suppliers: {
          connect: material.suppliers.map((id: string) => ({ id })),
        },
      },
    });
  }

  console.log("Added raw materials");

  console.log("Database initialization complete!");
}

main()
  .catch((e) => {
    console.error("Error during initialization:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
