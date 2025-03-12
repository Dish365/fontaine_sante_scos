import { prisma } from "@/lib/prisma";

export async function createMaterialWithSuppliers(data: MaterialFormData) {
  return await prisma.$transaction(async (tx) => {
    const material = await tx.rawMaterial.create({
      data: {
        name: data.name,
        type: data.type,
        // ...other fields
      },
    });

    await tx.supplierMaterialPricing.createMany({
      data: data.suppliers.map((supplier) => ({
        supplierId: supplier.id,
        materialId: material.id,
        unitPrice: supplier.pricing.unitPrice,
        // ...other fields
      })),
    });

    return material;
  });
}
