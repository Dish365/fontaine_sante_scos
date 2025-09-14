# Generated manually to add is_active field to Supplier model

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('suppliers', '0003_supplier_transportation_modes_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='supplier',
            name='is_active',
            field=models.BooleanField(default=True, help_text='Whether this supplier is active'),
        ),
    ] 