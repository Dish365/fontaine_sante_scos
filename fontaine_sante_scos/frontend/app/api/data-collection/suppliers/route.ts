import { NextRequest, NextResponse } from "next/server";
import {
  getSuppliers,
  addSupplier,
  updateSupplier,
  deleteSupplier,
  Supplier,
} from "@/lib/data-collection-utils";
import { PrismaClient } from "@prisma/client";
import * as jsonStorage from "@/lib/json-storage";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

// GET /api/data-collection/suppliers
export async function GET() {
  try {
    console.log("Fetching suppliers from API route");

    // Read suppliers directly from the JSON file
    const suppliersPath = path.join(
      process.cwd(),
      "frontend/data/suppliers.json"
    );

    // Add this check to create the file if missing
    if (!fs.existsSync(suppliersPath)) {
      console.log("Creating empty suppliers file");
      fs.writeFileSync(suppliersPath, JSON.stringify([]));
    }

    // Then proceed with reading the file
    const suppliersData = fs.readFileSync(suppliersPath, "utf8");
    const suppliers = JSON.parse(suppliersData);
    console.log(`Loaded ${suppliers.length} suppliers from JSON file`);
    return NextResponse.json(suppliers);
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return NextResponse.json(
      { error: "Failed to fetch suppliers" },
      { status: 500 }
    );
  }
}

// POST /api/data-collection/suppliers
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("POST /api/data-collection/suppliers received:", body);

    // Validate required fields
    if (!body.name || !body.address) {
      return NextResponse.json(
        { error: "Name and address are required" },
        { status: 400 }
      );
    }

    // Create supplier in database
    const dbSupplier = await prisma.supplier.create({
      data: {
        name: body.name,
        address: body.address,
        coordinates: body.coordinates || { lat: 0, lng: 0 },
        materials: body.materials || [],
        transportMode: body.transportMode || null,
        distance: body.distance || null,
        transportationDetails: body.transportationDetails || null,
        productionCapacity: body.productionCapacity || null,
        certifications: body.certifications || [],
        performanceHistory: body.performanceHistory || null,
        environmentalImpact: body.environmentalImpact || null,
        riskScore: body.riskScore || null,
        quality: body.quality || null,
        contactInfo: body.contactInfo || null,
        economicData: body.economicData || null,
        environmentalData: body.environmentalData || null,
      },
    });

    console.log("Supplier created in database:", dbSupplier);

    // Convert to our type format
    const supplier = {
      id: dbSupplier.id,
      name: dbSupplier.name,
      address: dbSupplier.address,
      coordinates: dbSupplier.coordinates,
      materials: dbSupplier.materials,
      transportMode: dbSupplier.transportMode,
      distance: dbSupplier.distance,
      transportationDetails: dbSupplier.transportationDetails,
      productionCapacity: dbSupplier.productionCapacity,
      certifications: dbSupplier.certifications,
      performanceHistory: dbSupplier.performanceHistory,
      environmentalImpact: dbSupplier.environmentalImpact,
      riskScore: dbSupplier.riskScore,
      quality: dbSupplier.quality,
      contactInfo: dbSupplier.contactInfo,
      economicData: dbSupplier.economicData,
      environmentalData: dbSupplier.environmentalData,
      createdAt: dbSupplier.createdAt,
      updatedAt: dbSupplier.updatedAt,
    };

    // Update JSON storage
    const suppliers = await jsonStorage.loadSuppliers();
    await jsonStorage.saveSuppliers([...suppliers, supplier]);

    return NextResponse.json(
      { message: "Supplier added successfully", supplier },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding supplier:", error);
    return NextResponse.json(
      { error: "Failed to add supplier" },
      { status: 500 }
    );
  }
}

// PUT /api/data-collection/suppliers
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const supplier = await updateSupplier(body);
    return NextResponse.json(supplier);
  } catch (error) {
    console.error("Error updating supplier:", error);
    return NextResponse.json(
      { error: "Failed to update supplier" },
      { status: 500 }
    );
  }
}

// DELETE /api/data-collection/suppliers?id=123
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Supplier ID is required" },
        { status: 400 }
      );
    }

    // Delete supplier from database
    await prisma.supplier.delete({
      where: { id },
    });

    // Update JSON storage
    const suppliers = await jsonStorage.loadSuppliers();
    await jsonStorage.saveSuppliers(suppliers.filter((s) => s.id !== id));

    return NextResponse.json({ message: "Supplier deleted successfully" });
  } catch (error) {
    console.error("Error deleting supplier:", error);
    return NextResponse.json(
      { error: "Failed to delete supplier" },
      { status: 500 }
    );
  }
}
