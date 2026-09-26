from django.contrib import admin

from .models import CatalogItem


@admin.register(CatalogItem)
class CatalogItemAdmin(admin.ModelAdmin):
    list_display = ("name", "item_type", "material", "color", "price", "stock_label", "active")
    list_filter = ("item_type", "material", "active", "featured")
    search_fields = ("name", "code", "color", "description")
    list_editable = ("price", "stock_label", "active")
    prepopulated_fields = {}
    fieldsets = (
        ("Información del producto", {"fields": ("name", "item_type", "material", "color", "description", "image")}),
        ("Venta e inventario", {"fields": ("price", "code", "stock_label", "active", "featured")}),
        ("Apariencia", {"fields": ("tone",), "description": "Usa un tono Filan: teal, red, yellow, mist, graphite o steel."}),
    )