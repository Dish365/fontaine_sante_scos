import { NextRequest, NextResponse } from "next/server";
import {
  getRawMaterials,
  addRawMaterial,
  updateRawMaterial,
  deleteRawMaterial,
  getMaterialsBySupplier,
  RawMaterial,
} from "@/lib/data-collection-utils";
import { prisma } from "@/lib/db";
import * as jsonStorage from "@/lib/json-storage";
import { promises as fs } from "fs";
import path from "path";

const materialsPath = path.join(process.cwd(), "data/materials.json");

// GET /api/data-collection/materials
// Can filter by supplier with ?supplierId={id} query parameter
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const supplierId = searchParams.get("supplierId");

    if (supplierId) {
      const materials = await getMaterialsBySupplier(supplierId);
      return NextResponse.json({ materials });
    } else {
      // Load from both Prisma and JSON storage
      const materials = await getRawMaterials();
      return NextResponse.json({ materials });
    }
  } catch (error) {
    console.error("Failed to fetch materials:", error);
    return NextResponse.json(
      { error: "Failed to fetch materials" },
      { status: 500 }
    );
  }
}

// POST /api/data-collection/materials
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ["name", "type", "quantity", "unit"] as const;
    const missingFields = requiredFields.filter((field) => !body[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          fields: missingFields,
          message: `Please provide: ${missingFields.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Add default values for optional fields
    const materialData = {
      ...body,
      suppliers: body.suppliers || [],
      quality: body.quality || {
        score: 0,
        defectRate: 0,
        consistencyScore: 0,
      },
      environmentalData: body.environmentalData || {
        carbonFootprint: 0,
        waterUsage: 0,
        landUse: 0,
        biodiversityImpact: "",
      },
      economicData: body.economicData || {
        unitCost: 0,
        transportationCost: 0,
        storageCost: 0,
        totalCostPerUnit: 0,
      },
    };

    // Save the material
    const material = await addRawMaterial(materialData);

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Raw material added successfully",
        material,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to add material:", error);

    // Return detailed error response
    return NextResponse.json(
      {
        error: "Failed to add material",
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// PUT /api/data-collection/materials
export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const updates = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Material ID is required" },
        { status: 400 }
      );
    }

    // Read current materials
    const data = await fs.readFile(materialsPath, "utf8");
    const materials = JSON.parse(data);

    // Find and update the material
    const materialIndex = materials.findIndex(
      (material: any) => material.id === id
    );

    if (materialIndex === -1) {
      return NextResponse.json(
        { error: "Material not found" },
        { status: 404 }
      );
    }

    // Update the material with new data while preserving existing fields
    materials[materialIndex] = {
      ...materials[materialIndex],
      ...updates,
      suppliers: updates.suppliers || materials[materialIndex].suppliers || [],
    };

    // Write back to file
    await fs.writeFile(materialsPath, JSON.stringify(materials, null, 2));

    return NextResponse.json(materials[materialIndex]);
  } catch (error) {
    console.error("Error updating material:", error);
    return NextResponse.json(
      { error: "Failed to update material", details: error },
      { status: 500 }
    );
  }
}

// DELETE /api/data-collection/materials
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing material ID" },
        { status: 400 }
      );
    }

    await deleteRawMaterial(id);

    // Remove from JSON storage
    const materials = await jsonStorage.loadMaterials();
    const updatedMaterials = materials.filter((m) => m.id !== id);
    await jsonStorage.saveMaterials(updatedMaterials);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete material:", error);
    return NextResponse.json(
      { error: "Failed to delete material" },
      { status: 500 }
    );
  }
}
