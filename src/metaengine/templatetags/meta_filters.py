from django import template
from metaengine.models import MetaField

register = template.Library()


@register.filter
def render_field(record, field):
    """
    Renders value properly depending on field type.
    """

    value = record.data.get(field.name)

    if field.field_type == "choice":
        choice = field.choices.filter(value=value, active=True).first()
        if choice:
            return choice.label

    return value or ""


@register.filter
def get_item(obj, key):

    if obj is None:
        return ""

    if isinstance(obj, dict):
        return obj.get(key, "")

    if hasattr(obj, key):
        return getattr(obj, key, "")

    return ""


@register.filter
def get_choice_label(field, value):
    """
    Given a MetaField and stored value,
    return the display label from MetaChoice.
    """

    if not value:
        return ""

    if field.field_type != "choice":
        return value

    for choice in field.choices.all():
        if str(choice.value) == str(value):
            return choice.label

    return value
