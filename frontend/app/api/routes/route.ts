import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import routesData from "@/data/routes.json";
import { withCache } from "@/lib/apiCache";
import { Route } from "@/types/types";

// GET handler to retrieve all routes
export async function GET() {
  // Use caching utility with a key for this endpoint
  return withCache("GET-/api/routes", async () => {
    try {
      return NextResponse.json({ routes: routesData });
    } catch (error) {
      console.error("Error loading routes:", error);
      return NextResponse.json(
        { error: "Failed to load routes" },
        { status: 500 }
      );
    }
  });
}

// POST handler to add a new route (in-memory only in this version)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newRoute = {
      ...body,
      id: `route-${uuidv4()}`,
    };
    return NextResponse.json({ route: newRoute });
  } catch (error) {
    console.error("Error creating route:", error);
    return NextResponse.json(
      { error: "Failed to create route" },
      { status: 500 }
    );
  }
}

// PUT handler to update a route (in-memory only in this version)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    const updatedRoute = { ...updates, id };
    return NextResponse.json({ route: updatedRoute });
  } catch (error) {
    console.error("Error updating route:", error);
    return NextResponse.json(
      { error: "Failed to update route" },
      { status: 500 }
    );
  }
}

// DELETE handler to remove a route (in-memory only in this version)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Route ID is required" },
        { status: 400 }
      );
    }

    // Find the route to return in response
    const route = routesData.find((r: Route) => r.id === id);
    if (!route) {
      return NextResponse.json({ error: "Route not found" }, { status: 404 });
    }

    return NextResponse.json({ route, success: true });
  } catch (error) {
    console.error("Error deleting route:", error);
    return NextResponse.json(
      { error: "Failed to delete route" },
      { status: 500 }
    );
  }
}
