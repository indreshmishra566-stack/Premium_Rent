from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("cars", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="car",
            name="image_exterior",
            field=models.URLField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="car",
            name="image_interior",
            field=models.URLField(blank=True, null=True),
        ),
    ]
