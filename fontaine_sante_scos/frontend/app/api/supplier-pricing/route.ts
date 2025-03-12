import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { SupplierMaterialPricing, PriceHistoryEntry } from "@/lib/types";

export async function GET(
  request: Request
): Promise<
  NextResponse<
    SupplierMaterialPricing | SupplierMaterialPricing[] | { error: string }
  >
> {
  try {
    const { searchParams } = new URL(request.url);
    const supplierId = searchParams.get("supplierId");
    const materialId = searchParams.get("materialId");

    let pricing;
    if (supplierId && materialId) {
      // Get specific supplier-material pricing
      pricing = await prisma.supplierMaterialPricing.findUnique({
        where: {
          supplierId_materialId: {
            supplierId,
            materialId,
          },
        },
      });
    } else if (supplierId) {
      // Get all pricing for a supplier
      pricing = await prisma.supplierMaterialPricing.findMany({
        where: {
          supplierId,
        },
        include: {
          material: true,
        },
      });
    } else if (materialId) {
      // Get all pricing for a material
      pricing = await prisma.supplierMaterialPricing.findMany({
        where: {
          materialId,
        },
        include: {
          supplier: true,
        },
      });
    } else {
      // Get all pricing records
      pricing = await prisma.supplierMaterialPricing.findMany({
        include: {
          supplier: true,
          material: true,
        },
      });
    }

    return NextResponse.json(pricing);
  } catch (error) {
    console.error("Error fetching supplier pricing:", error);
    return NextResponse.json(
      { error: "Failed to fetch supplier pricing" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request
): Promise<NextResponse<SupplierMaterialPricing | { error: string }>> {
  try {
    const body = await request.json();

    // Check if pricing already exists for this supplier-material combination
    const existingPricing = await prisma.supplierMaterialPricing.findUnique({
      where: {
        supplierId_materialId: {
          supplierId: body.supplierId,
          materialId: body.materialId,
        },
      },
    });

    if (existingPricing) {
      return NextResponse.json(
        {
          error:
            "Pricing already exists for this supplier-material combination",
        },
        { status: 400 }
      );
    }

    const pricing = await prisma.supplierMaterialPricing.create({
      data: {
        supplierId: body.supplierId,
        materialId: body.materialId,
        unitPrice: body.unitPrice,
        currency: body.currency,
        minOrderQuantity: body.minOrderQuantity,
        leadTime: body.leadTime,
        transportCost: body.transportCost,
        volumeDiscounts: body.volumeDiscounts || [],
        priceHistory: [
          { date: new Date().toISOString(), price: body.unitPrice },
        ],
        lastNegotiation: body.lastNegotiation || new Date(),
        nextReview: body.nextReview,
        isPreferred: body.isPreferred || false,
        notes: body.notes,
      },
      include: {
        supplier: true,
        material: true,
      },
    });

    return NextResponse.json(pricing);
  } catch (error) {
    console.error("Error creating supplier pricing:", error);
    return NextResponse.json(
      { error: "Failed to create supplier pricing" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Pricing ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const existingPricing = await prisma.supplierMaterialPricing.findUnique({
      where: { id },
    });

    if (!existingPricing) {
      return NextResponse.json(
        { error: "Pricing record not found" },
        { status: 404 }
      );
    }

    // Update price history if unit price has changed
    const priceHistory = (existingPricing.priceHistory ||
      []) as PriceHistoryEntry[];
    if (body.unitPrice !== existingPricing.unitPrice) {
      priceHistory.push({
        date: new Date().toISOString(),
        price: body.unitPrice,
      });
    }

    const pricing = await prisma.supplierMaterialPricing.update({
      where: { id },
      data: {
        unitPrice: body.unitPrice,
        currency: body.currency,
        minOrderQuantity: body.minOrderQuantity,
        leadTime: body.leadTime,
        transportCost: body.transportCost,
        volumeDiscounts: body.volumeDiscounts,
        priceHistory,
        isPreferred: body.isPreferred,
        notes: body.notes,
        lastNegotiation: body.lastNegotiation,
        nextReview: body.nextReview,
      },
    });

    return NextResponse.json(pricing);
  } catch (error) {
    console.error("Error updating supplier pricing:", error);
    return NextResponse.json(
      { error: "Failed to update supplier pricing" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request
): Promise<NextResponse<{ success: boolean } | { error: string }>> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const supplierId = searchParams.get("supplierId");
    const materialId = searchParams.get("materialId");

    if (!id && !(supplierId && materialId)) {
      return NextResponse.json(
        { error: "Either ID or both supplierId and materialId are required" },
        { status: 400 }
      );
    }

    if (id) {
      await prisma.supplierMaterialPricing.delete({
        where: { id },
      });
    } else {
      await prisma.supplierMaterialPricing.delete({
        where: {
          supplierId_materialId: {
            supplierId,
            materialId,
          },
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting supplier pricing:", error);
    return NextResponse.json(
      { error: "Failed to delete supplier pricing" },
      { status: 500 }
    );
  }
}
