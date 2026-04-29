

from django.db import models

class Car(models.Model):
    brand = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    price_per_day = models.IntegerField()
    image = models.URLField()
    image_exterior = models.URLField(blank=True, null=True)
    image_interior = models.URLField(blank=True, null=True)
    description = models.TextField()

    def __str__(self):
        return self.model


class Booking(models.Model):
    car = models.ForeignKey(Car, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField()