# PowerShell script to add a mockup warehouse to warehouses.json

# Define the data directory path
$dataDir = Join-Path $PSScriptRoot ".." "data"
$warehousesFile = Join-Path $dataDir "warehouses.json"

# Ensure the data directory exists
if (-not (Test-Path $dataDir)) {
    Write-Host "Creating data directory..."
    New-Item -ItemType Directory -Path $dataDir -Force | Out-Null
}

# Generate a unique ID for the warehouse
$timestamp = Get-Date -UFormat "%s"
if (-not $timestamp) {
    # Fallback for Windows PowerShell which doesn't support %s
    $timestamp = [int](Get-Date -UFormat "%s" -Millisecond 0).ToFileTime()
}
$randomString = -join ((65..90) + (97..122) | Get-Random -Count 8 | ForEach-Object { [char]$_ })
$warehouseId = "wh-$timestamp-$randomString"

# Create the warehouse object
$warehouse = @{
    id = $warehouseId
    name = "Central Distribution Center"
    type = "Distribution"
    location = @{
        address = "123 Logistics Way, Chicago, IL 60007"
        lat = 41.8781
        lng = -87.6298
    }
    capacity = @{
        maxCapacity = 50000
        currentUtilization = 32000
        unit = "sq ft"
    }
    suppliers = @()
    materials = @()
    transitTimes = @{
        inbound = 3
        outbound = 2
    }
    operationalCost = 12500
    createdAt = (Get-Date).ToString("o")
    updatedAt = (Get-Date).ToString("o")
}

# Read existing warehouses or create an empty array
if (Test-Path $warehousesFile) {
    Write-Host "Reading existing warehouses file..."
    $warehousesJson = Get-Content $warehousesFile -Raw
    if ([string]::IsNullOrWhiteSpace($warehousesJson)) {
        $warehouses = @()
    } else {
        $warehouses = $warehousesJson | ConvertFrom-Json
        if ($null -eq $warehouses) {
            $warehouses = @()
        }
    }
} else {
    Write-Host "Warehouses file doesn't exist, creating new one..."
    $warehouses = @()
}

# Add the new warehouse to the array
$warehouses += $warehouse

# Convert to JSON and save to file
Write-Host "Saving updated warehouses file..."
$warehousesJson = $warehouses | ConvertTo-Json -Depth 10
Set-Content -Path $warehousesFile -Value $warehousesJson

Write-Host "Mockup warehouse added successfully with ID: $warehouseId"
Write-Host "Warehouse data saved to: $warehousesFile" 