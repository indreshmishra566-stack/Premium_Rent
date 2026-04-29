from django.core.management.base import BaseCommand

from cars.models import Car


FLEET = [
    {
        "brand": "BMW",
        "model": "M2",
        "price_per_day": 999,
        "image": "https://commons.wikimedia.org/wiki/Special:FilePath/BMW_M2_%282%29.jpg?width=1400",
        "image_exterior": "https://commons.wikimedia.org/wiki/Special:FilePath/BMW_M2_%282%29.jpg?width=1400",
        "image_interior": "https://commons.wikimedia.org/wiki/Special:FilePath/2018_BMW_M2_Coup%C3%A9_Interior.jpg?width=1400",
        "description": "Compact performance coupe with sharp handling and premium cabin finish.",
    },
    {
        "brand": "BMW",
        "model": "M3",
        "price_per_day": 2999,
        "image": "https://commons.wikimedia.org/wiki/Special:FilePath/BMW_M3.jpg?width=1400",
        "image_exterior": "https://commons.wikimedia.org/wiki/Special:FilePath/BMW_M3.jpg?width=1400",
        "image_interior": "https://commons.wikimedia.org/wiki/Special:FilePath/2018_BMW_M3_Interior.jpg?width=1400",
        "description": "Executive performance sedan for fast city drives and weekend touring.",
    },
    {
        "brand": "Porsche",
        "model": "911",
        "price_per_day": 4999,
        "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Porsche_911_991.2_Carrera_GTS_red_%281%29.jpg?width=1400",
        "image_exterior": "https://commons.wikimedia.org/wiki/Special:FilePath/Porsche_911_991.2_Carrera_GTS_red_%281%29.jpg?width=1400",
        "image_interior": "https://commons.wikimedia.org/wiki/Special:FilePath/Porsche_911_Interior_%284488308573%29.jpg?width=1400",
        "description": "Iconic sports car with precise steering and unmistakable road presence.",
    },
    {
        "brand": "BMW",
        "model": "M5",
        "price_per_day": 5999,
        "image": "https://commons.wikimedia.org/wiki/Special:FilePath/BMW_M5_%28F90%29_IMG_4432.jpg?width=1400",
        "image_exterior": "https://commons.wikimedia.org/wiki/Special:FilePath/BMW_M5_%28F90%29_IMG_4432.jpg?width=1400",
        "image_interior": "https://commons.wikimedia.org/wiki/Special:FilePath/BMW_E60_M5_Interior.JPG?width=1400",
        "description": "Luxury super sedan with comfort, speed, and a refined interior.",
    },
    {
        "brand": "Mercedes-Benz",
        "model": "C-Class",
        "price_per_day": 6999,
        "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Mercedes_C_Class.jpg?width=1400",
        "image_exterior": "https://commons.wikimedia.org/wiki/Special:FilePath/Mercedes_C_Class.jpg?width=1400",
        "image_interior": "https://commons.wikimedia.org/wiki/Special:FilePath/The_interior_of_Mercedes-Benz_C_200_AVANTGARDE_%28W206%29.jpg?width=1400",
        "description": "Polished Mercedes luxury sedan with a calm cabin and executive ride quality.",
    },
]


class Command(BaseCommand):
    help = "Create or update the default Luxdrive car fleet with working image URLs."

    def handle(self, *args, **options):
        for car_data in FLEET:
            car, _ = Car.objects.update_or_create(
                brand__iexact=car_data["brand"],
                model__iexact=car_data["model"],
                defaults=car_data,
            )
            self.stdout.write(self.style.SUCCESS(f"Seeded {car.brand} {car.model}"))
