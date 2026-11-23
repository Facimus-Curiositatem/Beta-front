import secrets
from dataclasses import dataclass, field


def unico(prefijo):
    """Nombre irrepetible, para que las pruebas no choquen entre si ni con ejecuciones anteriores."""
    return f"{prefijo} {secrets.token_hex(4)}"


@dataclass(frozen=True)
class Empresa:
    nombre: str
    nit: str
    correo_contacto: str
    nombre_admin: str
    correo_admin: str
    # repr=False: la contrasena no aparece si pytest imprime el objeto al fallar.
    contrasena_admin: str = field(repr=False)

    @classmethod
    def nueva(cls):
        sufijo = secrets.token_hex(4)
        return cls(
            nombre=f"Empresa E2E {sufijo}",
            nit=f"900{secrets.randbelow(10**6):06d}-{secrets.randbelow(10)}",
            correo_contacto=f"contacto-{sufijo}@example.com",
            nombre_admin="Administrador E2E",
            correo_admin=f"admin-{sufijo}@example.com",
            contrasena_admin=secrets.token_urlsafe(12),
        )


@dataclass(frozen=True)
class Registro:
    """Algo creado durante una prueba: su id en el backend y su nombre en pantalla."""

    id: int
    nombre: str
