from django.db import models

# Create your models here.
from django.db import models


from tenants.models import Tenant


class Module(models.Model):
    name = models.CharField(max_length=100, unique=True)
    label = models.CharField(max_length=150)
    active = models.BooleanField(default=True)

    def __str__(self):
        return self.label
    
    
class TenantModule(models.Model):
    tenant = models.ForeignKey("tenants.Tenant", on_delete=models.CASCADE)
    module = models.ForeignKey("Module", on_delete=models.CASCADE)

    active = models.BooleanField(default=False)
    provisioned = models.BooleanField(default=False)

    activated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("tenant", "module")

    def __str__(self):
        return f"{self.tenant} - {self.module}"

    def save(self, *args, **kwargs):

        is_new = self.pk is None
        previous_active = None

        if not is_new:
            previous = TenantModule.objects.get(pk=self.pk)
            previous_active = previous.active

        super().save(*args, **kwargs)

        if self.active and (is_new or previous_active is False):
            from platformcore.services.provisioning import provision_module_to_tenant
            provision_module_to_tenant(self)
