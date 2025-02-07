from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

class Material(models.Model):
    CATEGORIES = (
        ('raw', 'Raw Materials'),
        ('packaging', 'Packaging Materials'),
        ('ingredients', 'Ingredients'),
    )
    
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=100, choices=CATEGORIES)
    description = models.TextField(blank=True)
    unit = models.CharField(max_length=20)
    specifications = models.JSONField(default=dict)  # Store material specifications
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} ({self.category})"

class Supplier(models.Model):
    name = models.CharField(max_length=200)
    location = models.CharField(max_length=200)
    country = models.CharField(max_length=100)
    contact_person = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    materials = models.ManyToManyField(Material, through='SupplierMaterial')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} - {self.country}"

class SupplierMaterial(models.Model):
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE)
    material = models.ForeignKey(Material, on_delete=models.CASCADE)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    minimum_order = models.PositiveIntegerField()
    lead_time_days = models.PositiveIntegerField()
    
    class Meta:
        unique_together = ('supplier', 'material')
