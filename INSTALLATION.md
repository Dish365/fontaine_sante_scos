# Supply Chain Management System Installation

## Project Structure

- `frontend/`: Next.js 14 application
- `prisma/`: Database schema and migrations

## Prerequisites

- Node.js v18+
- pnpm v8+
- PostgreSQL 15+
- Python 3.10+ (optional, for potential analytics scripts)

## 1. Frontend Setup

```bash
cd frontend
pnpm install
pnpm add @reactflow/reactflow-renderer react-leaflet leaflet @types/leaflet @radix-ui/react-dropdown-menu @radix-ui/react-tabs lucide-react recharts @tanstack/react-table framer-motion react-hook-form zod
```

### Visualization Dependencies

```bash
cd frontend
# Core mapping and visualization packages
pnpm install leaflet react-leaflet recharts
# Additional visualization packages
pnpm install leaflet-routing-machine
# Types for TypeScript support
pnpm install @types/leaflet @types/react-leaflet
```

## 2. Database Setup

```bash
# Install Prisma CLI globally
pnpm add -g prisma

# Install database dependencies
cd ../prisma
pnpm install @prisma/client
```

## 3. Environment Variables

Create `.env` in root directory:

```env
# Frontend
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/supplychain?schema=public"
```

## 4. Database Initialization

```bash
# Apply migrations
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate
```

## 5. Development

```bash
# Start frontend
cd ../frontend
pnpm dev

# Start database (in separate terminal)
docker-compose up -d
```

## Python Requirements (optional)

Create `requirements.txt` for analytics scripts:

```txt
pandas==2.2.2
numpy==1.26.4
matplotlib==3.8.3
scikit-learn==1.4.1.post1
jupyterlab==4.0.11
```

Install Python dependencies:

```bash
pip install -r requirements.txt
```

## Critical Dependencies

| Package                   | Purpose                               |
| ------------------------- | ------------------------------------- |
| `@reactflow/reactflow`    | Supply chain visualization            |
| `leaflet`                 | Core mapping library                  |
| `react-leaflet`           | React components for Leaflet maps     |
| `leaflet-routing-machine` | Route visualization with curved lines |
| `@tanstack/react-table`   | Data tables                           |
| `@radix-ui/*`             | Accessible UI components              |
| `zod`                     | Data validation                       |
| `@prisma/client`          | Database ORM                          |
| `recharts`                | Analytics charts                      |
| `lucide-react`            | Icon library for UI elements          |
| `framer-motion`           | Animation library                     |

## Troubleshooting Map Visualization

If you encounter issues with map markers not displaying:

1. Ensure all dependencies are installed correctly
2. Check browser console for any errors related to Leaflet
3. Verify that supplier and warehouse data includes valid coordinates
4. Try using standard Leaflet markers instead of custom icons if custom markers don't appear
