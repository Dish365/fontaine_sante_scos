from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
import uuid

class Material(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    unit = models.CharField(max_length=50)  # e.g., kg, liters, pieces
    
    def __str__(self):
        return f"{self.name} ({self.unit})"

class Supplier(models.Model):
    TRANSPORTATION_CHOICES = [
        ('road', 'Road Transport'),
        ('rail', 'Rail Transport'),
        ('air', 'Air Transport'),
        ('sea', 'Sea Transport'),
        ('mixed', 'Mixed Transport'),
    ]
    
    ENVIRONMENTAL_CERTIFICATION_CHOICES = [
        ('iso14001', 'ISO 14001'),
        ('iso50001', 'ISO 50001'),
        ('green_business', 'Green Business Certification'),
        ('carbon_neutral', 'Carbon Neutral Certified'),
        ('none', 'No Certification'),
    ]
    
    name = models.CharField(max_length=200)
    contact_person = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    address = models.TextField()
    
    # Material and Cost Information
    materials = models.ManyToManyField(
        Material,
        through='SupplierMaterial',
        related_name='suppliers'
    )
    
    # Capacity Information
    min_supply_capacity = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Minimum supply capacity per order"
    )
    max_supply_capacity = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Maximum supply capacity per order"
    )
    current_capacity = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Current available capacity"
    )
    
    # Transportation Information
    transportation_mode = models.CharField(
        max_length=10,
        choices=TRANSPORTATION_CHOICES,
        default='road'
    )
    transportation_details = models.TextField(
        blank=True,
        help_text="Additional details about transportation methods and capabilities"
    )
    
    # Environmental Information
    environmental_certification = models.CharField(
        max_length=20,
        choices=ENVIRONMENTAL_CERTIFICATION_CHOICES,
        default='none',
        help_text="Environmental certification status"
    )
    carbon_footprint = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Annual carbon footprint in metric tons CO2e"
    )
    renewable_energy_usage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Percentage of energy from renewable sources"
    )
    waste_management_policy = models.TextField(
        blank=True,
        help_text="Description of waste management practices"
    )
    environmental_impact_report = models.URLField(
        blank=True,
        help_text="URL to latest environmental impact report"
    )
    sustainability_goals = models.TextField(
        blank=True,
        help_text="Description of sustainability goals and targets"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_suppliers'
    )
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return self.name 
    
    @property
    def total_orders(self):
        return self.orders.count()
    
    @property
    def order_history(self):
        return self.orders.all().order_by('-order_date')

class SupplierMaterial(models.Model):
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE)
    material = models.ForeignKey(Material, on_delete=models.CASCADE)
    cost_per_unit = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Cost per unit of the material"
    )
    lead_time = models.IntegerField(
        validators=[MinValueValidator(0)],
        help_text="Lead time in days"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['supplier', 'material']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.supplier.name} - {self.material.name}"

class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('in_progress', 'In Progress'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled')
    ]
    
    order_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    supplier = models.ForeignKey(
        Supplier,
        on_delete=models.CASCADE,
        related_name='orders'
    )
    order_date = models.DateTimeField(auto_now_add=True)
    expected_delivery_date = models.DateField()
    actual_delivery_date = models.DateField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    total_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_orders'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-order_date']
    
    def __str__(self):
        return f"Order {self.order_id} - {self.supplier.name}"
    
    def save(self, *args, **kwargs):
        if not self.total_amount:
            self.total_amount = sum(item.total_price for item in self.items.all())
        super().save(*args, **kwargs)

class OrderItem(models.Model):
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='items'
    )
    material = models.ForeignKey(Material, on_delete=models.PROTECT)
    quantity = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    unit_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    total_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.material.name} - {self.quantity} {self.material.unit}"
    
    def save(self, *args, **kwargs):
        if not self.total_price:
            self.total_price = self.quantity * self.unit_price
        super().save(*args, **kwargs)

class SupplierAssessment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled')
    ]
    
    supplier = models.ForeignKey(
        Supplier, 
        on_delete=models.CASCADE, 
        related_name='assessments'
    )
    title = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    assessment_date = models.DateField()
    next_assessment_date = models.DateField(null=True, blank=True)
    score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)]
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_supplier_assessments'
    )
    
    class Meta:
        ordering = ['-assessment_date', '-created_at']
        
    def __str__(self):
        return f"{self.title} - {self.supplier.name}" 