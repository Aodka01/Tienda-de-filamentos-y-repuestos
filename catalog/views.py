from django.conf import settings
from django.shortcuts import render

from .models import CatalogItem


PRODUCTS = [
    {"name": "PLA Matte · Carbón", "type": "PLA", "price": "RD$ 1,190", "tone": "teal", "code": "PLA-M01", "stock": "En stock", "color": "Carbón", "description": "PLA Matte de superficie suave y color profundo. Ideal para prototipos, piezas decorativas y modelos con acabado mate."},
    {"name": "PLA Silk · Solar", "type": "PLA", "price": "RD$ 1,350", "tone": "yellow", "code": "PLA-S04", "stock": "En stock", "color": "Solar", "description": "PLA Silk con brillo intenso para piezas que necesitan una presencia especial y un acabado premium."},
    {"name": "PETG Tough · Rojo vivo", "type": "PETG", "price": "RD$ 1,290", "tone": "red", "code": "PETG-T02", "stock": "En stock", "color": "Rojo vivo", "description": "PETG resistente para piezas funcionales, soportes y proyectos de uso diario."},
    {"name": "PLA Matte · Niebla", "type": "PLA", "price": "RD$ 1,190", "tone": "mist", "code": "PLA-M07", "stock": "Pocas unidades", "color": "Niebla", "description": "PLA Matte de acabado limpio y uniforme para modelos con una estética suave y técnica."},
    {"name": "TPU Flex · Grafito", "type": "TPU", "price": "RD$ 1,490", "tone": "graphite", "code": "TPU-F01", "stock": "En stock", "color": "Grafito", "description": "TPU flexible para cubiertas, juntas, protectores y piezas que necesitan elasticidad."},
    {"name": "Repuesto hotend 0.4 mm", "type": "REPUESTOS", "price": "RD$ 890", "tone": "steel", "code": "REP-H04", "stock": "En stock", "color": "Acero", "description": "Hotend universal de 0.4 mm para mantener tu impresora lista y recuperar una extrusión estable."},
]


def home(request):
    database_products = CatalogItem.objects.filter(active=True)
    products = [
        {
            "name": item.name,
            "type": "REPUESTOS" if item.item_type == CatalogItem.SPARE else (item.material or item.item_type),
            "price": f"RD$ {item.price:,.0f}",
            "tone": item.tone,
            "code": item.code,
            "stock": item.stock_label,
            "image": item.image.url if item.image else "",
            "color": item.color,
            "material": item.material,
            "description": item.description or "Producto Filan seleccionado para acompañar tus proyectos de impresión 3D.",
            "item_type": item.item_type,
        }
        for item in database_products
    ]
    spare_products = [product for product in products if product["type"] == "REPUESTOS"]
    return render(request, "catalog/home.html", {"products": products or PRODUCTS, "spare_products": spare_products, "social_links": settings.SOCIAL_LINKS})