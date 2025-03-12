import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { PrismaClient } from "@prisma/client";
import * as jsonStorage from "@/lib/json-storage";

const prismaClient = new PrismaClient();

// POST /api/data-collection/materials/associate
// Body: { materialId: string, supplierIds: string[] }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("POST /api/data-collection/materials/associate received:", body);
    
    // Validate required fields
    if (!body.materialId) {
      return NextResponse.json(
        { error: "Material ID is required" },
        { status: 400 }
      );
    }
    
    if (!body.supplierIds || !Array.isArray(body.supplierIds)) {
      return NextResponse.json(
        { error: "Supplier IDs array is required" },
        { status: 400 }
      );
    }
    
    // Get the material from JSON storage
    const materials = await jsonStorage.loadMaterials();
    const material = materials.find(m => m.id === body.materialId);
    
    if (!material) {
      return NextResponse.json(
        { error: "Material not found" },
        { status: 404 }
      );
    }
    
    // Update the material's suppliers
    material.suppliers = body.supplierIds;
    
    // Save the updated material to JSON storage
    await jsonStorage.saveMaterials(
      materials.map(m => m.id === body.materialId ? material : m)
    );
    
    // Get the suppliers from JSON storage
    const suppliers = await jsonStorage.loadSuppliers();
    
    // Update each supplier's materials array to include this material
    for (const supplierId of body.supplierIds) {
      const supplier = suppliers.find(s => s.id === supplierId);
      if (supplier) {
        if (!supplier.materials.includes(body.materialId)) {
          supplier.materials.push(body.materialId);
        }
      }
    }
    
    // Save the updated suppliers to JSON storage
    await jsonStorage.saveSuppliers(suppliers);
    
    return NextResponse.json(
      { message: "Suppliers associated with material successfully", material }
    );
  } catch (error) {
    console.error("Error associating suppliers with material:", error);
    return NextResponse.json(
      { error: "Failed to associate suppliers with material" },
      { status: 500 }
    );
  }
}

// GET /api/data-collection/materials/associate?materialId={materialId}
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const materialId = searchParams.get("materialId");

    if (!materialId) {
      return NextResponse.json(
        { error: "Material ID is required" },
        { status: 400 }
      );
    }

    const material = await prisma.rawMaterial.findUnique({
      where: { id: materialId },
      include: {
        suppliers: true,
      },
    });

    if (!material) {
      return NextResponse.json(
        { error: "Material not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      supplierIds: material.suppliers.map((s) => s.id),
    });
  } catch (error) {
    console.error("Failed to get associated suppliers:", error);
    return NextResponse.json(
      { error: "Failed to get associated suppliers" },
      { status: 500 }
    );
  }
}
