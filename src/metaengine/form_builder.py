from django import forms
from .models import MetaField


def build_dynamic_form(table):

    fields = MetaField.objects.filter(table=table).order_by("order")

    form_fields = {}

    for field in fields:

        if field.field_type == "string":
            form_fields[field.name] = forms.CharField(
                label=field.label,
                required=field.required,
                max_length=field.max_length or 255,
                initial=field.default_value,
                help_text=field.help_text
            )

        elif field.field_type == "text":
            form_fields[field.name] = forms.CharField(
                label=field.label,
                required=field.required,
                widget=forms.Textarea,
                initial=field.default_value,
                help_text=field.help_text
            )

        elif field.field_type == "integer":
            form_fields[field.name] = forms.IntegerField(
                label=field.label,
                required=field.required,
                initial=field.default_value,
                help_text=field.help_text
            )

        elif field.field_type == "boolean":
            form_fields[field.name] = forms.BooleanField(
                label=field.label,
                required=False,
                initial=field.default_value
            )

        elif field.field_type == "choice":
            choices = [
                (c.value, c.label)
                for c in field.choices.filter(active=True).order_by("order")
            ]

            form_fields[field.name] = forms.ChoiceField(
                label=field.label,
                choices=choices,
                required=field.required,
                help_text=field.help_text
            )

        elif field.field_type == "reference":

            related_table = field.reference_table

            if related_table:
                from .models import DynamicRecord

                records = DynamicRecord.objects.filter(table=related_table)

                choices = [
                    (str(r.sys_id), r.number)
                    for r in records
                ]

                form_fields[field.name] = forms.ChoiceField(
                    label=field.label,
                    choices=choices,
                    required=field.required
                )

    return type(
        f"{table.name.capitalize()}Form",
        (forms.Form,),
        form_fields
    )
