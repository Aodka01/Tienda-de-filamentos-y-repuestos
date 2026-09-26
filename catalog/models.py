from PIL import Image, UnidentifiedImageError
from django.db import models
from django.core.exceptions import ValidationError


def validate_catalog_image(upload):
    try:
        with Image.open(upload) as image:
            if image.width < 300 or image.height < 300:
                raise ValidationError("La imagen debe tener al menos 300 x 300 píxeles.")
            image.verify()
    except (UnidentifiedImageError, OSError) as error:
        raise ValidationError("Sube una imagen JPG, PNG o WEBP válida.") from error


class CatalogItem(models.Model):
    FILAMENT = "FILAMENTO"
    SPARE = "REPUESTO"
    ACCESSORY = "ACCESORIO"
    ITEM_TYPES = [(FILAMENT, "Filamento"), (SPARE, "Repuesto"), (ACCESSORY, "Accesorio")]

    PLA = "PLA"
    PETG = "PETG"
    TPU = "TPU"
    OTHER = "OTRO"
    MATERIALS = [(PLA, "PLA"), (PETG, "PETG"), (TPU, "TPU"), (OTHER, "Otro")]

    name = models.CharField("nombre", max_length=120)
    item_type = models.CharField("tipo", max_length=20, choices=ITEM_TYPES, default=FILAMENT)
    material = models.CharField("material", max_length=20, choices=MATERIALS, blank=True)
    color = models.CharField("color", max_length=40, blank=True, help_text="Ejemplo: Carbón, Rojo vivo o Solar")
    price = models.DecimalField("precio", max_digits=10, decimal_places=2)
    code = models.CharField("código", max_length=30, unique=True)
    tone = models.CharField("tono visual", max_length=20, default="teal", help_text="teal, red, yellow, mist, graphite o steel")
    stock_label = models.CharField("estado de inventario", max_length=40, default="En stock")
    description = models.TextField("descripción", blank=True)
    image = models.ImageField("imagen del producto", upload_to="catalog/%Y/%m/", blank=True, null=True, validators=[validate_catalog_image], help_text="Sube una foto de la caja, bobina o pieza. Mínimo 300 x 300 px.")
    active = models.BooleanField("visible en la tienda", default=True)
    featured = models.BooleanField("destacado", default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-featured", "name"]
        verbose_name = "producto"
        verbose_name_plural = "productos"

    def __str__(self):
        return f"{self.name} ({self.code})"