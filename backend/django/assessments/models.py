from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from suppliers.models import Supplier, Material

class Assessment(models.Model):
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE)
    material = models.ForeignKey(Material, on_delete=models.CASCADE)
    
    # Economic scores
    economic_score = models.FloatField(
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    transportation_cost = models.DecimalField(max_digits=10, decimal_places=2)
    tax_rate = models.FloatField(validators=[MinValueValidator(0), MaxValueValidator(100)])
    
    # Quality scores
    quality_score = models.FloatField(
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    quality_metrics = models.JSONField(default=dict)  # Store detailed quality metrics
    
    # Environmental scores
    environmental_score = models.FloatField(
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    carbon_footprint = models.FloatField()
    sustainability_metrics = models.JSONField(default=dict)
    
    # Metadata
    assessed_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True)
    assessment_date = models.DateTimeField(auto_now_add=True)
    valid_until = models.DateTimeField()
    
    def __str__(self):
        return f"Assessment for {self.supplier.name} - {self.material.name}"

class TradeoffAnalysis(models.Model):
    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE)
    economic_weight = models.FloatField(
        validators=[MinValueValidator(0), MaxValueValidator(1)]
    )
    quality_weight = models.FloatField(
        validators=[MinValueValidator(0), MaxValueValidator(1)]
    )
    environmental_weight = models.FloatField(
        validators=[MinValueValidator(0), MaxValueValidator(1)]
    )
    final_score = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True)
    
    def __str__(self):
        return f"Tradeoff Analysis for {self.assessment}"
